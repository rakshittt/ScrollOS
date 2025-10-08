"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AutoLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    if (!token || !userId) {
      setError("Invalid login link.");
      setLoading(false);
      return;
    }
    fetch("/api/auth/auto-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    })
      .then(async (res) => {
        if (res.ok) {
          router.replace("/inbox");
        } else {
          const data = await res.json();
          setError(data.message || "Login failed.");
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Login failed. Please try again.");
        setLoading(false);
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {loading && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-foreground">Logging you in...</p>
          </>
        )}
        {error && (
          <>
            <div className="text-red-600 text-lg font-semibold">{error}</div>
            <a href="/auth/signin" className="text-primary-500 hover:underline text-sm">Go to Sign In</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function AutoLoginPage() {
  return (
    <Suspense>
      <AutoLoginInner />
    </Suspense>
  );
} 