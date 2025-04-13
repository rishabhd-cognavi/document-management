"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login"); // Redirect to login page after logout
  };

  return (
    <header className="border-b">
      <div className="px-8 flex h-16 items-center justify-between">
        <Link
          href={currentUser ? "/documents" : "/"}
          className="flex items-center space-x-2">
          <span className="text-xl font-bold">DocQA</span>
        </Link>

        <nav className="flex items-center space-x-6">
          {currentUser ? (
            <>
              <Link href="/documents">Documents</Link>
              <Link href="/qa">Q&A</Link>
              {currentUser.role === "admin" && <Link href="/admin">Admin</Link>}
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign Up</Link>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
