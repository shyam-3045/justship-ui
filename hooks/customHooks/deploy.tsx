import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deployProject,
  getDeployments,
  getLogs,
  reDeployProject,
} from "../services/deploy";

interface DeployPayload {
  url: string;
  buildPath: string;
  env?: Record<string, string | number | boolean>;
  projectName: string;
  framework: string;
  branch:string
}

export interface DeployResponse {
  msg?: string;
  jobID?: string;
  jobId?: string;
  deploymentId?: string;
  cdnUrl?: string;
}

export type RedeployResponse = DeployResponse;

export interface LogsResponse {
  logs?: string[];
  status?: string;
  url?: string;
  cdnUrl?: string;
}

export const useDeployProject = () => {

  return useMutation<DeployResponse, Error, DeployPayload>({
    mutationFn: (payload: DeployPayload) => deployProject(payload),
    onSuccess: () => console.log("Project Deployment Triggered !"),
  });
};

export const useRedeployHook = () => {
  return useMutation<RedeployResponse, Error, { projectId: string }>({
    mutationFn: (payload: { projectId: string }) =>
      reDeployProject({ projectId: payload.projectId }),
    onSuccess: () => console.log("Redeploy Triggered !"),
  });
};

export const useGetDeployments = (projectId: string) => {
  return useQuery({
    queryKey: ["deployments", projectId],
    queryFn: () => getDeployments({ projectId }),
    enabled: !!projectId,
  });
};

export const useGetLogs = (jobId: string) => {
  return useQuery<LogsResponse>({
    queryKey: ["logs", jobId],
    queryFn: () => getLogs({ jobId }),
    enabled: !!jobId,
  });
};
