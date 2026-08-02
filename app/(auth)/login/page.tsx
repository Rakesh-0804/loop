"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  BarChart3,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100">

      {/* Left Side */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-16">

        <h1 className="text-5xl font-bold">
          Project LOOP
        </h1>

        <p className="mt-6 text-xl text-blue-100">
          AI Customer Feedback Intelligence Platform
        </p>

        <div className="mt-14 space-y-6">

          <div className="flex items-center gap-4">
            <BarChart3 className="h-7 w-7" />
            <span className="text-lg">
              Advanced Analytics Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <MessageSquare className="h-7 w-7" />
            <span className="text-lg">
              Feedback Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Sparkles className="h-7 w-7" />
            <span className="text-lg">
              AI Powered Insights
            </span>
          </div>

        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center p-8">

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

          <div className="text-center">

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome Back 👋
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to continue to Project LOOP
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 focus:border-blue-600 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-12 focus:border-blue-600 focus:outline-none"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                </button>

              </div>

            </div>

            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm">

                <input type="checkbox" />

                Remember me

              </label>

              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-slate-300" />
            <span className="px-3 text-sm text-slate-500">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <button
              type="button"
              className="rounded-lg border border-slate-300 py-3 font-medium hover:bg-slate-50"
            >
              Google
            </button>

            <button
              type="button"
              className="rounded-lg border border-slate-300 py-3 font-medium hover:bg-slate-50"
            >
              GitHub
            </button>

          </div>

          <p className="mt-8 text-center text-sm text-slate-600">

            Don't have an account?

            <Link
              href="/signup"
              className="ml-2 font-semibold text-blue-600 hover:underline"
            >
              Create Account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}