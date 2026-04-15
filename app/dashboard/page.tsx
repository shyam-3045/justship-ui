"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  GitBranch,
  Zap,
  Server,
  BarChart3,
} from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background bg-glow">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
          <DashboardSidebar activeLabel="Projects" />
          <section className="w-full">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>
                  Connect with GitHub or Google to create and manage frontend
                  deployments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-muted-foreground">
                  Please login to access your dashboard.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-glow">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
        <DashboardSidebar activeLabel="Projects" />

        <section className="w-full">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome Card */}
            <motion.div variants={itemVariants}>
              <Card className="glass overflow-hidden border-border/70">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="mb-2 text-2xl text-foreground">
                        Welcome, {user.name}! 🚀
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Your luxury deployment dashboard is ready
                      </CardDescription>
                    </div>
                    <div className="p-4 rounded-xl glass-subtle">
                      <Activity className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid md:grid-cols-3 gap-4"
              variants={containerVariants}
            >
              {[
                {
                  icon: Zap,
                  title: "Deployments",
                  value: "24",
                  label: "This month",
                  color: "text-emerald-700 dark:text-emerald-400",
                },
                {
                  icon: BarChart3,
                  title: "Uptime",
                  value: "99.99%",
                  label: "Last 30 days",
                  color: "text-blue-700 dark:text-blue-400",
                },
                {
                  icon: Server,
                  title: "Active Sites",
                  value: "12",
                  label: "Running now",
                  color: "text-purple-700 dark:text-purple-400",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={i} variants={itemVariants}>
                    <Card className="glass border-border/70">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </span>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="mb-1 text-3xl font-bold text-foreground">
                          {stat.value}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {stat.label}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* New Deployment Card */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/70">
                <CardHeader>
                  <CardTitle>New Deployment</CardTitle>
                  <CardDescription>
                    Paste a GitHub repository URL to trigger a build
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 md:flex-row">
                  <Input
                    placeholder="https://github.com/org/repo"
                    className="glass-subtle border-border/60 text-foreground placeholder:text-muted-foreground"
                    defaultValue="https://github.com/vercel/next.js"
                  />
                  <Button variant="default" className="whitespace-nowrap">
                    Deploy
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Deployments */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/70">
                <CardHeader>
                  <CardTitle>Recent Deployments</CardTitle>
                  <CardDescription>
                    Your latest deployment history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      name: "my-portfolio-site",
                      status: "success",
                      time: "5 minutes ago",
                      url: "https://my-portfolio.justship.dev",
                    },
                    {
                      name: "ecommerce-frontend",
                      status: "building",
                      time: "12 minutes ago",
                      url: "https://ecommerce.justship.dev",
                    },
                    {
                      name: "dashboard-app",
                      status: "success",
                      time: "1 hour ago",
                      url: "https://dashboard.justship.dev",
                    },
                  ].map((deployment, index) => (
                    <motion.div
                      key={deployment.name}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 md:flex-row md:items-center transition-colors hover:bg-card/60"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg glass-subtle">
                          <GitBranch className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {deployment.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {deployment.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            deployment.status === "success"
                              ? "success"
                              : "warning"
                          }
                        >
                          {deployment.status}
                        </Badge>
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {deployment.url.split("//")[1]}
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
