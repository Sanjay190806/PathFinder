import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Sun, Moon } from "lucide-react";
import { Button, BrandLogo } from "@/components/ui";
import { useTheme } from "next-themes";

export function LandingNav() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo size="md" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
            ) : (
              <div className="h-5 w-5" />
            )}
          </button>
          
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
