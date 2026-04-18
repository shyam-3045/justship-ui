"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, GitBranch, RefreshCw } from "lucide-react";
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
import { type Deployment } from "@/lib/mock-data";

type StoredDeployment = Deployment & {
  ownerId?: string;
  repoUrl?: string;
};

const deploymentsStorageKey = "justship-user-deployments";

export default function DeploymentsPage() {
  const { user } = useAuth();
  const [deployments, setDeployments] = useState<StoredDeployment[]>([]);

  useEffect(() => {
    if (!user) return;

    const raw = localStorage.getItem(deploymentsStorageKey);
    if (!raw) {
      setDeployments([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredDeployment[];
      const owned = Array.isArray(parsed)
        ? parsed.filter((item) => item.ownerId === user.name)
        : [];
      setDeployments(owned);
    } catch {
      setDeployments([]);
    }
  }, [user]);

  const total = useMemo(() => deployments.length, [deployments]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background bg-glow">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
          <DashboardSidebar activeLabel="My Deployments" />
          <section className="w-full">
            <Card className="glass border-border/70">
              <CardHeader>
                <CardTitle>Login Required</CardTitle>
                <CardDescription>
                  Please login to view your deployments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login?next=/deployments">
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
        <DashboardSidebar activeLabel="My Deployments" />

        <section className="w-full space-y-6">
          <Card className="glass border-border/70">
            <CardHeader>
              <CardTitle>My Deployments</CardTitle>
              <CardDescription>
                Only deployments created by your account are shown here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total deployments: {total}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border/70">
            <CardHeader>
              <CardTitle>Deployment List</CardTitle>
              <CardDescription>
                Re-deploy any app from your previous deployments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 md:flex-row md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg glass-subtle p-2">
                      <GitBranch className="size-4 text-muted-foreground" />
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
                          : deployment.status === "failed"
                            ? "destructive"
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
                      <ArrowUpRight className="size-3" />
                    </a>
                    <Link
                      href={`/deploy?url=${encodeURIComponent(deployment.repoUrl || deployment.url)}&projectName=${encodeURIComponent(deployment.projectName)}`}
                    >
                      <Button size="sm" variant="secondary">
                        <RefreshCw className="size-4" />
                        Re-deploy
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {deployments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No deployments yet. Go to My Repos and deploy your first app.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
