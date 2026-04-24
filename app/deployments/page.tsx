"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Globe,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/components/providers/auth-provider";
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
import { CenterLoader } from "@/components/ui/center-loader";
import { Input } from "@/components/ui/input";
import {
  useDeleteProject,
  useAutoDeploy,
  useGetProjects,
  useSetActiveVersion,
} from "@/hooks/customHooks/project";
import { useRedeployHook, useGetDeployments } from "@/hooks/customHooks/deploy";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage, getSuccessMessage } from "@/utils/api-message";
import { toastSuccess, toastFailure } from "@/utils/toast";

interface Project {
  _id: string;
  name: string;
  userId: string;
  autoDeploy?: boolean;
  currentVersion: number;
  repoUrl: string;
  subfolder: string;
  url: string;
  createdAt: string;
}

interface VersionDeployment {
  _id: string;
  projectId: string;
  version: number;
  status: "success" | "failed" | "building";
  cdnUrl: string;
  commitHash?: string;
  commit?: string;
  gitCommitHash?: string;
  sha?: string;
  completedAt: string;
  createdAt: string;
}

const activeDeploymentJobKey = "justship-active-deployment-job";
const activeDeploymentLockMaxAgeMs = 30 * 60 * 1000;
const pendingDeploymentLockMaxAgeMs = 2 * 60 * 1000;

