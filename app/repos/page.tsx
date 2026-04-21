"use client";

import { Globe, Lock } from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { useGetRepos } from "@/hooks/customHooks/repos";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type GitHubRepo = {
  id: number;
  name: string;
  private: boolean;
  html_url: string;
  full_name?: string;
  url?: string;
  clone_url?: string;
  ssh_url?: string;
};

export default function RepositoriesPage() {
  const { user, loading } = useAuth();
  const { data, isLoading, isError } = useGetRepos(Boolean(user));
  const repositories: GitHubRepo[] = Array.isArray(data)
    ? (data as GitHubRepo[])
    : Array.isArray((data as { repos?: GitHubRepo[] } | undefined)?.repos)
      ? ((data as { repos?: GitHubRepo[] }).repos ?? [])
      : [];

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background bg-glow">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-6 py-8 lg:px-10">
          <Card>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please login to view and deploy from your repositories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login?next=/repos">
                <Button>Go To Login</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-glow">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8 lg:px-10">
        <DashboardSidebar activeLabel="My Repos" />
        <section className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>My Repositories</CardTitle>
              <CardDescription>
                Select a repository and continue to Deploy With URL with the
                repo URL pre-filled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading repositories...
                </p>
              )}
              {isError && (
                <p className="text-sm text-destructive">
                  Could not load repositories. Please try again.
                </p>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                {repositories.map((repo) =>
                  (() => {
                    const deployRepoUrl =
                      repo.html_url ||
                      (repo.full_name
                        ? `https://github.com/${repo.full_name}`
                        : null) ||
                      repo.clone_url ||
                      repo.url ||
                      repo.ssh_url ||
                      "";

                    return (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/30 p-4"
                      >
                        <div>
                          <p className="font-medium">{repo.name}</p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            {repo.private ? (
                              <Lock className="size-3.5" />
                            ) : (
                              <Globe className="size-3.5" />
                            )}
                            {repo.private ? "private" : "public"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          
                          <Link
                            href={`/deploy?url=${encodeURIComponent(deployRepoUrl)}&projectName=${encodeURIComponent(repo.name)}`}
                          >
                            <Button size="sm">Deploy</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })(),
                )}
              </div>
              {!isLoading && !isError && repositories.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  No repositories found for this account.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
