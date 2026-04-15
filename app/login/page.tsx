"use client";

import { motion } from "framer-motion";
import { Code2, Mail, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function LoginPage() {
  const { user, loginWithGitHub, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-background bg-glow overflow-hidden flex items-center justify-center px-6">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-0 h-96 w-96 rounded-full bg-foreground/5 blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, 50, 0] }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: [0.645, 0.045, 0.355, 1],
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-foreground/5 blur-3xl"
        animate={{ y: [0, 50, 0], x: [0, -50, 0] }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: [0.645, 0.045, 0.355, 1],
        }}
      />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card Container */}
        <motion.div
          className="glass-luxury rounded-3xl backdrop-blur-xl p-8 md:p-12 border border-border/70 shadow-2xl"
          variants={itemVariants}
        >
          {/* Logo/Brand */}
          <motion.div
            className="flex items-center gap-2 justify-center mb-8"
            variants={itemVariants}
          >
            <div className="rounded-lg bg-gradient-to-br from-foreground/10 to-foreground/5 p-2 backdrop-blur">
              <Zap className="w-6 h-6 text-foreground" strokeWidth={3} />
            </div>
            <span className="text-2xl font-bold text-foreground">JustShip</span>
          </motion.div>

          {/* Heading */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Welcome Back
            </h1>
            <p className="text-lg text-muted-foreground">
              Deploy your frontend in seconds
            </p>
          </motion.div>

          {/* Login Buttons */}
          <motion.div className="space-y-4 mb-8" variants={itemVariants}>
            {/* GitHub Login */}
            <motion.button
              onClick={loginWithGitHub}
              className="w-full glass-hover rounded-2xl py-4 px-6 border border-border/60 transition-all duration-300 flex items-center justify-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Code2 className="w-5 h-5 text-foreground transition-colors" />
              <span className="font-semibold text-foreground">
                Continue with GitHub
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground transition-all group-hover:translate-x-1" />
            </motion.button>

            {/* Google Login */}
            <motion.button
              onClick={loginWithGoogle}
              className="w-full glass-hover rounded-2xl py-4 px-6 border border-border/60 transition-all duration-300 flex items-center justify-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="w-5 h-5 text-foreground transition-colors" />
              <span className="font-semibold text-foreground">
                Continue with Google
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground transition-all group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="flex items-center gap-4 mb-8"
            variants={itemVariants}
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          </motion.div>

          {/* Back to Home */}
          <motion.div className="text-center" variants={itemVariants}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground group"
            >
              <span>Back to home</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Features List */}
        <motion.div
          className="mt-12 grid grid-cols-3 gap-4"
          variants={itemVariants}
        >
          {[
            { label: "Deploy in Seconds", icon: "⚡" },
            { label: "Global CDN", icon: "🌍" },
            { label: "Enterprise Security", icon: "🔒" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ y: -5 }}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="text-xs font-medium text-muted-foreground">
                {feature.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
