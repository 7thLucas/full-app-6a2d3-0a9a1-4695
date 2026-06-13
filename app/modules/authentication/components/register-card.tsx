import { Form, Link, useActionData, useNavigation } from "react-router";

interface ActionData {
  error?: string;
}

export function RegisterCard() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3"
            style={{ background: "#3730A3" }}
          >
            H
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join thousands of commerce students</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          {actionData?.error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name / Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="e.g. Rahul Sharma"
                required
                autoComplete="username"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 bg-white placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ background: "#3730A3" }}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </Form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-semibold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          <Link to="/" className="hover:underline hover:text-slate-600">
            &larr; Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
