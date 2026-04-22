import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getEnv,
  getProjects,
  setActiveVersion,
  updateEnv,
} from "../services/project";

interface data {
  projetId: string;
  version: number;
}
export const useSetActiveVersion = () => {
  return useMutation({
    mutationFn: (payload: data) => setActiveVersion(payload),

    onSuccess: () => console.log("version Changed Successfully !"),
  });
};

export const useGetProjects = (enabled = true) => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    enabled,
  });
};

export const useGetEnv = (projectId: string) => {
  return useQuery({
    queryKey: ["env", projectId],
    queryFn: () => getEnv(projectId),
    enabled: !!projectId,
  });
};

type EnvType = {
  projectId: string;
  env: Record<string, string>;
};
export const useUpdateEnv = () => {
  return useMutation({
    mutationFn: (payload: EnvType) =>
      updateEnv({ projectId: payload.projectId, env: payload.env }),
  });
};