const getDisplayHost = (url: string) => {
  if (!url) return "-";

  try {
    const parsed = new URL(url);
    return parsed.host.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
};

const getDeploymentCommitHash = (deployment: VersionDeployment | null) => {
  if (!deployment) return "";

  return (
    deployment.commitHash ||
    deployment.gitCommitHash ||
    deployment.commit ||
    deployment.sha ||
    ""
  );
};

const shortHash = (value: string) => {
  if (!value) return "-";
  return value.slice(0, 8);
};

export default function DeploymentsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [redeployingProjectId, setRedeployingProjectId] = useState<
    string | null
  >(null);
  const [projectPendingDelete, setProjectPendingDelete] =
    useState<Project | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [hasActiveDeploymentLock, setHasActiveDeploymentLock] = useState(false);
  const [autoDeployUpdatingProjectId, setAutoDeployUpdatingProjectId] =
    useState<string | null>(null);
  const redeployClickLockRef = useRef(false);

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useGetProjects();
  const projects = (projectsData?.projects || []) as Project[];

  // Fetch deployments for selected project
  const { data: deploymentsData, isLoading: deploymentsLoading } =
    useGetDeployments(selectedProjectId || "");
  const versionDeployments = (deploymentsData?.deployments ||
    []) as VersionDeployment[];

  // Redeploy mutation
  const redeployMutation = useRedeployHook();
  const autoDeployMutation = useAutoDeploy();
  const deleteProjectMutation = useDeleteProject();
  const queryClient = useQueryClient();

  const hasValidActiveDeployment = () => {
    const activeRaw = localStorage.getItem(activeDeploymentJobKey);
    if (!activeRaw) return false;

    try {
      const active = JSON.parse(activeRaw) as {
        startedAt?: number;
        jobId?: string;
      };
      const startedAt = active.startedAt;
      const jobId = active.jobId;

      if (
        jobId === "pending" &&
        typeof startedAt === "number" &&
        Date.now() - startedAt > pendingDeploymentLockMaxAgeMs
      ) {
        localStorage.removeItem(activeDeploymentJobKey);
        return false;
      }

      if (
        typeof startedAt === "number" &&
        Date.now() - startedAt > activeDeploymentLockMaxAgeMs
      ) {
        localStorage.removeItem(activeDeploymentJobKey);
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem(activeDeploymentJobKey);
      return false;
    }
  };

  useEffect(() => {
    if (!user) return;
  }, [user]);

  useEffect(() => {
    setHasActiveDeploymentLock(hasValidActiveDeployment());

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== activeDeploymentJobKey) return;
      setHasActiveDeploymentLock(hasValidActiveDeployment());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleRedeploy = async (projectId: string) => {
    if (
      redeployClickLockRef.current ||
      redeployMutation.isPending ||
      redeployingProjectId === projectId
    ) {
      return;
    }

    if (hasValidActiveDeployment()) {
      setHasActiveDeploymentLock(true);
      toastFailure("A deployment is already in progress. Please wait.", theme);
      return;
    }

    redeployClickLockRef.current = true;
    setRedeployingProjectId(projectId);
    setHasActiveDeploymentLock(true);
    try {
      const response = await redeployMutation.mutateAsync({ projectId });
      const jobId = response.jobID || response.jobId || response.deploymentId;
      const queueMessage = getSuccessMessage(response, "Job Added to Queue");

      if (!jobId) {
        throw new Error("Could not read job ID from redeploy response");
      }

      const selectedProject = projects.find(
        (project) => project._id === projectId,
      );

      localStorage.setItem(
        activeDeploymentJobKey,
        JSON.stringify({
          jobId,
          projectName: selectedProject?.name || "Deployment",
          startedAt: Date.now(),
        }),
      );

      toastSuccess(queueMessage, theme);
      router.push(
        `/deploy/${jobId}?projectName=${encodeURIComponent(selectedProject?.name || "Deployment")}`,
      );
    } catch (error) {
      localStorage.removeItem(activeDeploymentJobKey);
      setHasActiveDeploymentLock(false);
      toastFailure(getErrorMessage(error, "Failed to trigger redeploy"), theme);
      console.error(error);
    } finally {
      redeployClickLockRef.current = false;
      setRedeployingProjectId(null);
    }
  };

  const handleToggleAutoDeploy = async (project: Project, checked: boolean) => {
    if (autoDeployMutation.isPending) return;

    setAutoDeployUpdatingProjectId(project._id);
    try {
      const response = await autoDeployMutation.mutateAsync({
        projectId: project._id,
        autoDeploy: checked,
      });

      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toastSuccess(
        getSuccessMessage(
          response,
          checked
            ? "Auto deploy enabled for this project"
            : "Auto deploy disabled for this project",
        ),
        theme,
      );
    } catch (error) {
      toastFailure(
        getErrorMessage(error, "Failed to update auto deploy"),
        theme,
      );
      console.error(error);
    } finally {
      setAutoDeployUpdatingProjectId(null);
    }
  };

  const handleChangeVersion = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowVersionModal(true);
  };

  const handleOpenDeleteProject = (project: Project) => {
    setProjectPendingDelete(project);
    setDeleteConfirmationText("");
  };

  const handleCloseDeleteProject = () => {
    if (deleteProjectMutation.isPending) return;

    setProjectPendingDelete(null);
    setDeleteConfirmationText("");
  };

  const handleDeleteProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !projectPendingDelete ||
      deleteProjectMutation.isPending ||
      deleteConfirmationText.trim().toLowerCase() !== "confirm"
    ) {
      return;
    }

    try {
      const response = await deleteProjectMutation.mutateAsync({
        projectId: projectPendingDelete._id,
      });

      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      if (selectedProjectId === projectPendingDelete._id) {
        setSelectedProjectId(null);
        setShowVersionModal(false);
      }

      toastSuccess(
        getSuccessMessage(response, "Project deleted successfully!"),
        theme,
      );
      handleCloseDeleteProject();
    } catch (error) {
      toastFailure(getErrorMessage(error, "Failed to delete project"), theme);
      console.error(error);
    }
  };

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
          {/* Projects Section */}
          <Card className="glass border-border/70">
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>
                Manage and redeploy your projects from here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {projectsLoading ? (
                <CenterLoader
                  label="Loading projects..."
                  className="min-h-72"
                />
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No projects found. Create a project to get started.
                </p>
              ) : (
                projects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    hasActiveDeploymentLock={hasActiveDeploymentLock}
                    isRedeployPending={
                      redeployMutation.isPending ||
                      redeployingProjectId === project._id
                    }
                    isAutoDeployUpdating={
                      autoDeployMutation.isPending &&
                      autoDeployUpdatingProjectId === project._id
                    }
                    onOpenProject={() =>
                      router.push(`/projects/${project._id}`)
                    }
                    onRedeploy={() => handleRedeploy(project._id)}
                    onChangeVersion={() => handleChangeVersion(project._id)}
                    onDelete={() => handleOpenDeleteProject(project)}
                    onToggleAutoDeploy={(checked) =>
                      handleToggleAutoDeploy(project, checked)
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>

          {showVersionModal && (
            <VersionModal
              isOpen={showVersionModal}
              onClose={() => setShowVersionModal(false)}
              deployments={versionDeployments}
              isLoading={deploymentsLoading}
              projectId={selectedProjectId}
            />
          )}

          {projectPendingDelete && (
            <DeleteProjectModal
              isOpen={!!projectPendingDelete}
              projectName={projectPendingDelete.name}
              confirmationText={deleteConfirmationText}
              onConfirmationTextChange={setDeleteConfirmationText}
              onClose={handleCloseDeleteProject}
              onSubmit={handleDeleteProject}
              isDeleting={deleteProjectMutation.isPending}
            />
          )}
        </section>
      </main>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  hasActiveDeploymentLock: boolean;
  isRedeployPending: boolean;
  isAutoDeployUpdating: boolean;
  onOpenProject: () => void;
  onRedeploy: () => void;
  onChangeVersion: () => void;
  onDelete: () => void;
  onToggleAutoDeploy: (checked: boolean) => void;
}

function ProjectCard({
  project,
  hasActiveDeploymentLock,
  isRedeployPending,
  isAutoDeployUpdating,
  onOpenProject,
  onRedeploy,
  onChangeVersion,
  onDelete,
  onToggleAutoDeploy,
}: ProjectCardProps) {
  const { data: deploymentsData } = useGetDeployments(project._id);
  const versionDeployments = (deploymentsData?.deployments || []) as
    | VersionDeployment[]
    | [];

  const currentDeployment = useMemo(() => {
    if (versionDeployments.length === 0) return null;

    return (
      versionDeployments.find(
        (deployment) => deployment.version === project.currentVersion,
      ) ||
      [...versionDeployments].sort(
        (left, right) => right.version - left.version,
      )[0]
    );
  }, [versionDeployments, project.currentVersion]);

  const currentCommitHash = shortHash(
    getDeploymentCommitHash(currentDeployment),
  );

  return (
    <div
      className="group cursor-pointer rounded-3xl border border-border/60 bg-linear-to-br from-card/90 via-card/70 to-background/80 p-5 shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-xl hover:shadow-black/10"
      onClick={onOpenProject}
    >
      <div className="space-y-4" onClick={(event) => event.stopPropagation()}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl border border-border/70 bg-background/60 p-3 shadow-sm backdrop-blur">
              <GitBranch className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-foreground">
                {project.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Project information and deployment controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              v{project.currentVersion}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <span>Auto Deploy</span>
              <Switch
                checked={Boolean(project.autoDeploy)}
                onCheckedChange={onToggleAutoDeploy}
                aria-label={`Toggle auto deploy for ${project.name}`}
                className={isAutoDeployUpdating ? "opacity-60" : undefined}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
              Current Commit
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {currentCommitHash}
            </p>
          </div>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-background/70 hover:text-foreground"
          >
            <FolderGit2 className="size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                Repository
              </p>
              <p className="truncate font-medium text-foreground">
                {getDisplayHost(project.repoUrl)}
              </p>
            </div>
            <ExternalLink className="ml-auto size-3 shrink-0 text-muted-foreground" />
          </a>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-background/70 hover:text-foreground"
          >
            <Globe className="size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                Live URL
              </p>
              <p className="truncate font-medium text-foreground">
                {getDisplayHost(project.url)}
              </p>
            </div>
            <ExternalLink className="ml-auto size-3 shrink-0 text-muted-foreground" />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
          <Button
            size="sm"
            variant="ghost"
            className="h-9 rounded-xl px-4"
            onClick={onOpenProject}
          >
            Manage Project
            <ArrowUpRight className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-9 rounded-xl px-4"
            onClick={onRedeploy}
            disabled={hasActiveDeploymentLock || isRedeployPending}
          >
            {isRedeployPending ? "Redeploying..." : "Redeploy"}
            <RefreshCw className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 rounded-xl px-4 text-muted-foreground"
            onClick={onChangeVersion}
          >
            Change Version
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 rounded-xl px-4 text-red-500 hover:text-red-400"
            onClick={onDelete}
          >
            Delete Project
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployments: VersionDeployment[];
  isLoading: boolean;
  projectId: string | null;
}

function VersionModal({
  isOpen,
  onClose,
  deployments,
  isLoading,
  projectId,
}: VersionModalProps) {
  const queryClient = useQueryClient();
  const setActiveVersionMutation = useSetActiveVersion();
  const { theme } = useTheme();
  const [switchingVersion, setSwitchingVersion] = useState<number | null>(null);

  const handleSelectVersion = async (version: number) => {
    if (!projectId || setActiveVersionMutation.isPending) return;

    setSwitchingVersion(version);

    try {
      const response = await setActiveVersionMutation.mutateAsync({
        projetId: projectId,
        version,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["deployments", projectId] }),
      ]);

      toastSuccess(
        getSuccessMessage(response, "Version changed successfully!"),
        theme,
      );
      onClose();
    } catch (error) {
      toastFailure(getErrorMessage(error, "Failed to change version"), theme);
      console.error(error);
    } finally {
      setSwitchingVersion(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="glass w-full max-w-md border-border/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Select Version</CardTitle>
            <CardDescription>
              Choose a deployment version to set as active
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            disabled={setActiveVersionMutation.isPending}
            className="rounded-md p-1 hover:bg-accent disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {setActiveVersionMutation.isPending && (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="size-4 animate-spin" />
              Switching version...
            </div>
          )}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading versions...</p>
          ) : deployments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No deployments found for this project
            </p>
          ) : (
            deployments.map((deployment) => (
              <div
                key={deployment._id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3 hover:bg-card/60 transition-colors cursor-pointer"
                onClick={() => handleSelectVersion(deployment.version)}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Version {deployment.version}
                  </p>
                  <div className="flex items-center gap-2">
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
                    <p className="text-xs text-muted-foreground">
                      {new Date(deployment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={setActiveVersionMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectVersion(deployment.version);
                  }}
                >
                  {switchingVersion === deployment.version ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Switching...
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  confirmationText: string;
  onConfirmationTextChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isDeleting: boolean;
}

function DeleteProjectModal({
  isOpen,
  projectName,
  confirmationText,
  onConfirmationTextChange,
  onClose,
  onSubmit,
  isDeleting,
}: DeleteProjectModalProps) {
  if (!isOpen) return null;

  const canSubmit = confirmationText.trim().toLowerCase() === "confirm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="glass w-full max-w-md border-border/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Delete Project</CardTitle>
            <CardDescription>
              This will permanently delete {projectName}.
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md p-1 hover:bg-accent disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Type{" "}
                <span className="font-medium text-foreground">confirm</span> to
                enable deletion.
              </p>
              <Input
                value={confirmationText}
                onChange={(event) =>
                  onConfirmationTextChange(event.target.value)
                }
                placeholder="Type confirm"
                autoComplete="off"
                disabled={isDeleting}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              {canSubmit && (
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Project"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
