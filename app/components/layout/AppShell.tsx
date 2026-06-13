import { Link, Form, useLocation } from "react-router";
import { useAuth } from "~/modules/authentication/use-authentication";
import { useConfigurables } from "~/modules/configurables";
import { useState, useEffect } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Bell,
  MessageCircle,
  LogOut,
  LogIn,
  Menu,
  X,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/notifications?limit=1")
      .then((r) => r.json())
      .then((d) => setUnread(d.unreadCount ?? 0))
      .catch(() => {});
  }, [isAuthenticated]);

  return (
    <Link
      to="/notifications"
      className="relative p-2 rounded-lg hover:bg-indigo-50 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-slate-600" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

const navLinks = [
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/quizzes", label: "Quizzes", icon: ClipboardList },
  { to: "/queries", label: "Q&A", icon: MessageCircle },
];

const authNavLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ...navLinks,
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { config, loading } = useConfigurables();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const appName = loading ? "Harsh Commerce Academy" : config?.appName ?? "Harsh Commerce Academy";
  const logoUrl = loading ? "" : config?.logoUrl ?? "";
  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";

  const links = isAuthenticated ? authNavLinks : navLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {logoUrl && !logoUrl.includes("FILL") ? (
              <img src={logoUrl} alt={appName} className="h-8 w-auto" />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: primaryColor }}
              >
                {appName.charAt(0)}
              </div>
            )}
            <span className="font-bold text-slate-900 text-base hidden sm:block leading-tight max-w-[200px]">
              {appName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  style={isActive ? { background: primaryColor } : {}}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm text-slate-600 font-medium max-w-[120px] truncate">
                  {user?.username ?? user?.email}
                </span>
                <Form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </Form>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: primaryColor }}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  style={isActive ? { background: primaryColor } : {}}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-500">
          {loading ? "Harsh Commerce Academy" : config?.footerText ?? `© ${new Date().getFullYear()} Harsh Commerce Academy. All rights reserved.`}
        </div>
      </footer>
    </div>
  );
}
