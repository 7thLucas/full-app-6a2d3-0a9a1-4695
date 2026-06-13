import { useLoaderData, Link, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { optionalAuth } from "~/modules/authentication/authentication.middleware";
import { CourseModel, ContentTier } from "~/educoach/models/course.model";
import { EnrollmentModel } from "~/educoach/models/enrollment.model";
import { Types } from "mongoose";
import { Search, Lock, CheckCircle, BookOpen, Play, Clock } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const tier = url.searchParams.get("tier") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const search = url.searchParams.get("search") ?? "";
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = 12;

  const query: Record<string, any> = { is_published: true, deletedAt: null };
  if (tier === "free" || tier === "paid") query.tier = tier;
  if (category) query.category = category;
  if (search) query.title = { $regex: search, $options: "i" };

  const skip = (Math.max(1, page) - 1) * limit;
  const [courses, total, categories] = await Promise.all([
    CourseModel.find(query).sort({ sort_order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    CourseModel.countDocuments(query),
    CourseModel.distinct("category", { is_published: true, deletedAt: null }),
  ]);

  // Get enrolled course IDs if user is authenticated
  let enrolledIds: string[] = [];
  try {
    const req = request as any;
    if (req.user?.sub) {
      const enrollments = await EnrollmentModel.find({ user_id: new Types.ObjectId(req.user.sub) }).lean();
      enrolledIds = enrollments.map((e) => e.course_id.toString());
    }
  } catch {}

  return {
    courses: courses.map((c) => ({
      ...c,
      _id: c._id.toString(),
      topics: (c.topics as any[]).map((t: any) => t.toString()),
      isEnrolled: enrolledIds.includes(c._id.toString()),
    })),
    total,
    page,
    limit,
    categories: categories.filter(Boolean),
    filters: { tier, category, search },
  };
}

function TierBadge({ tier }: { tier: string }) {
  return tier === "free" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      <CheckCircle className="w-3 h-3" /> Free
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      <Lock className="w-3 h-3" /> Paid
    </span>
  );
}

function CourseCard({ course }: { course: any }) {
  const { config, loading } = useConfigurables();
  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
            <BookOpen className="w-12 h-12" style={{ color: primaryColor }} />
          </div>
        )}
        {/* Lock overlay for paid */}
        {course.tier === "paid" && !course.isEnrolled && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white/95 rounded-full p-2">
              <Lock className="w-5 h-5 text-slate-700" />
            </div>
          </div>
        )}
        {course.isEnrolled && (
          <div className="absolute top-2 right-2">
            <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Enrolled</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <TierBadge tier={course.tier} />
        </div>
        {course.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{course.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          {course.category && (
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              {course.category}
            </span>
          )}
          {course.tier === "paid" && !course.isEnrolled && (
            <span className="font-bold text-slate-800 text-sm">
              ₹{course.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const { courses, total, page, limit, categories, filters } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { config, loading } = useConfigurables();
  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";

  const totalPages = Math.ceil(total / limit);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Courses</h1>
        <p className="text-slate-500">Browse all available courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search courses..."
            defaultValue={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
            style={{ "--tw-ring-color": primaryColor } as any}
          />
        </div>

        {/* Tier filter */}
        <select
          value={filters.tier}
          onChange={(e) => updateFilter("tier", e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none"
        >
          <option value="">All Tiers</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">{total} course{total !== 1 ? "s" : ""} found</p>

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(page - 1));
                setSearchParams(next);
              }}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
          )}
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(page + 1));
                setSearchParams(next);
              }}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      )}
    </AppShell>
  );
}
