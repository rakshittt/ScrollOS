// src/components/ui/AuthButton.tsx
"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./Button";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">{session.user?.email}</span>
        <Button variant="secondary" onClick={() => signOut()}>Sign out</Button>
      </div>
    );
  }
  return (
    <Button variant="default" onClick={() => signIn()}>Sign in</Button>
  );
}
