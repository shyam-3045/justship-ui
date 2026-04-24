"use client";

import { motion } from "framer-motion";
import {
  GitBranch,
  Mail,
  Sparkles,
  ArrowDown,
  Server,
  Database,
  Globe,
  Layers,
  Radio,
  Container,
  CloudUpload,
  Lock,
  RefreshCw,
  Webhook,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/premium-card";
import { SectionHeader } from "@/components/section-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { fadeInUp, containerVariants } from "@/lib/animations";

// Main pipeline steps
const pipeline = [
  {
    step: "01",
    icon: <Globe className="size-6" />,
    title: "GitHub Repo URL",
    description:
      "You submit a GitHub repository URL through the frontend. The API validates it and creates a deployment record in MongoDB with status 'queued'.",
    tag: "Frontend → API",
  },
  {
    step: "02",
    icon: <Database className="size-6" />,
    title: "BullMQ Job Queue",
    description:
      "The API pushes a job into a BullMQ queue backed by Redis. This decouples the API from the build process — the API responds instantly while the job waits for a worker.",
    tag: "Redis + BullMQ",
  },
  {
    step: "03",
    icon: <Container className="size-6" />,
    title: "Docker Build Worker",
    description:
      "A worker picks up the job and spins up an isolated Docker container. It clones the repo, runs npm install and npm run build, and writes output to /output/projectName. Container is resource-limited to 200MB RAM and 0.3 CPUs to prevent system crashes.",
    tag: "Docker (Isolated)",
  },
  {
    step: "04",
    icon: <CloudUpload className="size-6" />,
    title: "Upload to AWS S3",
    description:
      "After a successful build, all output files are uploaded to S3 under a versioned path: project/v{n}/. Each deployment gets its own version — nothing is ever overwritten.",
    tag: "AWS S3 (Versioned)",
  },
  {
    step: "05",
    icon: <Globe className="size-6" />,
    title: "Served via CloudFront CDN",
    description:
      "CloudFront sits in front of S3 and serves files globally. HTML files get no-cache headers so users always get the latest version. Hashed static assets are cached for 1 year — fast and cost-efficient with zero CDN invalidations needed.",
    tag: "AWS CloudFront",
  },
  {
    step: "06",
    icon: <Globe className="size-6" />,
    title: "Subdomain Routing",
    description:
      "Every project gets its own subdomain: project-name.just-ship.app. A CloudFront Function parses the subdomain, maps it to the correct S3 path, and serves the right files automatically.",
    tag: "CloudFront Functions",
  },
];

// Supporting systems
const systems = [
  {
    icon: <Webhook className="size-6" />,
    title: "Webhook Event Routing",
    description:
      "Each project can enable or disable auto deploy. GitHub webhook events trigger deployment jobs and push real-time in-app notifications to the right user session.",
  },
  {
    icon: <Radio className="size-6" />,
    title: "Real-Time Build Logs",
    description:
      "The Docker worker emits logs to Redis Pub/Sub as it builds. A WebSocket server subscribes and streams them to your browser in real time — room-isolated per deployment so concurrent builds never mix logs. All logs are also persisted in MongoDB so you can review them after a refresh.",
  },
  {
    icon: <Layers className="size-6" />,
    title: "Version Switching",
    description:
      "Every deployment is versioned and can be switched from the dashboard. Current live version is tracked separately from newly built versions.",
  },
  {
    icon: <Globe className="size-6" />,
    title: "Global CDN Delivery",
    description:
      "Deployments are published to S3 and served through CloudFront. This provides edge caching, lower latency, and predictable static-hosting behavior worldwide.",
  },
  {
    icon: <Lock className="size-6" />,
    title: "Environment Variables",
    description:
      "Project-level env variables are stored in MongoDB and injected into the Docker build at runtime. Transfers between frontend and backend are encrypted. Only authenticated users can deploy.",
  },
  {
    icon: <RefreshCw className="size-6" />,
    title: "Deployment Reliability",
    description:
      "Multiple deploy triggers prevented via localStorage lock. Failed deployment status correctly resets on refresh. Missing logs handled gracefully. JobId tracking fixed. Single active deployment enforced. Proper error messages shown — no generic failures.",
  },
];

const technologies = [
  "Node.js",
  "Express",
  "MongoDB",
  "Redis (Pub/Sub)",
  "BullMQ",
  "Docker",
  "AWS S3",
  "AWS CloudFront",
  "AWS EC2",
  "NGINX",
  "WebSockets",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background bg-glow overflow-hidden">
      <Navbar showBorder={true} />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-foreground/5 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: [0.645, 0.045, 0.355, 1],
          }}
        />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-muted/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Image
              src="/favicon.ico"
              alt="JustShip logo"
              width={16}
              height={16}
              className="rounded-sm"
            />
            <Sparkles className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              How JustShip Works
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="gradient-text">From GitHub URL</span>
            <span className="block">
              <span className="gradient-text">to Live URL</span>
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            JustShip is a full-stack deployment orchestration platform — a mini
            Vercel — built from scratch using Docker, Redis, BullMQ, AWS S3,
            CloudFront, and WebSockets. Here's exactly how it works.
          </motion.p>

          <motion.div
            className="pt-4 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-muted-foreground"
            >
              <ArrowDown className="size-6" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Architecture Overview Card */}
      <section className="relative py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <PremiumCard>
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  High-Level Architecture
                </p>
                <div className="font-mono text-sm text-muted-foreground leading-relaxed space-y-1">
                  {[
                    ["User (Browser)", "submits GitHub URL"],
                    ["Backend API", "Node.js on EC2"],
                    ["Redis Queue", "BullMQ job queue"],
                    ["Docker Worker", "isolated build container"],
                    ["Build Output", "/output/projectName"],
                    ["AWS S3", "versioned static storage"],
                    ["CloudFront CDN", "global delivery"],
                    ["Your Browser", "project-name.just-ship.app"],
                  ].map(([label, desc], i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-foreground font-semibold w-40 shrink-0">
                        {label}
                      </span>
                      <span className="text-muted-foreground/60">→</span>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Deployment Pipeline */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="The Deployment Pipeline"
            subtitle="Step by Step"
            description="What happens from the moment you hit Deploy to when your site goes live"
            centered
            gradient
          />

          <motion.div
            className="mt-16 space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {pipeline.map((item, index) => (
              <motion.div key={index} variants={fadeInUp} custom={index}>
                <PremiumCard hover className="relative">
                  <div className="flex gap-6">
                    {/* Step number + connector */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted font-bold text-foreground text-lg">
                        {item.step}
                      </div>
                      {index < pipeline.length - 1 && (
                        <div className="w-px h-6 bg-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="grow pb-2">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">
                            {item.icon}
                          </div>
                          <h3 className="text-xl font-bold text-foreground">
                            {item.title}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/60">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Supporting Systems */}
      <section className="relative py-20 md:py-32 px-6 bg-linear-to-b from-transparent via-muted/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Supporting Systems"
            subtitle="Under the Hood"
            description="The layers that make JustShip reliable, real-time, and production-grade"
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
            {systems.map((item, i) => (
              <motion.div key={i} variants={fadeInUp} custom={i}>
                <PremiumCard hover gradient className="h-full flex flex-col">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-foreground/10 to-foreground/5 text-muted-foreground">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm grow">
                    {item.description}
                  </p>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="The Full Stack"
            subtitle="Technology Stack"
            description="Every tool used to build JustShip end to end"
            centered
            gradient
          />

          <motion.div
            className="mt-16 flex flex-wrap gap-3 justify-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {technologies.map((tech, i) => (
              <motion.div key={i} variants={fadeInUp} custom={i % 5}>
                <PremiumCard className="px-4 py-2 text-sm font-medium text-muted-foreground">
                  {tech}
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Me */}
      <section className="relative py-20 md:py-32 px-6 bg-linear-to-b from-transparent via-muted/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="space-y-6">
              <SectionHeader
                title="About Me"
                subtitle="The Builder"
                description=""
                centered
                gradient
              />

              <PremiumCard>
                <div className="space-y-5">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Hi, I’m{" "}
                    <span className="text-foreground font-medium">Shyam</span>.
                    I’m a student who enjoys building backend systems and
                    understanding how things work under the hood.
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    JustShip started as a small attempt to explore how modern
                    deployment platforms work. While building it, I worked
                    through queue systems, containerized builds, logging
                    pipelines, and version handling.
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    Most of what I’ve learned came from debugging real issues
                    and iterating on constraints — especially running everything
                    on a small instance.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <a href="mailto:s.m.shyam45@gmail.com">
                      <Button size="lg" className="gap-2 font-medium">
                        <Mail className="size-4" />
                        Email
                      </Button>
                    </a>
                    <a
                      href="https://github.com/shyam-3045"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" variant="secondary" className="gap-2">
                        <GitBranch className="size-4" />
                        GitHub
                      </Button>
                    </a>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Source Code
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The full source code for JustShip is available on GitHub.
                    Feel free to explore the architecture, read the code, or
                    raise issues.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://github.com/shyam-3045/justship-ui"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <GitBranch className="size-5" />
                      <span>github.com/shyam-3045/justship-ui</span>
                    </a>
                  </div>
                  <a
                    href="https://github.com/shyam-3045/justship-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <GitBranch className="size-5" />
                    <span>github.com/shyam-3045/justship-api</span>
                  </a>
                </div>
              </PremiumCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/70 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-6">
            © 2024 JustShip Built by shyam , for real-world deployments.
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
