"use client";

import { motion } from "framer-motion";
import { GitBranch, Mail, Sparkles, Code2, Palette, Zap } from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/premium-card";
import { SectionHeader } from "@/components/section-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { fadeInUp, containerVariants } from "@/lib/animations";

const team = [
  {
    name: "Creative Minds",
    role: "Product & Design",
    description:
      "Crafting the vision of a premium deployment platform with meticulous attention to detail.",
    icon: <Palette className="size-8" />,
  },
  {
    name: "Engineering Team",
    role: "Development",
    description:
      "Building robust, scalable infrastructure for lightning-fast deployments globally.",
    icon: <Code2 className="size-8" />,
  },
  {
    name: "Performance Team",
    role: "Optimization",
    description:
      "Ensuring every millisecond counts with continuous performance optimization.",
    icon: <Zap className="size-8" />,
  },
];

const technologies = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "Framer Motion",
  "Lucide React",
  "Node.js",
  "Docker",
  "AWS S3",
  "Cloudflare CDN",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background bg-glow overflow-hidden">
      {/* Navbar */}
      <Navbar showBorder={true} />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Sparkles className="size-4 text-purple-300" />
            <span className="text-xs font-semibold text-purple-300">
              About JustShip
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-foreground via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Empowering Developers{" "}
            </span>
            <span className="block">
              <span className="gradient-text">Worldwide</span>
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            JustShip is built with the collective vision of delivering an
            exceptional deployment experience. Every line of code, every design
            decision, and every feature is crafted with precision and care.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <PremiumCard className="border-purple-500/30 bg-purple-500/5">
              <div className="space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-purple-300">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                    Our Mission
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To revolutionize frontend deployment by providing a platform
                    that combines enterprise-grade reliability, exceptional
                    performance, and an enjoyable developer experience. We
                    believe in removing friction from the deployment process,
                    allowing teams to ship with confidence.
                  </p>
                </div>
              </div>
            </PremiumCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 md:py-32 px-6 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Meet the Team"
            subtitle="Our People"
            description="Dedicated professionals crafting exceptional experiences"
            centered
            gradient
          />

          <motion.div
            className="grid md:grid-cols-3 gap-8 mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeInUp} custom={i}>
                <PremiumCard hover gradient className="h-full flex flex-col">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-purple-300">
                    {member.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {member.name}
                  </h3>
                  <p className="text-sm font-semibold text-purple-400 mb-3">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {member.description}
                  </p>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Our Values"
            subtitle="What Drives Us"
            description=""
            centered
            gradient
          />

          <motion.div
            className="grid md:grid-cols-2 gap-6 mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                title: "Excellence",
                description:
                  "We pursue the highest standards in everything we do, from code quality to user experience.",
              },
              {
                title: "Reliability",
                description:
                  "Enterprise-grade infrastructure and 99.99% uptime commitment to keep your apps running.",
              },
              {
                title: "Innovation",
                description:
                  "Continuously evolving with cutting-edge technologies and forward-thinking solutions.",
              },
              {
                title: "Community",
                description:
                  "We believe in transparent communication and actively listen to our users' feedback.",
              },
            ].map((value, i) => (
              <motion.div key={i} variants={fadeInUp} custom={i}>
                <PremiumCard className="h-full">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative py-20 md:py-32 px-6 bg-gradient-to-b from-transparent to-purple-900/10">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            title="Built With Modern Tech"
            subtitle="Technology Stack"
            description="Leveraging the best tools available for optimal performance"
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
                <PremiumCard className="px-4 py-2 text-sm font-medium text-purple-300">
                  {tech}
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Credits Section */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="space-y-8">
              <SectionHeader
                title="Project Credits"
                subtitle="Special Thanks"
                description=""
                centered
              />

              <PremiumCard className="border-purple-500/30 bg-purple-500/5">
                <div className="space-y-6 text-center">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    JustShip is a modern deployment platform built with
                    dedication and passion. This project demonstrates the power
                    of combining excellent design principles, cutting-edge
                    technologies, and user-centric development.
                  </p>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-purple-300 uppercase tracking-widest">
                      Special thanks to:
                    </p>
                    <p className="text-muted-foreground">
                      Vercel for inspiration in UI/UX excellence • The React and
                      Next.js communities for incredible tools • Tailwind CSS
                      for design systems excellence • All the developers who use
                      and believe in JustShip
                    </p>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard className="border-blue-500/30 bg-blue-500/5">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    Open Source & Community
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're passionate about open source and contributing back to
                    the community. JustShip is built on the shoulders of giants
                    and we're proud to support the ecosystems that power us.
                  </p>
                  <div className="pt-4">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <GitBranch className="size-5" />
                      <span>View on GitHub</span>
                    </a>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-20 md:py-32 px-6 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <motion.div
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <PremiumCard className="text-center py-16 md:py-20 px-8">
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold gradient-text"
                variants={fadeInUp}
                custom={0}
              >
                Get In Touch
              </motion.h2>
              <motion.p
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                variants={fadeInUp}
                custom={1}
              >
                Have questions? Want to collaborate? We'd love to hear from you.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                variants={fadeInUp}
                custom={2}
              >
                <a href="mailto:contact@justship.dev">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Mail className="size-4" />
                    Email Us
                  </Button>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="secondary" className="gap-2">
                    <GitBranch className="size-4" />
                    GitHub
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </PremiumCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/70 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-6">
            © 2024 JustShip. Built with care for developers worldwide.
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
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
