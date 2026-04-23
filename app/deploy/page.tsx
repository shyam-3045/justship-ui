"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, Eye, EyeOff } from "lucide-react";

import DeploySearchParams from "./DeploySearchParams";

import { Navbar } from "@/components/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/custom-theme-provider";
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
import { useDeployProject } from "@/hooks/customHooks/deploy";
import { useBranches } from "@/hooks/customHooks/repos";
import { getErrorMessage, getSuccessMessage } from "@/utils/api-message";
import { toastSuccess, toastFailure } from "@/utils/toast";

type EnvVariable = {
  key: string;
  value: string;
};

type DeployFormState = {
  url: string;
  buildPath: string;
  env: EnvVariable[];
  projectName: string;
  userId: string;
  framework: string;
  branch: string;
};

const initialFormState: DeployFormState = {
  url: "",
  buildPath: "",
  env: [],
  projectName: "",
  userId: "",
  branch: "",
  framework: "react",
};

const pendingDeployKey = "justship-pending-deploy";
const activeDeploymentJobKey = "justship-active-deployment-job";
const activeDeploymentLockMaxAgeMs = 30 * 60 * 1000;
const pendingDeploymentLockMaxAgeMs = 2 * 60 * 1000;

const normalizeProjectName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

type BranchOption = {
  name: string;
};

const extractGitHubRepoFullName = (value: string) => {
  const raw = value.trim();
  if (!raw) return "";

  if (/^[\w.-]+\/[\w.-]+$/.test(raw)) {
    return raw;
  }

  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(normalized);

    if (!/^(www\.)?github\.com$/i.test(parsed.host)) return "";

    const [owner, repo] = parsed.pathname
      .replace(/^\/+/, "")
      .replace(/\.git$/, "")
      .split("/");

    if (!owner || !repo) return "";

    return `${owner}/${repo}`;
  } catch {
    return "";
  }
};

const normalizeBranchList = (input: unknown): BranchOption[] => {
  const source = Array.isArray(input)
    ? input
    : Array.isArray((input as { branches?: unknown[] } | undefined)?.branches)
      ? (input as { branches?: unknown[] }).branches
      : Array.isArray((input as { data?: unknown[] } | undefined)?.data)
        ? (input as { data?: unknown[] }).data
        : [];

  const normalizedSource = source ?? [];

  const mapped = normalizedSource
    .map((item) => {
      if (typeof item === "string") {
        return { name: item.trim() };
      }

      if (item && typeof item === "object" && "name" in item) {
        const name = String((item as { name?: unknown }).name ?? "").trim();
        if (name) return { name };
      }

      return null;
    })
    .filter((item): item is BranchOption => Boolean(item && item.name));

  return mapped.filter(
    (item, index, arr) =>
      arr.findIndex((candidate) => candidate.name === item.name) === index,
  );
};

