/**
 * EduCoach domain routes — courses, lessons, MCQ, notifications, queries.
 * Registered via the auto-discovery system (scans app/modules/<slug>/src/routes/).
 */
import { Router } from "express";
import coursesRouter from "~/educoach/routes/courses.routes";
import mcqRouter from "~/educoach/routes/mcq.routes";
import notificationsRouter from "~/educoach/routes/notifications.routes";
import queriesRouter from "~/educoach/routes/queries.routes";

const router = Router();

router.use(coursesRouter);
router.use(mcqRouter);
router.use(notificationsRouter);
router.use(queriesRouter);

export default router;
