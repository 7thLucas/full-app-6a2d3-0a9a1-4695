import { useLoaderData, Link, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { MCQTestModel } from "~/educoach/models/mcq.model";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { ClipboardList, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request }: LoaderFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const tests = await MCQTestModel.find({ is_published: true, deletedAt: null })
    .select("-questions.correct_index -questions.explanation")
    .lean();

  return {
    tests: tests.map((t) => ({
      ...t,
      _id: t._id.toString(),
    })),
  };
}

export default function QuizzesPage() {
  const { tests } = useLoaderData<typeof loader>();
  const { config, loading } = useConfigurables();
  const primaryColor = loading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">MCQ Quizzes</h1>
        <p className="text-slate-500">Test your knowledge with topic-wise practice quizzes</p>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-slate-100">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No quizzes available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((test: any) => (
            <Link
              key={test._id}
              to={`/quizzes/${test._id}`}
              className="group bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${primaryColor}15` }}>
                <ClipboardList className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                {test.title}
              </h3>
              {test.description && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{test.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {test.questions?.length ?? 0} questions
                </span>
                {test.time_limit_minutes > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {test.time_limit_minutes} min
                  </span>
                )}
              </div>
              <div
                className="mt-4 flex items-center gap-1.5 text-sm font-medium"
                style={{ color: primaryColor }}
              >
                Start Quiz <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
