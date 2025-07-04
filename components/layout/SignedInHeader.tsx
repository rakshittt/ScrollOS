"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Sun, Moon, ChevronDown, LogOut, User, Inbox } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function SignedInHeader() {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      const html = document.documentElement;
      html.classList.remove("light", "dark");
      html.classList.add(next ? "dark" : "light");
      try {
        const settings = JSON.parse(localStorage.getItem("appearanceSettings") || "{}") || {};
        settings.theme = next ? "dark" : "light";
        localStorage.setItem("appearanceSettings", JSON.stringify(settings));
      } catch {}
      // Set theme cookie for SSR hydration
      try {
        document.cookie = `theme=${next ? 'dark' : 'light'}; path=/; max-age=${60 * 60 * 24 * 365}`;
      } catch {}
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between">
        {/* Logo & Brand (left) */}
        <Link href="/inbox" className="flex items-center space-x-2 sm:space-x-3 group">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl overflow-hidden shadow-lg">
            <img src="/NEWS360.png" alt="News360 Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:opacity-80 transition">News360</span>
        </Link>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Right: Theme, User, Inbox */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDark}
            className="rounded-full p-2 hover:bg-accent transition-colors"
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center space-x-2 rounded-full px-2 py-1 hover:bg-accent transition-colors">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="avatar" className="h-8 w-8 rounded-full object-cover border border-border" />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
                <span className="hidden sm:block font-medium text-foreground max-w-[120px] truncate">{session?.user?.name || session?.user?.email}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="w-48 p-1 z-50 rounded-lg border bg-background shadow-lg">
              <DropdownMenu.Item
                onSelect={() => signOut()}
                className="flex items-center px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-foreground text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {/* Inbox Button (right) */}
          <Link href="/inbox" className="ml-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-all focus:ring-2 focus:ring-primary/30 flex items-center">
            <Inbox className="h-5 w-5 mr-2" /> Inbox
          </Link>
        </div>
      </div>
    </header>
  );
} 