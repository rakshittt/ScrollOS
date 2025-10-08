import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: string;
    planTrialEndsAt?: string;
    planExpiresAt?: string;
  }
  interface Session {
    user: User;
  }
} 