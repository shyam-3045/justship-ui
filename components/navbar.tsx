"use client";

import { Code2, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  showBorder?: boolean;
};

export function Navbar({ showBorder = true }: NavbarProps) {
  const { user, loginWithGitHub, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = user
    ? [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/deploy", label: "Deploy Using Repo URL" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/deploy", label: "Deploy Using Repo URL" },
      ];

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${
        showBorder
          ? "border-b border-border bg-background/70"
          : "bg-background/40"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-bold tracking-[0.2em] text-foreground hover:text-foreground/70 transition-colors duration-300"
        >
          JUSTSHIP
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <motion.div
              className="flex items-center gap-3 pl-3 border-l border-border"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar
                src={user.avatarUrl}
                fallback={user.name.slice(0, 2).toUpperCase()}
              />
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">Welcome</p>
                <p className="text-sm font-semibold text-foreground">
                  {user.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-xs ml-2"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/login">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Code2 className="size-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 transition-colors hover:bg-muted"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden border-t border-border bg-background/80 backdrop-blur-md"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <nav className="flex flex-col gap-2 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-muted/60 hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
