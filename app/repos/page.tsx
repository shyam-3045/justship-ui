import { Lock, Globe } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GitHubRepo = {
  id: number;
  name: string;
  private: boolean;
  html_url: string;
};

async function getRepositories() {
  // Placeholder source until real OAuth token + user-specific API calls are wired in.
  const response = await fetch("https://api.github.com/users/vercel/repos?per_page=12", {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return [] as GitHubRepo[];
  }

  return (await response.json()) as GitHubRepo[];
}

export default async function RepositoriesPage() {
  const repositories = await getRepositories();

  return (
    <div className="min-h-screen bg-background bg-glow">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <Card>
          <CardHeader>
            <CardTitle>Repositories</CardTitle>
            <CardDescription>
              Select a repository and ship a frontend deployment in one click.
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
                      {repo.private ? <Lock className="size-3.5" /> : <Globe className="size-3.5" />}
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
                    <Button size="sm">Deploy</Button>
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
