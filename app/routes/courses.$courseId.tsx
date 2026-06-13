import { useLoaderData, Link, Form, redirect, useNavigation } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { CourseModel, ContentTier, LessonType } from "~/educoach/models/course.model";
import { EnrollmentModel } from "~/educoach/models/enrollment.model";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { Types } from "mongoose";
import {
  PlayCircle,
  FileText,
  File as FileIcon,
  Lock,
  CheckCircle,
  ChevronDown,
  ArrowLeft,
  Clock,
  BookOpen,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { courseId } = params;
  const course = await CourseModel.findOne({ _id: courseId, is_published: true, deletedAt: null })
    .populate({ path: "topics", populate: { path: "lessons" } })
    .lean();

  if (!course) throw new Response("Course not found", { status: 404 });

  const userPayload = getUserFromRequest(request);
  let enrollment: any = null;
  let completedLessons: string[] = [];

  if (userPayload?.id) {
    enrollment = await EnrollmentModel.findOne({
      user_id: new Types.ObjectId(userPayload.id),
      course_id: new Types.ObjectId(courseId!),
    }).lean();
    if (enrollment) {
      completedLessons = enrollment.completed_lessons.map((id: any) => id.toString());
    }
  }

  const isEnrolled = !!enrollment;
  const isPaidAndLocked = course.tier === ContentTier.Paid && !isEnrolled;

  // Compute topic/lesson counts
  const topics = (course.topics as any[]).map((topic: any) => ({
    ...topic,
    _id: topic._id.toString(),
    lessons: topic.lessons.map((lesson: any) => ({
      ...lesson,
      _id: lesson._id.toString(),
      locked: isPaidAndLocked && lesson.tier === ContentTier.Paid,
      completed: completedLessons.includes(lesson._id.toString()),
      content_url: isPaidAndLocked && lesson.tier === ContentTier.Paid ? "" : lesson.content_url,
      notes_body: isPaidAndLocked && lesson.tier === ContentTier.Paid ? "" : lesson.notes_body,
    })),
  }));

  const totalLessons = topics.reduce((acc: number, t: any) => acc + t.lessons.length, 0);
  const completedCount = completedLessons.length;

  return {
    course: {
      ...course,
      _id: course._id.toString(),
      topics,
    },
    isEnrolled,
    isPaidAndLocked,
    completedLessons,
    completedCount,
    totalLessons,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { courseId } = params;
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const course = await CourseModel.findOne({ _id: courseId, deletedAt: null }).lean();
  if (!course) throw new Response("Not found", { status: 404 });

  if (course.tier === ContentTier.Paid) {
    // Redirect to payment page (stub)
    return redirect(`/courses/${courseId}/payment`);
  }

  const existing = await EnrollmentModel.findOne({
    user_id: new Types.ObjectId(userPayload.id),
    course_id: new Types.ObjectId(courseId!),
  });
  if (!existing) {
    await EnrollmentModel.create({
      user_id: new Types.ObjectId(userPayload.id),
      course_id: new Types.ObjectId(courseId!),
    });
  }
  return redirect(`/courses/${courseId}`);
}

function LessonTypeIcon({ type }: { type: string }) {
  if (type === LessonType.Video) return <PlayCircle className="w-4 h-4 text-indigo-500" />;
  if (type === LessonType.Notes) return <FileText className="w-4 h-4 text-emerald-500" />;
  return <FileIcon className="w-4 h-4 text-amber-500" />;
}

function TopicAccordion({ topic, isEnrolled, primaryColor }: { topic: any; isEnrolled: boolean; primaryColor: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-800 text-sm">{topic.title}</span>
          <span className="text-xs text-slate-400">{topic.lessons.length} lesson{topic.lessons.length !== 1 ? "s" : ""}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="divide-y divide-slate-100">
          {topic.lessons.map((lesson: any) => (
            <li key={lesson._id}>
              {lesson.locked ? (
                <div className="flex items-center gap-3 px-5 py-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm line-through">{lesson.title}</span>
                  <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">Locked</span>
                </div>
              ) : (
                <Link
                  to={`/lessons/${lesson._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50 transition-colors group"
                >
                  {lesson.completed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <LessonTypeIcon type={lesson.type} />
                  )}
                  <span className={`text-sm flex-1 ${lesson.completed ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-indigo-700"}`}>
                    {lesson.title}
                  </span>
                  {lesson.duration_seconds > 0 && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil(lesson.duration_seconds / 60)}m
                    </span>
                  )}
                  <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{
                    background: lesson.type === "video" ? "#EEF2FF" : lesson.type === "notes" ? "#ECFDF5" : "#FFFBEB",
                    color: lesson.type === "video" ? "#4338CA" : lesson.type === "notes" ? "#059669" : "#D97706",
                  }}>
                    {lesson.type}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const { course, isEnrolled, isPaidAndLocked, completedCount, totalLessons } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const navigation = useNavigation();

  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";
  const accentColor = loading ? "#F59E0B" : config?.brandColor?.secondary ?? "#F59E0B";

  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            {course.thumbnail_url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-5 bg-slate-100">
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {course.category && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{course.category}</span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${course.tier === "free" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {course.tier === "free" ? "Free" : `₹${course.price?.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">{course.title}</h1>
              </div>
            </div>
            {course.description && (
              <p className="text-slate-600 text-sm leading-relaxed">{course.description}</p>
            )}
          </div>

          {/* Curriculum */}
          <div>
            <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
              Curriculum
            </h2>
            {course.topics.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-slate-400 border border-slate-100">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Lessons coming soon</p>
              </div>
            ) : (
              course.topics.map((topic: any) => (
                <TopicAccordion key={topic._id} topic={topic} isEnrolled={isEnrolled} primaryColor={primaryColor} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24">
            {/* Progress */}
            {isEnrolled && totalLessons > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">Your Progress</span>
                  <span className="text-sm font-bold" style={{ color: primaryColor }}>{progressPct}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progressPct}%`, background: primaryColor }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{completedCount} / {totalLessons} lessons completed</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="font-bold text-slate-900">{course.topics.length}</div>
                <div className="text-xs text-slate-500">Topics</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="font-bold text-slate-900">{totalLessons}</div>
                <div className="text-xs text-slate-500">Lessons</div>
              </div>
            </div>

            {/* CTA */}
            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Enrolled
                </div>
                {course.topics.length > 0 && course.topics[0].lessons.length > 0 && (
                  <Link
                    to={`/lessons/${course.topics[0].lessons[0]._id}`}
                    className="block w-full text-center px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                    style={{ background: primaryColor }}
                  >
                    Continue Learning
                  </Link>
                )}
              </div>
            ) : isPaidAndLocked ? (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">₹{course.price?.toLocaleString("en-IN")}</div>
                  <div className="text-xs text-slate-400">One-time payment</div>
                </div>
                <Form method="post">
                  <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: accentColor, color: "#1E293B" }}
                  >
                    {navigation.state === "submitting" ? "Processing..." : "Enrol Now"}
                  </button>
                </Form>
              </div>
            ) : (
              <Form method="post">
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="w-full px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: primaryColor }}
                >
                  {navigation.state === "submitting" ? "Enrolling..." : "Enrol for Free"}
                </button>
              </Form>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
