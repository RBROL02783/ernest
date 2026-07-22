"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FlaskConical } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Email sau parolă incorectă.");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-3">
            <FlaskConical aria-hidden className="h-6 w-6 text-indigo-11" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Ernest</h1>
          <p className="text-sm text-muted-foreground">
            Autentifică-te pentru a accesa tool-ul de research.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@banca.ro"
              required
              autoFocus
              className="h-10 rounded-lg border border-input bg-background px-3 text-base outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Parolă</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-10 rounded-lg border border-input bg-background px-3 text-base outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>

          {error && (
            <p className="rounded-md bg-red-3 px-3 py-2 text-sm font-medium text-red-11">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 rounded-lg bg-indigo-9 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Se conectează…" : "Intră în cont"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Nu ai cont?{" "}
          <a
            href="/register"
            className="font-medium text-indigo-11 underline-offset-2 hover:underline"
          >
            Creează cont
          </a>
        </p>
      </div>
    </div>
  );
}
