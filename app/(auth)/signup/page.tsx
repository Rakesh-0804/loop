"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building2,
  CheckCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Replace with your API endpoint
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        company: form.company,
        email: form.email,
        password: form.password,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Unable to create account.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-100">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-16">
        <h1 className="text-5xl font-bold">Project LOOP</h1>

        <p className="mt-6 text-xl text-blue-100">
          Build smarter customer experiences with AI.
        </p>

        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle />
            <span>Unlimited Feedback Collection</span>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle />
            <span>Real-time AI Insights</span>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle />
            <span>Interactive Analytics Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle />
            <span>Export Reports in Seconds</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Create Your Account 🚀
            </h2>

            <p className="mt-2 text-slate-500">
              Join Project LOOP today.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 mt-8"
          >
            {/* Name */}
            <div>
              <label className="text-sm font-medium">
                Full Name
              </label>

              <div className="relative mt-2">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border py-3 pl-11 pr-4"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium">
                Company Name
              </label>

              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  value={form.company}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      company: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border py-3 pl-11 pr-4"
                  placeholder="Your Company"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">
                Email Address
              </label>

              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border py-3 pl-11 pr-4"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium">
                Password
              </label>

              <div className="relative mt-2">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border py-3 pl-11 pr-12"
                  placeholder="Create a password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium">
                Confirm Password
              </label>

              <input
                required
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full rounded-lg border py-3 px-4 mt-2"
                placeholder="Confirm password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" required />
              I agree to the Terms & Conditions
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-slate-300"></div>
            <span className="px-3 text-sm text-slate-500">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-300"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="border rounded-lg py-3 hover:bg-slate-50"
            >
              Google
            </button>

            <button
              type="button"
              className="border rounded-lg py-3 hover:bg-slate-50"
            >
              GitHub
            </button>
          </div>

          <p className="text-center mt-8 text-sm text-slate-600">
            Already have an account?

            <Link
              href="/login"
              className="ml-2 font-semibold text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}