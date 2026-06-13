import { Router } from "express";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import { NotificationModel, NotificationType } from "../models/notification.model";
import { Types } from "mongoose";

const router = Router();

// ─── GET /api/notifications — my notifications ───────────────────────────────
router.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const userId = new Types.ObjectId(String((req as any).user?.id));
    const { limit = "20", page = "1" } = req.query as Record<string, string>;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (Math.max(1, parseInt(page)) - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel.find({
        $or: [{ user_id: userId }, { user_id: null }],
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      NotificationModel.countDocuments({
        $or: [{ user_id: userId }, { user_id: null }],
        deletedAt: null,
      }),
      NotificationModel.countDocuments({
        $or: [{ user_id: userId }, { user_id: null }],
        deletedAt: null,
        is_read: false,
      }),
    ]);

    res.json({ notifications, total, unreadCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ─── POST /api/notifications/:id/read — mark as read ─────────────────────────
router.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    await NotificationModel.findByIdAndUpdate(req.params.id, { is_read: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// ─── POST /api/notifications/read-all — mark all read ────────────────────────
router.post("/api/notifications/read-all", requireAuth, async (req, res) => {
  try {
    const userId = new Types.ObjectId(String((req as any).user?.id));
    await NotificationModel.updateMany(
      { $or: [{ user_id: userId }, { user_id: null }], is_read: false },
      { is_read: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// ─── ADMIN: POST /api/admin/notifications ────────────────────────────────────
router.post("/api/admin/notifications", requireAdmin, async (req, res) => {
  try {
    const { title, body, type, link, user_id } = req.body;
    const notification = await NotificationModel.create({
      user_id: user_id ? new Types.ObjectId(user_id) : null,
      title,
      body,
      type: type ?? NotificationType.Announcement,
      link: link ?? "",
    });
    res.status(201).json({ notification });
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

export default router;
