"use client";

import { motion, type Variants } from "framer-motion";
import { Code2, Mail, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";
import LoginSearchParams from "./LoginSearchParams";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeInOut: [number, number, number, number] = [0.645, 0.045, 0.355, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export default function LoginPage() {
  const { user, loginWithGitHub, loginWithGoogle } = useAuth();
  const router = useRouter();

  if (user) return null;

  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center px-6">
      <Suspense fallback={null}>
        <LoginSearchParams user={user} router={router} />
      </Suspense>

      <motion.div
        className="absolute top-0 left-0 h-96 w-96 rounded-full bg-foreground/5 blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: easeInOut }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-foreground/5 blur-3xl"
        animate={{ y: [0, 50, 0], x: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: easeInOut }}
      />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 mb-10"
          variants={itemVariants}
        >
          <div className="rounded-lg bg-linear-to-br from-foreground/10 to-foreground/5 p-2 backdrop-blur">
            <Zap className="w-5 h-5 text-foreground" strokeWidth={3} />
          </div>
          <span className="text-lg font-bold text-foreground">JustShip</span>
        </motion.div>

        {/* Heading */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Deploy your frontend in seconds.
          </p>
        </motion.div>

        {/* Login Buttons */}
        <motion.div className="space-y-3 mb-6" variants={itemVariants}>
          <motion.button
            onClick={loginWithGitHub}
            className="w-full glass-hover rounded-xl py-3 px-4 border border-border/60 transition-all duration-300 flex items-center gap-3 group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Code2 className="w-4 h-4 text-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Continue with GitHub
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          <motion.button
            onClick={loginWithGoogle}
            className="w-full glass-hover rounded-xl py-3 px-4 border border-border/60 transition-all duration-300 flex items-center gap-3 group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Mail className="w-4 h-4 text-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Continue with Google
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          variants={itemVariants}
        >
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border/60" />
        </motion.div>

        {/* Back to Home */}
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Back to home</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
