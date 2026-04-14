"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";

import { LogsPanel } from "@/components/logs-panel";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockBuildLogs, mockDeployments } from "@/lib/mock-data";

const statusVariantMap = {
  building: "warning",
  success: "success",
  failed: "destructive",
} as const;

export default function DeployDetailPage() {
  const params = useParams<{ id: string }>();
  const deployment = useMemo(
    () =>
      mockDeployments.find((item) => item.id === params.id) ??
      mockDeployments[0],
    [params.id],
  );

  return (
    <div className="min-h-screen bg-background bg-glow">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8 lg:px-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Deployment {deployment.id}
              <Badge variant={statusVariantMap[deployment.status]}>
                {deployment.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Build status and streaming logs for this release.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-background/30 p-4">
              <p className="text-xs text-muted-foreground">Deployment URL</p>
              <a
                href={deployment.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
              >
                {deployment.url}
              </a>
            </div>
            <Button variant="secondary">
              <RefreshCw className="size-4" />
              Re-deploy
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build Logs</CardTitle>
            <CardDescription>
              Terminal stream is UI-ready for real-time WebSocket integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogsPanel initialLogs={mockBuildLogs} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
