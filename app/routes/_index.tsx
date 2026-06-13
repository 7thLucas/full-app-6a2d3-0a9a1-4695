import { Link } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication/use-authentication";
import { AppShell } from "~/components/layout/AppShell";
import {
  PlayCircle,
  FileText,
  File,
  CheckSquare,
  MessageCircle,
  Bell,
  ArrowRight,
  Star,
  Users,
  BookOpen,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  PlayCircle,
  FileText,
  File,
  CheckSquare,
  MessageCircle,
  Bell,
  BookOpen,
};

export default function IndexPage() {
  const { config, loading } = useConfigurables();
  const { isAuthenticated } = useAuth();

  const appName = loading ? "Harsh Commerce Academy" : config?.appName ?? "Harsh Commerce Academy";
  const tagline = loading ? "Learn Smart, Score Better" : config?.tagline ?? "Learn Smart, Score Better";
  const heroHeading = loading ? "Learn Smart, Score Better" : config?.heroHeading ?? "Learn Smart, Score Better";
  const heroSubheading = loading
    ? "Access video lessons, notes, PDFs, and practice tests — all in one platform."
    : config?.heroSubheading ?? "Access video lessons, notes, PDFs, and practice tests — all in one platform.";
  const heroCta = loading ? "Get Started Free" : config?.heroCta ?? "Get Started Free";
  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";
  const accentColor = loading ? "#F59E0B" : config?.brandColor?.secondary ?? "#F59E0B";

  const featuresHeading = loading
    ? "Everything You Need to Succeed"
    : config?.featuresSection?.heading ?? "Everything You Need to Succeed";

  const features = loading
    ? []
    : config?.featuresSection?.features ?? [];

  return (
    <AppShell>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative rounded-2xl overflow-hidden mb-12" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #4f46e5 100%)` }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=40')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 px-6 py-16 md:py-24 text-white text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            {tagline}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5">
            {heroHeading}
          </h1>
          <p className="text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto">
            {heroSubheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={isAuthenticated ? "/courses" : "/auth/register"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ background: accentColor, color: "#1E293B" }}
            >
              {heroCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base bg-white/20 hover:bg-white/30 transition-all"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Courses", value: "10+", icon: BookOpen },
          { label: "Students", value: "500+", icon: Users },
          { label: "Video Lessons", value: "200+", icon: PlayCircle },
          { label: "Practice Tests", value: "50+", icon: CheckSquare },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 text-center border border-slate-100 shadow-sm">
            <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      {features.length > 0 && (
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{featuresHeading}</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A complete learning platform designed for commerce students — from beginner to advanced.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = iconMap[feature.icon] ?? BookOpen;
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${primaryColor}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── CTA Banner ───────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl p-8 md:p-12 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #4f46e5 100%)` }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Start Learning?</h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Join hundreds of students who are scoring better with {appName}.
        </p>
        <Link
          to={isAuthenticated ? "/courses" : "/auth/register"}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
          style={{ background: accentColor, color: "#1E293B" }}
        >
          {isAuthenticated ? "Browse Courses" : "Sign Up Free"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </AppShell>
  );
}
