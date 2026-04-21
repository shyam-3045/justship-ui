"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Radio, Wifi, WifiOff } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

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
import { useGetLogs } from "@/hooks/customHooks/deploy";
import { getSocket } from "@/lib/socket";
import { getErrorMessage, getSuccessMessage } from "@/utils/api-message";
import { toastSuccess, toastFailure } from "@/utils/toast";

type DeploymentStatus =
  | "queued"
  | "building"
  | "success"
  | "failed"
  | "unknown";

const statusVariantMap = {
  queued: "warning",
  building: "warning",
  success: "success",
  failed: "destructive",
  unknown: "default",
} as const;

const activeDeploymentJobKey = "justship-active-deployment-job";

const toLogLines = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.map((line) => String(line));
  }

  if (typeof payload === "string") {
    return [payload];
  }

  if (payload && typeof payload === "object") {
    const maybeRecord = payload as {
      logs?: unknown;
      log?: unknown;
      message?: unknown;
    };

    if (Array.isArray(maybeRecord.logs)) {
      return maybeRecord.logs.map((line) => String(line));
    }

    if (typeof maybeRecord.log === "string") {
      return [maybeRecord.log];
    }

    if (typeof maybeRecord.message === "string") {
      return [maybeRecord.message];
    }
  }

  return [];
};

const normalizeStatus = (value?: string): DeploymentStatus => {
  const status = (value || "").toLowerCase();

  if (!status) return "unknown";
  if (status.includes("queue")) return "queued";
  if (status.includes("build") || status.includes("progress"))
    return "building";
  if (status.includes("success") || status.includes("complete"))
    return "success";
  if (status.includes("fail") || status.includes("error")) return "failed";

  return "unknown";
};

