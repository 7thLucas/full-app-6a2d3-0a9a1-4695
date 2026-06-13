import { useLoaderData, Link, redirect, useFetcher } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { NotificationModel } from "~/educoach/models/notification.model";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { Types } from "mongoose";
import { Bell, CheckCheck, PlayCircle, ClipboardList, MessageCircle, Megaphone } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request }: LoaderFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const userId = new Types.ObjectId(userPayload.id);
  const notifications = await NotificationModel.find({
    $or: [{ user_id: userId }, { user_id: null }],
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    notifications: notifications.map((n) => ({
      ...n,
      _id: n._id.toString(),
      user_id: n.user_id?.toString() ?? null,
    })),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const userId = new Types.ObjectId(userPayload.id);
  await NotificationModel.updateMany(
    { $or: [{ user_id: userId }, { user_id: null }], is_read: false },
    { is_read: true }
  );
  return { success: true };
}

const typeIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  new_lesson: PlayCircle,
  new_quiz: ClipboardList,
  query_reply: MessageCircle,
  announcement: Megaphone,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const { notifications } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const fetcher = useFetcher();

  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Notifications</h1>
          <p className="text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <fetcher.Form method="post">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              Mark all read
            </button>
          </fetcher.Form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-slate-100">
          <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {notifications.map((n: any) => {
            const Icon = typeIconMap[n.type] ?? Bell;
            return (
              <div
                key={n._id}
                className={`bg-white rounded-xl p-4 border shadow-sm transition-all flex items-start gap-3 ${
                  !n.is_read ? "border-indigo-100" : "border-slate-100"
                }`}
              >
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: primaryColor }} />
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${!n.is_read ? "" : "ml-5"}`}
                  style={{ background: `${primaryColor}15` }}>
                  <Icon className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.is_read ? "text-slate-900" : "text-slate-600"}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  {n.link && (
                    <Link to={n.link} className="text-xs font-medium mt-1 hover:underline inline-block" style={{ color: primaryColor }}>
                      View details
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
