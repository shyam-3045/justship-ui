"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import { Input } from "@/components/ui/input";

type DeployFormState = {
  url: string;
  buildPath: string;
  env: string;
  projectName: string;
  userId: string;
  framework: string;
};

const initialFormState: DeployFormState = {
  url: "",
  buildPath: "",
  env: "",
  projectName: "",
  userId: "",
  framework: "next",
};

const pendingDeployKey = "justship-pending-deploy";

export default function DeployPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<DeployFormState>(initialFormState);

  useEffect(() => {
    const urlFromQuery = searchParams.get("url") || "";
    const projectNameFromQuery = searchParams.get("projectName") || "";

    if (urlFromQuery || projectNameFromQuery) {
      setForm((prev) => ({
        ...prev,
        url: urlFromQuery || prev.url,
        projectName: projectNameFromQuery || prev.projectName,
      }));
      return;
    }

    const pendingRaw = localStorage.getItem(pendingDeployKey);
    if (!pendingRaw) return;

    try {
      const pending = JSON.parse(pendingRaw) as DeployFormState;
      setForm(pending);
    } catch {
      localStorage.removeItem(pendingDeployKey);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    localStorage.removeItem(pendingDeployKey);
    setForm((prev) => ({
      ...prev,
      userId: prev.userId || user.name,
    }));
  }, [user]);

  const updateField = (key: keyof DeployFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      localStorage.setItem(pendingDeployKey, JSON.stringify(form));
      router.push("/login?next=/deploy");
      return;
    }

    // Placeholder deployment trigger until backend deployment API is connected.
    const deploymentId = `dep_${Math.random().toString(36).slice(2, 8)}`;
    router.push(`/deploy/${deploymentId}`);
  };

  return (
    <div className="min-h-screen bg-background bg-glow">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-10">
        <Card className="glass border-border/70">
          <CardHeader>
            <CardTitle>Deploy Your First App With URL</CardTitle>
            <CardDescription>
              Add repository details and deploy. You must login before the
              deployment is triggered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <Input
                value={form.url}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="Repository URL"
                required
              />
              <Input
                value={form.buildPath}
                onChange={(e) => updateField("buildPath", e.target.value)}
                placeholder="Build Path (e.g. apps/web)"
                required
              />
              <Input
                value={form.env}
                onChange={(e) => updateField("env", e.target.value)}
                placeholder="Environment Variables (e.g. API_KEY=abc)"
                required
              />
              <Input
                value={form.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
                placeholder="Project Name"
                required
              />
              <Input
                value={form.userId}
                onChange={(e) => updateField("userId", e.target.value)}
                placeholder="User ID"
                required
              />

              <select
                value={form.framework}
                onChange={(e) => updateField("framework", e.target.value)}
                className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground"
                required
              >
                <option value="next">Next.js</option>
                <option value="react">React</option>
                <option value="vite">Vite</option>
                <option value="nuxt">Nuxt</option>
              </select>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {user ? "Deploy Now" : "Login To Deploy"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
