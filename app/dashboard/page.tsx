"use client";

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  FolderGit2,
  FolderOpenDot,
  GitBranch,
  BarChart3,
  Globe,
  Layers3,
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
import { CenterLoader } from "@/components/ui/center-loader";
import { useGetProjects } from "@/hooks/customHooks/project";

type Project = {
  _id: string;
  name: string;
  currentVersion: number;
  repoUrl: string;
  url: string;
  createdAt: string;
  subfolder?: string;
};

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
  const { data: projectsData, isLoading: projectsLoading } = useGetProjects(
    Boolean(user),
  );

  const projects = useMemo(() => {
    if (Array.isArray(projectsData?.projects)) {
      return projectsData.projects as Project[];
    }

    if (Array.isArray(projectsData)) {
      return projectsData as Project[];
    }

    return [] as Project[];
  }, [projectsData]);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const liveSites = projects.filter((project) => Boolean(project.url)).length;
    const latestVersion = projects.reduce(
      (max, project) => Math.max(max, Number(project.currentVersion) || 0),
      0,
    );

    return { totalProjects, liveSites, latestVersion };
  }, [projects]);

  if (loading || projectsLoading) {
    return (
      <div className="min-h-screen bg-background bg-glow">
        <CenterLoader label="Loading dashboard..." className="min-h-screen" />
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
                        You have {stats.totalProjects} live project
                        {stats.totalProjects === 1 ? "" : "s"} in your
                        workspace. Latest version is v{stats.latestVersion || 0}
                        .
                      </CardDescription>
                    </div>
                    <div className="p-4 rounded-xl glass-subtle">
                      <Layers3 className="w-6 h-6 text-muted-foreground" />
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
                  icon: FolderGit2,
                  title: "Projects",
                  value: String(stats.totalProjects),
                  label: "Managed projects",
                  color: "text-emerald-700 dark:text-emerald-400",
                },
                {
                  icon: Globe,
                  title: "Live Sites",
                  value: String(stats.liveSites),
                  label: "Projects with live URLs",
                  color: "text-blue-700 dark:text-blue-400",
                },
                {
                  icon: BarChart3,
                  title: "Latest Version",
                  value: `v${stats.latestVersion || 0}`,
                  label: "Most recent project version",
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
                    <FolderGit2 className="size-5" /> My Projects
                  </CardTitle>
                  <CardDescription>
                    Real project data from your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/repos">
                    <Button variant="secondary">Open My Repos</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Projects */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-border/70">
                <CardHeader>
                  <CardTitle>My Projects</CardTitle>
                  <CardDescription>
                    Projects and live deployment URLs fetched from your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project._id}
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
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Version {project.currentVersion}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={project.url ? "success" : "warning"}>
                          {project.url ? "live" : "pending"}
                        </Badge>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {project.url.replace(/^https?:\/\//, "")}
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                        <Link
                          href={`/deploy?url=${encodeURIComponent(project.repoUrl)}&projectName=${encodeURIComponent(project.name)}`}
                        >
                          <Button size="sm" variant="secondary">
                            Re-deploy
                          </Button>
                        </Link>
                        <Link href={`/projects/${project._id}`}>
                          <Button size="sm" variant="secondary">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                  {projects.length === 0 && (
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
