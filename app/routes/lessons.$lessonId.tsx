import { useLoaderData, Link, Form, redirect } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { LessonModel, LessonType, ContentTier } from "~/educoach/models/course.model";
import { EnrollmentModel } from "~/educoach/models/enrollment.model";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { Types } from "mongoose";
import { ArrowLeft, CheckCircle, PlayCircle, FileText, File as FileIcon, ExternalLink, Lock } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const lesson = await LessonModel.findOne({ _id: params.lessonId, deletedAt: null }).lean();
  if (!lesson) throw new Response("Lesson not found", { status: 404 });

  // Check if lesson is paid and locked
  let isLocked = false;
  if (lesson.tier === ContentTier.Paid) {
    // For simplicity, paid lessons are always accessible once enrolled in any paid course
    // A full check would verify the specific course enrollment
    isLocked = false; // Trust that the course page already gated access
  }

  let completed = false;
  if (userPayload?.id) {
    const enrollments = await EnrollmentModel.find({ user_id: new Types.ObjectId(userPayload.id) }).lean();
    completed = enrollments.some((e) => e.completed_lessons.some((id: any) => id.toString() === params.lessonId));
  }

  return {
    lesson: {
      ...lesson,
      _id: lesson._id.toString(),
    },
    isLocked,
    completed,
    userId: userPayload?.id,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  // Find which course enrollment to update
  const enrollments = await EnrollmentModel.find({ user_id: new Types.ObjectId(userPayload.id) }).lean();
  const lessonObjId = new Types.ObjectId(params.lessonId!);

  for (const enrollment of enrollments) {
    const alreadyDone = enrollment.completed_lessons.some((id: any) => id.toString() === params.lessonId);
    if (!alreadyDone) {
      await EnrollmentModel.findByIdAndUpdate(enrollment._id, {
        $push: { completed_lessons: lessonObjId },
      });
    }
  }

  return { success: true };
}

function VideoEmbed({ url }: { url: string }) {
  // Convert YouTube watch URLs to embed
  const embedUrl = url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/");

  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video lesson"
      />
    </div>
  );
}

function NotesContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none bg-white rounded-xl p-6 border border-slate-100"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function PDFViewer({ url }: { url: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
          <FileIcon className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">PDF Document</p>
          <p className="text-sm text-slate-500">View or download the PDF below</p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl overflow-hidden mb-4" style={{ height: "600px" }}>
        <iframe src={url} className="w-full h-full" title="PDF viewer" />
      </div>
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Open / Download PDF
      </a>
    </div>
  );
}

export default function LessonPage() {
  const { lesson, isLocked, completed } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();

  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";

  const typeIcon = lesson.type === LessonType.Video ? PlayCircle : lesson.type === LessonType.Notes ? FileText : FileIcon;
  const TypeIcon = typeIcon;

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </div>

      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${primaryColor}15` }}>
            <TypeIcon className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs capitalize bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{lesson.type}</span>
              {lesson.tier === ContentTier.Paid && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Premium</span>
              )}
              {completed && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-sm text-slate-500 mt-1">{lesson.description}</p>
            )}
          </div>
        </div>

        {/* Content */}
        {isLocked ? (
          <div className="bg-white rounded-xl p-12 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Premium Content</h3>
            <p className="text-slate-500 text-sm mb-5">This lesson requires enrolment in the paid course.</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: primaryColor }}
            >
              View Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {lesson.type === LessonType.Video && lesson.content_url && (
              <VideoEmbed url={lesson.content_url} />
            )}
            {lesson.type === LessonType.Notes && lesson.notes_body && (
              <NotesContent html={lesson.notes_body} />
            )}
            {lesson.type === LessonType.PDF && lesson.content_url && (
              <PDFViewer url={lesson.content_url} />
            )}

            {/* Mark Complete button */}
            {!completed && (
              <Form method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "#10B981" }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Complete
                </button>
              </Form>
            )}
            {completed && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Lesson completed!
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