export default function DeployDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const jobId = params.id;
  const projectName = searchParams.get("projectName") || "Deployment";
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState<DeploymentStatus | null>(null);
  const [liveUrl, setLiveUrl] = useState<string>("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { data: logsData, isLoading: isLogsLoading } = useGetLogs(jobId);

  const fetchedLogs = useMemo(
    () => toLogLines(logsData?.logs),
    [logsData?.logs],
  );
  const fetchedStatus = useMemo(
    () => normalizeStatus(logsData?.status),
    [logsData?.status],
  );
  const fetchedUrl = logsData?.url || logsData?.cdnUrl || "";

  const logs = useMemo(() => {
    const merged = [...fetchedLogs, ...liveLogs];
    return merged.filter(
      (line, index) => index === 0 || line !== merged[index - 1],
    );
  }, [fetchedLogs, liveLogs]);

  const status =
    liveStatus || (fetchedStatus !== "unknown" ? fetchedStatus : "building");
  const deploymentUrl = liveUrl || fetchedUrl;

  const clearActiveDeploymentLock = () => {
    localStorage.removeItem(activeDeploymentJobKey);
  };

  const socket = useMemo(() => {
    try {
      return getSocket();
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!socket) {
      toastFailure(
        "Socket URL is not configured. Live logs are unavailable.",
        theme,
      );
    }
  }, [socket, theme]);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/deploy");
  }, [loading, user, router]);

  useEffect(() => {
    if (!jobId) return;

    // Do not keep an active lock for terminal statuses.
    if (status === "success" || status === "failed") {
      clearActiveDeploymentLock();
      return;
    }

    const existingRaw = localStorage.getItem(activeDeploymentJobKey);
    let existingStartedAt = Date.now();

    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw) as {
          startedAt?: number;
          jobId?: string;
        };

        if (
          existing.jobId === jobId &&
          typeof existing.startedAt === "number" &&
          existing.startedAt > 0
        ) {
          existingStartedAt = existing.startedAt;
        }
      } catch {
        existingStartedAt = Date.now();
      }
    }

    localStorage.setItem(
      activeDeploymentJobKey,
      JSON.stringify({
        jobId,
        projectName,
        startedAt: existingStartedAt,
      }),
    );
  }, [jobId, projectName, status]);

  useEffect(() => {
    if (!socket || !jobId) return;

    const handleConnect = () => {
      setIsSocketConnected(true);
      socket.emit("join_room", jobId);
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, jobId]);

  useEffect(() => {
    if (!socket) return;

    const handleLogs = (payload: unknown) => {
      const incoming = toLogLines(payload);
      if (incoming.length === 0) return;

      setLiveLogs((prev) => [...prev, ...incoming]);
    };

    const handleStatus = (payload: unknown) => {
      if (typeof payload === "string") {
        setLiveStatus(normalizeStatus(payload));
        return;
      }

      if (payload && typeof payload === "object") {
        const nextStatus = (payload as { status?: string }).status;
        setLiveStatus(normalizeStatus(nextStatus));
      }
    };

    const handleComplete = (payload: unknown) => {
      setLiveStatus("success");

      if (payload && typeof payload === "object") {
        const nextUrl =
          (payload as { url?: string; cdnUrl?: string }).url ||
          (payload as { url?: string; cdnUrl?: string }).cdnUrl;

        if (nextUrl) {
          setLiveUrl(nextUrl);
        }
      }

      clearActiveDeploymentLock();
      toastSuccess(
        getSuccessMessage(payload, "Deployment completed successfully!"),
        theme,
      );
    };

    const handleFailed = (payload: unknown) => {
      setLiveStatus("failed");
      clearActiveDeploymentLock();
      toastFailure(
        getErrorMessage(payload, "Deployment failed. Check logs for details."),
        theme,
      );
    };

    socket.on("logs", handleLogs);
    socket.on("status", handleStatus);
    socket.on("complete", handleComplete);
    socket.on("failed", handleFailed);

    return () => {
      socket.off("logs", handleLogs);
      socket.off("status", handleStatus);
      socket.off("complete", handleComplete);
      socket.off("failed", handleFailed);
    };
  }, [socket, theme]);

  const statusLabel = useMemo(() => {
    if (status === "success") return "completed";
    return status;
  }, [status]);

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
                  <Badge variant={statusVariantMap[status]}>
                    {statusLabel}
                  </Badge>
                  <Badge variant={isSocketConnected ? "success" : "warning"}>
                    {isSocketConnected ? (
                      <Wifi className="mr-1 size-3" />
                    ) : (
                      <WifiOff className="mr-1 size-3" />
                    )}
                    {isSocketConnected ? "live" : "reconnecting"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Real-time deployment status and logs for job {jobId}.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deployment URL */}
            <div className="rounded-xl border border-border/60 bg-background/30 p-4">
              <p className="text-xs text-muted-foreground">Deployment URL</p>
              <div className="flex items-center gap-2 mt-2">
                {status === "success" && deploymentUrl ? (
                  <>
                    <a
                      href={deploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 break-all"
                    >
                      {deploymentUrl}
                    </a>
                    <a
                      href={deploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                      <ExternalLink className="size-4 shrink-0" />
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    URL will appear here once deployment is completed.
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => router.push("/deployments")}
            >
              Go To My Deployments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build Logs</CardTitle>
            <CardDescription>
              Live terminal output with automatic refresh recovery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border/70 bg-neutral-950 p-4 shadow-inner">
              <div className="mb-3 flex items-center gap-2 text-xs text-neutral-300">
                <Radio className="size-3 text-emerald-400" />
                Stream
                {isLogsLoading && (
                  <span className="ml-2 inline-flex items-center gap-1 text-neutral-400">
                    <Loader2 className="size-3 animate-spin" /> Restoring
                    logs...
                  </span>
                )}
              </div>

              <div className="max-h-105 overflow-y-auto rounded-xl border border-white/10 bg-black/80 p-4 font-mono text-sm leading-6 text-emerald-300">
                {logs.length === 0 ? (
                  <p className="text-neutral-400">Waiting for logs...</p>
                ) : (
                  logs.map((line, index) => (
                    <p key={`${jobId}-${index}`} className="wrap-break-word">
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
