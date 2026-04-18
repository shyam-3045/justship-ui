"use client";

import { useEffect, useState } from "react";
import { Globe, Lock } from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { useAuth } from "@/components/providers/auth-provider";
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
};

export default function RepositoriesPage() {
  const { user, loading } = useAuth();
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchRepositories = async () => {
      const response = await fetch(
        "https://api.github.com/users/vercel/repos?per_page=12",
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setRepositories([]);
        return;
      }

      const data = (await response.json()) as GitHubRepo[];
      setRepositories(data);
    };

    fetchRepositories();
  }, [user]);

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
      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <Card>
          <CardHeader>
            <CardTitle>My Repositories</CardTitle>
            <CardDescription>
              Select a repository and continue to Deploy With URL with the repo
              URL pre-filled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {repositories.map((repo) => (
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
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      View
                    </a>
                    <Link
                      href={`/deploy?url=${encodeURIComponent(repo.html_url)}&projectName=${encodeURIComponent(repo.name)}`}
                    >
                      <Button size="sm">Deploy</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
