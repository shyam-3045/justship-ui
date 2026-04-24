"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BellRing } from "lucide-react";
import { useRouter } from "next/navigation";

import { useGetMe } from "@/hooks/customHooks/auth";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DeploymentTriggeredPayload = {
  projectId: string;
  jobId: string;
  commitHash: string;
};

type UserProfile = {
  userId: string;
};

const toStringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const shortCommit = (commitHash: string) => {
  if (!commitHash) return "-";
  return commitHash.slice(0, 8);
};

const getFirstNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    const parsed = toStringValue(value);
    if (parsed) return parsed;
  }

  return "";
};

const extractUserProfile = (payload: unknown): UserProfile => {
  if (!payload || typeof payload !== "object") {
    return { userId: "" };
  }

  const data = payload as Record<string, unknown>;
  const nestedUser =
    data.user && typeof data.user === "object"
      ? (data.user as Record<string, unknown>)
      : null;

  return {
    userId: getFirstNonEmpty(
      data._id,
      data.id,
      data.userId,
      nestedUser?._id,
      nestedUser?.id,
      nestedUser?.userId,
    ),
  };
};

export function DeploymentWebhookNotifier() {
  const router = useRouter();
  const { data: userData, isLoading } = useGetMe();
  const [notifications, setNotifications] = useState<
    DeploymentTriggeredPayload[]
  >([]);
  const registeredUserRef = useRef<string>("");

  const socket = useMemo(() => {
    try {
      return getSocket();
    } catch {
      return null;
    }
  }, []);

  const profile = useMemo(() => extractUserProfile(userData), [userData]);
  const userId = profile.userId;

  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // no-op cleanup, listeners are managed in dedicated effects
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !userId) return;

    const registerUser = () => {
      socket.emit("register", userId);
      console.log("[webhook] register", { userId });
      console.log("[verify] register emitted", userId);
      registeredUserRef.current = userId;
    };

    const handleConnect = () => {
      registerUser();
    };

    if (socket.connected) {
      registerUser();
    } else {
      socket.connect();
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!socket) return;

    const handleDeploymentTriggered = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;

      const next = payload as {
        projectId?: unknown;
        jobId?: unknown;
        commitHash?: unknown;
      };

      const projectId = toStringValue(next.projectId);
      const jobId = toStringValue(next.jobId);
      const commitHash = toStringValue(next.commitHash);

      if (!projectId || !jobId) return;

      console.log("🔥 RECEIVED:", {
        projectId,
        jobId,
        commitHash,
      });
      console.log("[webhook] deployment_triggered", {
        projectId,
        jobId,
        commitHash,
      });

      setNotifications((prev) => {
        if (prev.some((item) => item.jobId === jobId)) {
          return prev;
        }

        return [...prev, { projectId, jobId, commitHash }];
      });
    };

    socket.on("deployment_triggered", handleDeploymentTriggered);

    return () => {
      socket.off("deployment_triggered", handleDeploymentTriggered);
    };
  }, [socket]);

  const activeNotification = notifications[0];

  if (isLoading) {
    return null;
  }

  if (!activeNotification && !userId) {
    return null;
  }

  if (!activeNotification) return null;

  if (!userId) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-80 w-[min(24rem,calc(100vw-2rem))]">
      <Card className="pointer-events-auto border-emerald-500/35 bg-background/95 shadow-2xl backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellRing className="size-4 text-emerald-500" />
            Webhook CI/CD Triggered
          </CardTitle>
          <CardDescription>
            New deployment received from webhook. Choose what to do next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="rounded-lg border border-border/70 bg-card/70 p-3 text-xs text-muted-foreground">
            <p>
              Project ID:{" "}
              <span className="font-mono">{activeNotification.projectId}</span>
            </p>
            <p className="mt-1">
              Job ID:{" "}
              <span className="font-mono">{activeNotification.jobId}</span>
            </p>
            <p className="mt-1">
              Commit:{" "}
              <span className="font-mono">
                {shortCommit(activeNotification.commitHash)}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setNotifications((prev) => prev.slice(1));
              }}
            >
              Dismiss
            </Button>
            <Button
              onClick={() => {
                const query = new URLSearchParams({
                  projectId: activeNotification.projectId,
                });
                router.push(
                  `/deploy/${activeNotification.jobId}?${query.toString()}`,
                );
                setNotifications((prev) => prev.slice(1));
              }}
            >
              View Deployment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