export default function DeployPage() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState<DeployFormState>(initialFormState);
  const [isDeploying, setIsDeploying] = useState(false);
  const [hasActiveDeploymentLock, setHasActiveDeploymentLock] = useState(false);
  const [visibleEnvIndexes, setVisibleEnvIndexes] = useState<number[]>([]);
  const deployClickLockRef = useRef(false);
  const deployMutation = useDeployProject();
  const repoFullName = useMemo(
    () => extractGitHubRepoFullName(form.url),
    [form.url],
  );
  const {
    data: branchData,
    isLoading: branchesLoading,
    isFetching: branchesFetching,
    isError: branchesError,
  } = useBranches(repoFullName);

  const branchOptions = useMemo(
    () => normalizeBranchList(branchData),
    [branchData],
  );

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

  // ✅ Handle query params via Suspense component
  const SearchParamsHandler = (
    <Suspense fallback={null}>
      <DeploySearchParams setForm={setForm} />
    </Suspense>
  );

  useEffect(() => {
    const pendingRaw = localStorage.getItem(pendingDeployKey);
    if (!pendingRaw) return;

    try {
      const pending = JSON.parse(pendingRaw) as DeployFormState;
      setForm(pending);
    } catch {
      localStorage.removeItem(pendingDeployKey);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    localStorage.removeItem(pendingDeployKey);

    setForm((prev) => ({
      ...prev,
      userId: prev.userId || user.name,
    }));
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

  useEffect(() => {
    setForm((prev) => {
      if (!repoFullName) {
        if (!prev.branch) return prev;
        return { ...prev, branch: "" };
      }

      if (branchOptions.length === 0) {
        return prev;
      }

      const hasSelectedBranch = branchOptions.some(
        (branch) => branch.name === prev.branch,
      );

      if (hasSelectedBranch) {
        return prev;
      }

      return { ...prev, branch: branchOptions[0].name };
    });
  }, [repoFullName, branchOptions]);

  const updateField = (
    key: keyof Omit<DeployFormState, "env">,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addEnvVariable = () => {
    setForm((prev) => ({
      ...prev,
      env: [...prev.env, { key: "", value: "" }],
    }));
  };

  const removeEnvVariable = (index: number) => {
    setForm((prev) => ({
      ...prev,
      env: prev.env.filter((_, i) => i !== index),
    }));

    setVisibleEnvIndexes((prev) =>
      prev
        .filter((item) => item !== index)
        .map((item) => (item > index ? item - 1 : item)),
    );
  };

  const toggleEnvVisibility = (index: number) => {
    setVisibleEnvIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const updateEnvVariable = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setForm((prev) => {
      const newEnv = [...prev.env];
      newEnv[index] = { ...newEnv[index], [field]: value };
      return { ...prev, env: newEnv };
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (deployClickLockRef.current || isDeploying || deployMutation.isPending) {
      return;
    }

    if (hasValidActiveDeployment()) {
      setHasActiveDeploymentLock(true);
      toastFailure("A deployment is already in progress. Please wait.", theme);
      return;
    }

    if (!user) {
      localStorage.setItem(pendingDeployKey, JSON.stringify(form));
      router.push("/login?next=/deploy");
      return;
    }

    if (
      !form.url ||
      !form.buildPath ||
      !form.projectName ||
      !form.framework ||
      !form.branch
    ) {
      toastFailure("Please fill in all required fields", theme);
      return;
    }

    const sanitizedProjectName = normalizeProjectName(form.projectName);

    if (!sanitizedProjectName) {
      toastFailure(
        "Project name can only include letters, numbers, and hyphens.",
        theme,
      );
      return;
    }

    deployClickLockRef.current = true;
    setIsDeploying(true);
    localStorage.setItem(
      activeDeploymentJobKey,
      JSON.stringify({
        jobId: "pending",
        projectName: form.projectName || "Deployment",
        startedAt: Date.now(),
      }),
    );
    setHasActiveDeploymentLock(true);

    try {
      // Convert env array to object
      const envObject: Record<string, string | number | boolean> = {};
      form.env.forEach((variable) => {
        if (variable.key && variable.value) {
          envObject[variable.key] = variable.value;
        }
      });

      const deployPayload: {
        url: string;
        buildPath: string;
        projectName: string;
        framework: string;
        branch: string;
        env?: Record<string, string | number | boolean>;
      } = {
        url: form.url,
        buildPath: form.buildPath,
        projectName: sanitizedProjectName,
        framework: form.framework,
        branch: form.branch,
        ...(Object.keys(envObject).length > 0 && { env: envObject }),
      };

      const response = await deployMutation.mutateAsync(deployPayload);

      const jobId = response.jobID || response.jobId || response.deploymentId;
      const queueMessage = getSuccessMessage(response, "Job Added to Queue");

      if (!jobId) {
        throw new Error("Could not read job ID from deploy response");
      }

      localStorage.setItem(
        activeDeploymentJobKey,
        JSON.stringify({
          jobId,
          projectName: sanitizedProjectName,
          startedAt: Date.now(),
        }),
      );

      toastSuccess(queueMessage, theme);

      // Navigate to logs page
      router.push(
        `/deploy/${jobId}?projectName=${encodeURIComponent(sanitizedProjectName)}`,
      );
    } catch (error) {
      console.error("Deploy error:", error);
      localStorage.removeItem(activeDeploymentJobKey);
      setHasActiveDeploymentLock(false);
      toastFailure(
        getErrorMessage(error, "Failed to start deployment. Please try again."),
        theme,
      );
    } finally {
      deployClickLockRef.current = false;
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-glow">
      {SearchParamsHandler}

      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-10">
        {loading ? (
          <CenterLoader
            label="Loading deploy form..."
            className="min-h-[60vh]"
          />
        ) : (
          <Card className="glass border-border/70">
            <CardHeader>
              <CardTitle>Deploy Your App</CardTitle>
              <CardDescription>
                Connect your GitHub repository and deploy with one click.
                Configure your build settings and environment variables.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" onSubmit={onSubmit}>
                {!user && (
                  <div className="rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                    Fill the details below and continue. When you click the
                    button, you will be redirected to login first.
                  </div>
                )}

                {/* Repository URL */}
                <div>
                  <div className="mb-3 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm shadow-amber-500/5 dark:border-amber-400/25 dark:bg-amber-950/35 dark:text-amber-100">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                    <p>
                      Private repositories are not accepted. Please use a public
                      repository, otherwise deployment may fail.
                    </p>
                  </div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Repository URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.url}
                    onChange={(e) => updateField("url", e.target.value)}
                    placeholder="https://github.com/username/repo"
                    required
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Select  Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.branch}
                    onChange={(e) => updateField("branch", e.target.value)}
                    className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground"
                    required
                    disabled={
                      !repoFullName ||
                      branchesLoading ||
                      branchesFetching ||
                      branchOptions.length === 0
                    }
                  >
                    <option value="">
                      {!repoFullName
                        ? "Enter a valid GitHub repository URL first"
                        : branchesLoading || branchesFetching
                          ? "Loading branches..."
                          : branchOptions.length === 0
                            ? "No branches found"
                            : "Select a branch"}
                    </option>
                    {branchOptions.map((branch) => (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {branchesError && (
                    <p className="mt-1 text-xs text-destructive">
                      Could not load branches for this repository.
                    </p>
                  )}
                </div>

                {/* Project Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.projectName}
                    onChange={(e) => updateField("projectName", e.target.value)}
                    placeholder="my-awesome-app"
                    autoComplete="off"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use lowercase letters, numbers, and hyphens only. Spaces and
                    special characters are normalized before deploy.
                  </p>
                </div>

                {/* Build Path */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    . / Root Directory <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.buildPath}
                    onChange={(e) => updateField("buildPath", e.target.value)}
                    placeholder="e.g., frontend/form-builder or . for root"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The subdirectory containing your app (use . for root)
                  </p>
                </div>

                {/* Framework */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Framework <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.framework}
                    onChange={(e) => updateField("framework", e.target.value)}
                    className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground"
                    required
                  >
                    <option value="react">React (Vite / CRA)</option>
                    <option value="vue">Vue</option>
                  </select>
                </div>

                {/* Environment Variables */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Environment Variables
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Optional. Add environment variables needed for your app
                        to run in production.
                      </p>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="flex gap-3 rounded-lg border border-orange-400/40 bg-orange-50/20 p-3 dark:bg-orange-950/30">
                    <AlertCircle className="size-4 shrink-0 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <p className="text-xs text-amber-600">
                      Environment variables are optional. Only add variables
                      that your app needs to run in production.
                    </p>
                  </div>

                  {/* Environment Variables List */}
                  <div className="space-y-2">
                    {form.env.map((variable, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Variable name (e.g., VITE_API_BASE_URL)"
                          value={variable.key}
                          onChange={(e) =>
                            updateEnvVariable(index, "key", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={variable.value}
                          onChange={(e) =>
                            updateEnvVariable(index, "value", e.target.value)
                          }
                          className="flex-1"
                          type={
                            visibleEnvIndexes.includes(index)
                              ? "text"
                              : "password"
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEnvVisibility(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {visibleEnvIndexes.includes(index) ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEnvVariable(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add Env Variable Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addEnvVariable}
                    className="w-full"
                  >
                    <Plus className="size-4" />
                    Add Environment Variable
                  </Button>
                </div>

                {/* Deploy Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      loading ||
                      (Boolean(user) &&
                        (isDeploying ||
                          deployMutation.isPending ||
                          hasActiveDeploymentLock))
                    }
                  >
                    {!user
                      ? "Login To Deploy"
                      : isDeploying || deployMutation.isPending
                        ? "Deploying..."
                        : hasActiveDeploymentLock
                          ? "Deployment In Progress"
                          : "Deploy Now"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
