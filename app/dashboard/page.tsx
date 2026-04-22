"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  FolderGit2,
  FolderOpenDot,
  GitBranch,
  Trash2,
  Zap,
  Server,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

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
import { AppLoadingScreen } from "@/components/ui/app-loading-screen";
import { mockDeployments, type Deployment } from "@/lib/mock-data";

type StoredDeployment = Deployment & {
  ownerId?: string;
  repoUrl?: string;
};

const deploymentsStorageKey = "justship-user-deployments";

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [myDeployments, setMyDeployments] = useState<StoredDeployment[]>([]);

  useEffect(() => {
    if (!user) return;

    const raw = localStorage.getItem(deploymentsStorageKey);
    if (!raw) {
      // Seed with mock items for the current user until API integration is added.
      const seeded = mockDeployments.map((item) => ({
        ...item,
        ownerId: user.name,
      }));
      localStorage.setItem(deploymentsStorageKey, JSON.stringify(seeded));
      setMyDeployments(seeded);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredDeployment[];
      const owned = Array.isArray(parsed)
        ? parsed.filter((item) => item.ownerId === user.name)
        : [];
      setMyDeployments(owned);
    } catch {
      setMyDeployments([]);
    }
  }, [user]);

  const deploymentCount = useMemo(() => myDeployments.length, [myDeployments]);

  const removeDeployment = (id: string) => {
    if (!user) return;
    const raw = localStorage.getItem(deploymentsStorageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as StoredDeployment[];
      const next = Array.isArray(parsed)
        ? parsed.filter((item) => item.id !== id)
        : [];
      localStorage.setItem(deploymentsStorageKey, JSON.stringify(next));
      setMyDeployments(next.filter((item) => item.ownerId === user.name));
    } catch {
      // no-op: keep current in-memory list if storage format is invalid
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-glow">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
          <DashboardSidebar activeLabel="Dashboard" />
          <section className="w-full">
            <AppLoadingScreen
              title="Loading dashboard"
              subtitle="Fetching your deployments and project activity..."
            />
          </section>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background bg-glow">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
          <DashboardSidebar activeLabel="Dashboard" />
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
                <Link href="/login">
                  <Button>Go To Login</Button>
                </Link>
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
        <DashboardSidebar activeLabel="Dashboard" />

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
                  value: String(deploymentCount),
                  label: "Your deployments",
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

            <motion.div variants={itemVariants}>
              <Card className="glass border-border/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderGit2 className="size-5" /> My Repositories
                  </CardTitle>
                  <CardDescription>
                    Pick one of your repos and continue to deploy with URL
                    pre-filled.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/repos">
                    <Button variant="secondary">Open My Repos</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Deployments */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/70">
                <CardHeader>
                  <CardTitle>My Deployments</CardTitle>
                  <CardDescription>
                    Only deployments created by your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myDeployments.map((deployment, index) => (
                    <motion.div
                      key={deployment.id}
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
                            {deployment.projectName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {deployment.timestamp}
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
                        <Link
                          href={`/deploy?url=${encodeURIComponent(deployment.repoUrl || deployment.url)}&projectName=${encodeURIComponent(deployment.projectName)}`}
                        >
                          <Button size="sm" variant="secondary">
                            Re-deploy
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeDeployment(deployment.id)}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {myDeployments.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-background/55 p-6 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card/70">
                        <FolderOpenDot className="size-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        No projects found yet
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Connect a repo and deploy your first project to see it
                        listed here.
                      </p>
                      <div className="mt-4">
                        <Link href="/repos">
                          <Button variant="secondary" size="sm">
                            Open My Repos
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
