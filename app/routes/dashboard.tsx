import { useLoaderData, Link, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { EnrollmentModel } from "~/educoach/models/enrollment.model";
import { CourseModel } from "~/educoach/models/course.model";
import { NotificationModel } from "~/educoach/models/notification.model";
import { MCQAttemptModel } from "~/educoach/models/mcq.model";
import { Types } from "mongoose";
import {
  BookOpen,
  Bell,
  ClipboardList,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  PlayCircle,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request }: LoaderFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const userId = new Types.ObjectId(userPayload.id);

  const [enrollments, recentNotifications, recentAttempts] = await Promise.all([
    EnrollmentModel.find({ user_id: userId }).lean(),
    NotificationModel.find({
      $or: [{ user_id: userId }, { user_id: null }],
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    MCQAttemptModel.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  const courseIds = enrollments.map((e) => e.course_id);
  const courses = await CourseModel.find({ _id: { $in: courseIds } }).lean();

  const enrolledCourses = enrollments.map((e) => {
    const course = courses.find((c) => c._id.toString() === e.course_id.toString());
    return {
      enrollmentId: e._id.toString(),
      courseId: e.course_id.toString(),
      completedLessons: e.completed_lessons.length,
      course: course
        ? {
            _id: course._id.toString(),
            title: course.title,
            thumbnail_url: course.thumbnail_url,
            tier: course.tier,
            category: course.category,
          }
        : null,
    };
  });

  const unreadNotifications = recentNotifications.filter((n) => !n.is_read).length;

  return {
    user: { username: userPayload.username, email: userPayload.email, role: userPayload.role },
    enrolledCourses,
    recentNotifications: recentNotifications.map((n) => ({
      ...n,
      _id: n._id.toString(),
    })),
    recentAttempts: recentAttempts.map((a) => ({
      ...a,
      _id: a._id.toString(),
      test_id: a.test_id.toString(),
    })),
    unreadNotifications,
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, enrolledCourses, recentNotifications, recentAttempts, unreadNotifications } =
    useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();

  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";

  const totalCompleted = enrolledCourses.reduce((acc, e) => acc + e.completedLessons, 0);

  return (
    <AppShell>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
          Welcome back, {user.username ?? user.email}!
        </h1>
        <p className="text-slate-500">Track your learning progress and pick up where you left off.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Enrolled Courses" value={enrolledCourses.length} icon={BookOpen} color={primaryColor} />
        <StatCard label="Lessons Completed" value={totalCompleted} icon={CheckCircle} color="#10B981" />
        <StatCard label="Quizzes Taken" value={recentAttempts.length} icon={ClipboardList} color="#F59E0B" />
        <StatCard
          label="Notifications"
          value={unreadNotifications > 0 ? `${unreadNotifications} new` : "0 new"}
          icon={Bell}
          color="#EF4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-lg">My Courses</h2>
            <Link to="/courses" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: primaryColor }}>
              Browse all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 text-sm mb-4">You haven't enrolled in any courses yet.</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: primaryColor }}
              >
                Explore Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledCourses.map((enrollment) =>
                enrollment.course ? (
                  <Link
                    key={enrollment.enrollmentId}
                    to={`/courses/${enrollment.courseId}`}
                    className="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {enrollment.course.thumbnail_url ? (
                        <img
                          src={enrollment.course.thumbnail_url}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
                          <BookOpen className="w-6 h-6" style={{ color: primaryColor }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                        {enrollment.course.title}
                      </p>
                      {enrollment.course.category && (
                        <p className="text-xs text-slate-400 mt-0.5">{enrollment.course.category}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-slate-500">{enrollment.completedLessons} lesson{enrollment.completedLessons !== 1 ? "s" : ""} completed</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </Link>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Recent Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-lg">Notifications</h2>
              <Link to="/notifications" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: primaryColor }}>
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {recentNotifications.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center border border-slate-100 text-slate-400 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((n) => (
                  <Link
                    key={n._id}
                    to={n.link || "/notifications"}
                    className={`block bg-white rounded-xl p-3.5 border shadow-sm hover:shadow-md transition-all ${!n.is_read ? "border-indigo-100 bg-indigo-50/40" : "border-slate-100"}`}
                  >
                    <div className="flex items-start gap-2">
                      <Bell className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${!n.is_read ? "text-indigo-500" : "text-slate-400"}`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: "/quizzes", icon: ClipboardList, label: "Take a Quiz", color: "#F59E0B" },
                { to: "/queries", icon: MessageCircle, label: "Post a Query", color: "#10B981" },
                { to: "/notifications", icon: Bell, label: "Check Notifications", color: "#EF4444" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  {item.label}
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
