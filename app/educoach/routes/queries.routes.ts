import { Router } from "express";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import { QueryModel } from "../models/query.model";
import { Types } from "mongoose";
import { NotificationModel, NotificationType } from "../models/notification.model";

const router = Router();

// ─── GET /api/queries — list queries ─────────────────────────────────────────
router.get("/api/queries", requireAuth, async (req, res) => {
  try {
    const { courseId, page = "1", limit = "20", resolved } = req.query as Record<string, string>;
    const query: Record<string, any> = { deletedAt: null };
    if (courseId) query.course_id = new Types.ObjectId(courseId);
    if (resolved !== undefined) query.is_resolved = resolved === "true";

    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (Math.max(1, parseInt(page)) - 1) * limitNum;

    const [queries, total] = await Promise.all([
      QueryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      QueryModel.countDocuments(query),
    ]);

    res.json({ queries, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch queries" });
  }
});

// ─── GET /api/queries/:id — single query with replies ────────────────────────
router.get("/api/queries/:id", requireAuth, async (req, res) => {
  try {
    const query = await QueryModel.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!query) return res.status(404).json({ error: "Not found" });
    res.json({ query });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch query" });
  }
});

// ─── POST /api/queries — post a new query ────────────────────────────────────
router.post("/api/queries", requireAuth, async (req, res) => {
  try {
    const { title, body, course_id } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const query = await QueryModel.create({
      author_id: new Types.ObjectId(String((req as any).user?.id)),
      author_name: (req as any).user.username ?? (req as any).user.email,
      title,
      body: body ?? "",
      course_id: course_id ? new Types.ObjectId(course_id) : null,
    });

    res.status(201).json({ query });
  } catch (err) {
    res.status(500).json({ error: "Failed to post query" });
  }
});

// ─── POST /api/queries/:id/reply — add a reply ───────────────────────────────
router.post("/api/queries/:id/reply", requireAuth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: "body required" });

    const isInstructor = (req as any).user.role === "admin";

    const reply = {
      _id: new Types.ObjectId(),
      author_id: new Types.ObjectId(String((req as any).user?.id)),
      author_name: (req as any).user.username ?? (req as any).user.email,
      is_instructor: isInstructor,
      body,
      is_accepted: false,
      created_at: new Date(),
    };

    const updated = await QueryModel.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: reply } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Query not found" });

    // Notify the original query author
    await NotificationModel.create({
      user_id: updated.author_id,
      title: "New reply to your query",
      body: `${reply.author_name} replied to: "${updated.title}"`,
      type: NotificationType.QueryReply,
      link: `/queries/${req.params.id}`,
    });

    res.json({ query: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to post reply" });
  }
});

// ─── POST /api/queries/:id/accept-reply — accept an answer ───────────────────
router.post("/api/queries/:queryId/accept-reply/:replyId", requireAuth, async (req, res) => {
  try {
    const { queryId, replyId } = req.params;

    const query = await QueryModel.findById(queryId);
    if (!query) return res.status(404).json({ error: "Not found" });

    // Only the author can accept
    if (query.author_id.toString() !== (req as any).user?.id) {
      return res.status(403).json({ error: "Only the question author can accept an answer" });
    }

    // Clear existing accepted, then accept the target
    query.replies = query.replies.map((r) => ({
      ...r,
      is_accepted: r._id.toString() === replyId,
    })) as any;

    query.is_resolved = true;
    await query.save();

    res.json({ query: query.toObject() });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept reply" });
  }
});

// ─── DELETE /api/queries/:id — soft delete own query ─────────────────────────
router.delete("/api/queries/:id", requireAuth, async (req, res) => {
  try {
    const query = await QueryModel.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Not found" });

    const isOwner = query.author_id.toString() === (req as any).user?.id;
    const isAdmin = (req as any).user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    await QueryModel.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
