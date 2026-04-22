"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Globe,
  Shield,
  BarChart3,
  GitBranch,
  Code2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/premium-card";
import { FeatureCard } from "@/components/feature-card";
import { SectionHeader } from "@/components/section-header";
import { AnimatedCounter } from "@/components/animated-counter";
import { ScrollReveal } from "@/components/scroll-reveal";
import { fadeInUp, containerVariants } from "@/lib/animations";

// Feature data
const features = [
  {
    icon: <Zap className="size-6" />,
    title: "Instant Deployments",
    description:
      "Push your GitHub repo and watch it build, version, and go live automatically — no manual steps needed.",
  },
  {
    icon: <Globe className="size-6" />,
    title: "CloudFront CDN",
    description:
      "Your static files are served globally via AWS CloudFront for fast load times everywhere.",
  },
  {
    icon: <Shield className="size-6" />,
    title: "Isolated Docker Builds",
    description:
      "Every build runs inside a resource-limited Docker container, keeping your system safe and stable.",
  },
  {
    icon: <GitBranch className="size-6" />,
    title: "Version Control & Rollback",
    description:
      "Every deploy is versioned. Switch between versions or roll back to a previous build instantly.",
  },
  {
    icon: <BarChart3 className="size-6" />,
    title: "Real-Time Build Logs",
    description:
      "Watch your deployment logs live via WebSockets. Logs are persisted so you can review them anytime.",
  },
  {
    icon: <Code2 className="size-6" />,
    title: "Environment Variables",
    description:
      "Store and manage project-level environment variables securely, injected directly into your builds.",
  },
  {
    icon: <Sparkles className="size-6" />,
    title: "AI Error Summaries",
    description:
      "When a deployment fails, get a quick AI summary of the full logs with clear root cause and fix steps.",
  },
];

// How it works steps
const steps = [
  {
    number: "01",
    title: "Submit Your GitHub Repo",
    description:
      "Paste your GitHub repository URL into JustShip. We'll clone it inside an isolated Docker container and kick off the build.",
  },
  {
    number: "02",
    title: "We Build, Version & Deploy",
    description:
      "Your project is built automatically, versioned in S3, and served via CloudFront CDN — all tracked in real time.",
  },
  {
    number: "03",
    title: "Monitor, Switch & Rollback",
    description:
      "View live logs, manage deployment history, switch versions, or roll back — all from one simple dashboard.",
  },
];

const stats = [
  { target: 100, label: "Deployments Supported", suffix: "+" },
  { target: 99.9, label: "Uptime Target", suffix: "%" },
  { target: 1, label: "Command to Deploy", suffix: "" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background bg-glow overflow-hidden">
      {/* Navbar */}
      <Navbar showBorder={true} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <motion.div
          className="absolute top-20 left-10 h-96 w-96 rounded-full bg-foreground/10 blur-3xl"
          animate={{ y: [0, 50, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.645, 0.045, 0.355, 1],
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-foreground/5 blur-3xl"
          animate={{ y: [0, -50, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.645, 0.045, 0.355, 1],
          }}
        />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-2 backdrop-blur-sm"
            variants={fadeInUp}
            custom={0}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-foreground/80">
              Built on AWS S3 + CloudFront + Docker
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div className="space-y-4" variants={fadeInUp} custom={1}>
            <h1 className="text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              Deploy Your Frontend in Seconds
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={fadeInUp}
            custom={2}
          >
            JustShip automates building, versioning, and deploying your frontend
            apps — powered by Docker, Redis queues, S3, and CloudFront CDN.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            variants={fadeInUp}
            custom={3}
          >
            <Link href="/login">
              <Button size="lg" className="gap-2 px-8 font-semibold">
                Deploy Your App
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              className="gap-2 border border-border/60 text-foreground hover:bg-muted/60"
            >
              View Architecture
              <Code2 className="size-4" />
            </Button>
          </motion.div>

          {/* Floating Cards */}
          <motion.div className="pt-12" variants={fadeInUp} custom={4}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Docker Isolated Build", "Version Switching", "Global CDN"].map(
                (stat, i) => (
                  <PremiumCard key={i} className="text-center py-4">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {stat}
                    </p>
                  </PremiumCard>
                ),
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-b from-transparent via-muted/30 to-transparent px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="What JustShip Does"
            subtitle="Core Features"
            description="A complete deployment pipeline — from GitHub repo to live URL — built from scratch"
            centered
            gradient
          />

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="How It Works"
            subtitle="The Pipeline"
            description="Three steps from code to live deployment"
            centered
            gradient
          />

          <motion.div
            className="mt-12 space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp} custom={index}>
                <div className="flex gap-6 md:gap-8">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted font-bold text-foreground text-xl">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-grow pt-2">
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow to next step */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="hidden lg:flex items-end pb-4 text-muted-foreground"
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="size-6 rotate-90" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-gradient-to-b from-transparent to-muted/30 px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, i) => (
              <AnimatedCounter
                key={i}
                target={stat.target}
                label={stat.label}
                suffix={stat.suffix}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 px-6">
        <motion.div
          className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-foreground/5 blur-xl" />

          <PremiumCard className="relative text-center py-16 md:py-20 px-8">
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.h2
                className="text-3xl font-bold text-foreground md:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                Ready to Ship?
              </motion.h2>
              <motion.p
                className="text-lg text-muted-foreground"
                variants={fadeInUp}
                custom={1}
              >
                Paste your GitHub repo and JustShip handles the rest — build,
                version, deploy, and serve globally.
              </motion.p>
              <motion.div variants={fadeInUp} custom={2}>
                <Link href="/login">
                  <Button size="lg" className="font-semibold">
                    Start Deploying
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </PremiumCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/70 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-4">
            © 2024 JustShip. Built by shyam, for real-world deployments.
          </p>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              Credits
            </Link>
            <a
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              Architecture
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
