import { Router } from "express";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import { MCQTestModel, MCQAttemptModel } from "../models/mcq.model";
import { Types } from "mongoose";
import { NotificationModel, NotificationType } from "../models/notification.model";

const router = Router();

// ─── GET /api/mcq — list published tests ─────────────────────────────────────
router.get("/api/mcq", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.query as Record<string, string>;
    const query: Record<string, any> = { is_published: true, deletedAt: null };
    if (courseId) query.course_id = new Types.ObjectId(courseId);

    const tests = await MCQTestModel.find(query)
      .select("-questions.correct_index -questions.explanation")
      .lean();
    res.json({ tests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

// ─── GET /api/mcq/:id — get test (without correct answers) ───────────────────
router.get("/api/mcq/:id", requireAuth, async (req, res) => {
  try {
    const test = await MCQTestModel.findOne({ _id: req.params.id, deletedAt: null })
      .select("-questions.correct_index -questions.explanation")
      .lean();
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch test" });
  }
});

// ─── POST /api/mcq/:id/submit — submit answers ────────────────────────────────
router.post("/api/mcq/:id/submit", requireAuth, async (req, res) => {
  try {
    const { answers } = req.body as { answers: { question_id: string; selected_index: number }[] };
    if (!Array.isArray(answers)) return res.status(400).json({ error: "answers array required" });

    const test = await MCQTestModel.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!test) return res.status(404).json({ error: "Test not found" });

    // Score the attempt
    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const question = test.questions.find((q) => q._id.toString() === a.question_id);
      const correct = question ? question.correct_index : -1;
      const isCorrect = question ? a.selected_index === correct : false;
      if (isCorrect) score++;
      return {
        question_id: new Types.ObjectId(a.question_id),
        selected_index: a.selected_index,
      };
    });

    const attempt = await MCQAttemptModel.create({
      user_id: new Types.ObjectId(String((req as any).user?.id)),
      test_id: new Types.ObjectId(String(req.params.id)),
      answers: gradedAnswers,
      score,
      total: test.questions.length,
      completed_at: new Date(),
    });

    // Build result with explanations
    const result = test.questions.map((q, i) => {
      const submitted = answers.find((a) => a.question_id === q._id.toString());
      return {
        question: q.question,
        options: q.options,
        selectedIndex: submitted?.selected_index ?? -1,
        correctIndex: q.correct_index,
        isCorrect: submitted?.selected_index === q.correct_index,
        explanation: q.explanation,
      };
    });

    res.json({ score, total: test.questions.length, percentage: Math.round((score / test.questions.length) * 100), result, attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit test" });
  }
});

// ─── GET /api/mcq/:id/attempts — my attempts for a test ──────────────────────
router.get("/api/mcq/:id/attempts", requireAuth, async (req, res) => {
  try {
    const attempts = await MCQAttemptModel.find({
      user_id: new Types.ObjectId(String((req as any).user?.id)),
      test_id: new Types.ObjectId(String(req.params.id)),
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
});

// ─── ADMIN: POST /api/admin/mcq ───────────────────────────────────────────────
router.post("/api/admin/mcq", requireAdmin, async (req, res) => {
  try {
    const test = await MCQTestModel.create(req.body);

    await NotificationModel.create({
      user_id: null,
      title: "New Quiz Available!",
      body: `A new quiz is available: ${test.title}`,
      type: NotificationType.NewQuiz,
      link: `/quizzes/${test._id}`,
    });

    res.status(201).json({ test });
  } catch (err) {
    res.status(500).json({ error: "Failed to create test" });
  }
});

// ─── ADMIN: PUT /api/admin/mcq/:id ───────────────────────────────────────────
router.put("/api/admin/mcq/:id", requireAdmin, async (req, res) => {
  try {
    const test = await MCQTestModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ error: "Not found" });
    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: "Failed to update test" });
  }
});

// ─── ADMIN: DELETE /api/admin/mcq/:id ────────────────────────────────────────
router.delete("/api/admin/mcq/:id", requireAdmin, async (req, res) => {
  try {
    await MCQTestModel.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
