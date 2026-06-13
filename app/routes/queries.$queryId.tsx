import { useLoaderData, Link, redirect, Form, useNavigation, useRevalidator } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { QueryModel } from "~/educoach/models/query.model";
import { NotificationModel, NotificationType } from "~/educoach/models/notification.model";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { Types } from "mongoose";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle,
  Send,
  BadgeCheck,
  User,
  GraduationCap,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const query = await QueryModel.findOne({ _id: params.queryId, deletedAt: null }).lean();
  if (!query) throw new Response("Not found", { status: 404 });

  return {
    query: {
      ...query,
      _id: query._id.toString(),
      author_id: query.author_id.toString(),
      replies: query.replies.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
        author_id: r.author_id.toString(),
      })),
    },
    currentUser: { sub: userPayload.id, role: userPayload.role, username: userPayload.username },
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "reply");

  if (intent === "reply") {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return { error: "Reply body required" };

    const reply = {
      _id: new Types.ObjectId(),
      author_id: new Types.ObjectId(userPayload.id),
      author_name: userPayload.username ?? userPayload.email,
      is_instructor: userPayload.role === "admin",
      body,
      is_accepted: false,
      created_at: new Date(),
    };

    const updated = await QueryModel.findByIdAndUpdate(
      params.queryId,
      { $push: { replies: reply } },
      { new: true }
    ).lean();

    if (updated) {
      await NotificationModel.create({
        user_id: updated.author_id,
        title: "New reply to your query",
        body: `${reply.author_name} replied to: "${updated.title}"`,
        type: NotificationType.QueryReply,
        link: `/queries/${params.queryId}`,
      });
    }
  }

  if (intent === "accept") {
    const replyId = String(formData.get("replyId") ?? "");
    const query = await QueryModel.findById(params.queryId);
    if (!query) return { error: "Not found" };
    if (query.author_id.toString() !== userPayload.id && userPayload.role !== "admin") {
      return { error: "Forbidden" };
    }
    query.replies = query.replies.map((r: any) => ({
      ...r.toObject(),
      is_accepted: r._id.toString() === replyId,
    })) as any;
    query.is_resolved = true;
    await query.save();
  }

  return redirect(`/queries/${params.queryId}`);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function QueryDetailPage() {
  const { query, currentUser } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const navigation = useNavigation();

  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";
  const isAuthor = currentUser.sub === query.author_id;
  const isAdmin = currentUser.role === "admin";

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/queries" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Q&A Board
        </Link>
      </div>

      <div className="max-w-3xl">
        {/* Question header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-slate-800">{query.author_name}</span>
                <span className="text-xs text-slate-400">{timeAgo(String(query.createdAt ?? ""))}</span>
              </div>
              {query.is_resolved && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-2">
                  <CheckCircle className="w-3 h-3" /> Resolved
                </span>
              )}
            </div>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{query.title}</h1>
          {query.body && <p className="text-slate-600 text-sm leading-relaxed">{query.body}</p>}
        </div>

        {/* Replies */}
        <div className="mb-5">
          <h2 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {query.replies.length} {query.replies.length === 1 ? "Reply" : "Replies"}
          </h2>

          {query.replies.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-200 text-slate-400 text-sm">
              No replies yet. Be the first to answer!
            </div>
          ) : (
            <div className="space-y-3">
              {query.replies.map((reply: any) => (
                <div
                  key={reply._id}
                  className={`bg-white rounded-xl p-5 border shadow-sm ${
                    reply.is_accepted ? "border-emerald-200" : "border-slate-100"
                  } ${reply.is_instructor ? "border-l-4" : ""}`}
                  style={reply.is_instructor ? { borderLeftColor: primaryColor } : {}}
                >
                  {reply.is_accepted && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mb-3">
                      <BadgeCheck className="w-4 h-4" />
                      Accepted Answer
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${reply.is_instructor ? "text-white" : "bg-slate-100"}`}
                      style={reply.is_instructor ? { background: primaryColor } : {}}>
                      {reply.is_instructor ? (
                        <GraduationCap className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-800">{reply.author_name}</span>
                        {reply.is_instructor && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: primaryColor }}>
                            Instructor
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{timeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{reply.body}</p>

                      {/* Accept button — only shown to question author for non-accepted replies */}
                      {(isAuthor || isAdmin) && !reply.is_accepted && !query.is_resolved && (
                        <Form method="post" className="mt-2">
                          <input type="hidden" name="intent" value="accept" />
                          <input type="hidden" name="replyId" value={reply._id} />
                          <button
                            type="submit"
                            className="text-xs font-medium flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept as answer
                          </button>
                        </Form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply form */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4 text-sm">Post a Reply</h3>
          <Form method="post">
            <input type="hidden" name="intent" value="reply" />
            <textarea
              name="body"
              placeholder="Write your reply..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none mb-3"
              style={{ "--tw-ring-color": primaryColor } as any}
            />
            <button
              type="submit"
              disabled={navigation.state === "submitting"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
              style={{ background: primaryColor }}
            >
              <Send className="w-4 h-4" />
              {navigation.state === "submitting" ? "Posting..." : "Post Reply"}
            </button>
          </Form>
        </div>
      </div>
    </AppShell>
  );
}
