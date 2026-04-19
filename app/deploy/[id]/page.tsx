"use client";

import { useEffect, useMemo } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { LogsPanel } from "@/components/logs-panel";
import { Navbar } from "@/components/navbar";
import { useTheme } from "@/components/providers/custom-theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { mockBuildLogs, mockDeployments } from "@/lib/mock-data";
import { useRedeployHook } from "@/hooks/customHooks/deploy";
import { toastSuccess, toastFailure } from "@/utils/toast";

const statusVariantMap = {
  building: "warning",
  success: "success",
  failed: "destructive",
} as const;

export default function DeployDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const redeployMutation = useRedeployHook();

  const projectName = searchParams.get("projectName") || "Deployment";
  const cdnUrl = searchParams.get("cdnUrl") || "";

  const deployment = useMemo(
    () =>
      mockDeployments.find((item) => item.id === params.id) ??
      mockDeployments[0],
    [params.id],
  );

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/deploy");
  }, [loading, user, router]);

  const handleRedeploy = async () => {
    try {
      // Extract projectId from the deployment or use a placeholder
      // In a real scenario, you'd get this from your backend
      await redeployMutation.mutateAsync({ projectId: params.id });
      toastSuccess("Redeploy triggered successfully!", theme);
    } catch (error) {
      toastFailure("Failed to trigger redeploy", theme);
      console.error(error);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background bg-glow">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8 lg:px-10">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {projectName}
                  <Badge variant={statusVariantMap[deployment.status]}>
                    {deployment.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Build status and streaming logs for this deployment.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deployment URL */}
            <div className="rounded-xl border border-border/60 bg-background/30 p-4">
              <p className="text-xs text-muted-foreground">Deployment URL</p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={cdnUrl || deployment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200 break-all"
                >
                  {cdnUrl || deployment.url}
                </a>
                <a
                  href={cdnUrl || deployment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
                >
                  <ExternalLink className="size-4 flex-shrink-0" />
                </a>
              </div>
            </div>

            {/* Redeploy Button */}
            <Button
              variant="secondary"
              onClick={handleRedeploy}
              disabled={redeployMutation.isPending}
            >
              <RefreshCw className="size-4" />
              {redeployMutation.isPending ? "Redeploying..." : "Re-deploy"}
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
