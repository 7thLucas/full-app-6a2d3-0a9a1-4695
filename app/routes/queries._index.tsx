import { useLoaderData, Link, redirect, Form, useNavigation } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { QueryModel } from "~/educoach/models/query.model";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { Types } from "mongoose";
import { MessageCircle, PlusCircle, CheckCircle, Clock, ArrowRight, Search } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const queries = await QueryModel.find({ deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    queries: queries.map((q) => ({
      ...q,
      _id: q._id.toString(),
      author_id: q.author_id.toString(),
      replies: q.replies.length,
    })),
    currentUserId: userPayload.id,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title) return { error: "Title is required" };

  await QueryModel.create({
    author_id: new Types.ObjectId(userPayload.id),
    author_name: userPayload.username ?? userPayload.email,
    title,
    body,
  });

  return { success: true };
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

export default function QueriesPage() {
  const { queries } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";

  const filtered = queries.filter(
    (q: any) =>
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.body && q.body.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Q&A Board</h1>
          <p className="text-slate-500">Ask questions, get answers from your instructor</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: primaryColor }}
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Ask a Question</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {/* New query form */}
      {showForm && (
        <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Post a New Question</h3>
          <Form method="post" onSubmit={() => setShowForm(false)}>
            <div className="space-y-3">
              <input
                name="title"
                placeholder="Question title (required)"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              <textarea
                name="body"
                placeholder="Describe your question in detail (optional)..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: primaryColor }}
                >
                  {navigation.state === "submitting" ? "Posting..." : "Post Question"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-slate-100">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q: any) => (
            <Link
              key={q._id}
              to={`/queries/${q._id}`}
              className="block bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {q.is_resolved && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {q.title}
                  </h3>
                  {q.body && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{q.body}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>By {q.author_name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(q.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {q.replies} {q.replies === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
