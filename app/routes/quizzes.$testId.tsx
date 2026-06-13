import { useLoaderData, redirect, useSubmit } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { AppShell } from "~/components/layout/AppShell";
import { MCQTestModel } from "~/educoach/models/mcq.model";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, ClipboardList, RotateCcw } from "lucide-react";
import { Link } from "react-router";
import { useConfigurables } from "~/modules/configurables";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return redirect("/auth/login");

  const test = await MCQTestModel.findOne({ _id: params.testId, deletedAt: null })
    .select("-questions.correct_index -questions.explanation")
    .lean();

  if (!test) throw new Response("Quiz not found", { status: 404 });

  return {
    test: {
      ...test,
      _id: test._id.toString(),
      questions: test.questions.map((q) => ({
        ...q,
        _id: q._id.toString(),
      })),
    },
  };
}

type QuizState = "taking" | "submitted";

type Result = {
  question: string;
  options: { text: string }[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
};

export default function QuizPage() {
  const { test } = useLoaderData<typeof loader>();
  const { config, loading: cfgLoading } = useConfigurables();
  const primaryColor = cfgLoading ? "#3730A3" : config?.brandColor?.primary ?? "#3730A3";
  const accentColor = cfgLoading ? "#F59E0B" : config?.brandColor?.secondary ?? "#F59E0B";

  const [state, setState] = useState<QuizState>("taking");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [results, setResults] = useState<{ score: number; total: number; percentage: number; result: Result[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = test.questions ?? [];
  const currentQ = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  async function submitQuiz() {
    setSubmitting(true);
    const answers = questions.map((q: any) => ({
      question_id: q._id,
      selected_index: selected[q._id] ?? -1,
    }));
    try {
      const res = await fetch(`/api/mcq/${test._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResults(data);
      setState("submitted");
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function resetQuiz() {
    setState("taking");
    setCurrentIdx(0);
    setSelected({});
    setResults(null);
  }

  if (state === "submitted" && results) {
    const passMark = Math.round(results.total * 0.5);
    const passed = results.score >= passMark;

    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <Link to="/quizzes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </Link>

          {/* Score card */}
          <div
            className="rounded-2xl p-8 text-center text-white mb-8"
            style={{ background: passed ? "#10B981" : "#EF4444" }}
          >
            <div className="text-5xl font-bold mb-2">{results.percentage}%</div>
            <div className="text-lg font-semibold mb-1">
              {results.score} / {results.total} correct
            </div>
            <div className="text-white/80 text-sm">
              {passed ? "Well done! You passed." : "Keep practising, you can do better!"}
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="space-y-4 mb-8">
            {results.result.map((r, i) => (
              <div key={i} className={`bg-white rounded-xl p-5 border ${r.isCorrect ? "border-emerald-100" : "border-red-100"}`}>
                <div className="flex items-start gap-3 mb-3">
                  {r.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium text-slate-900 text-sm">{r.question}</p>
                </div>
                <div className="space-y-1.5 pl-8">
                  {r.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        oi === r.correctIndex
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : oi === r.selectedIndex && !r.isCorrect
                          ? "bg-red-50 text-red-600"
                          : "text-slate-500"
                      }`}
                    >
                      {oi === r.correctIndex && <span className="text-xs mr-1">(Correct)</span>}
                      {oi === r.selectedIndex && !r.isCorrect && <span className="text-xs mr-1">(Your answer)</span>}
                      {opt.text}
                    </div>
                  ))}
                </div>
                {r.explanation && (
                  <p className="text-xs text-slate-400 mt-2 pl-8 italic">{r.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            <Link
              to="/quizzes"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: primaryColor }}
            >
              More Quizzes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <Link to="/quizzes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100" style={{ background: `${primaryColor}08` }}>
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="w-5 h-5" style={{ color: primaryColor }} />
              <h1 className="font-bold text-slate-900">{test.title}</h1>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">
                Question {currentIdx + 1} of {questions.length}
              </span>
              {test.time_limit_minutes > 0 && (
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {test.time_limit_minutes} min
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: primaryColor }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            <p className="font-semibold text-slate-900 text-base mb-5 leading-relaxed">
              {currentQ.question}
            </p>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt: any, i: number) => {
                const isSelected = selected[currentQ._id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelected((prev) => ({ ...prev, [currentQ._id]: i }))}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all ${
                      isSelected
                        ? "border-2 text-white"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    style={isSelected ? { borderColor: primaryColor, background: primaryColor } : {}}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-xs text-slate-400">
                {Object.keys(selected).length} / {questions.length} answered
              </span>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: primaryColor }}
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#10B981" }}
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question dots navigation */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {questions.map((_: any, i: number) => {
            const isAnswered = selected[questions[i]._id] !== undefined;
            const isCurrent = i === currentIdx;
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                  isCurrent
                    ? "text-white"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                style={isCurrent ? { background: primaryColor } : {}}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
