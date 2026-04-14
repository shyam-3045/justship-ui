export type DeploymentStatus = "building" | "success" | "failed";

export type Deployment = {
  id: string;
  projectName: string;
  status: DeploymentStatus;
  url: string;
  timestamp: string;
};

export const mockDeployments: Deployment[] = [
  {
    id: "dep_7n3h9a",
    projectName: "marketing-site",
    status: "success",
    url: "https://marketing.justship.dev",
    timestamp: "2m ago",
  },
  {
    id: "dep_1g2k8z",
    projectName: "dashboard-app",
    status: "building",
    url: "https://dashboard.justship.dev",
    timestamp: "8m ago",
  },
  {
    id: "dep_5f4m2q",
    projectName: "docs-web",
    status: "failed",
    url: "https://docs.justship.dev",
    timestamp: "16m ago",
  },
];

export const mockBuildLogs = [
  { id: 1, level: "info", message: "Cloning repository..." },
  { id: 2, level: "info", message: "Installing dependencies with npm..." },
  { id: 3, level: "success", message: "Dependencies installed successfully." },
  { id: 4, level: "info", message: "Running production build..." },
  { id: 5, level: "error", message: "Type error in app/dashboard/page.tsx:42:18" },
  { id: 6, level: "info", message: "Build exited with code 1." },
] as const;
