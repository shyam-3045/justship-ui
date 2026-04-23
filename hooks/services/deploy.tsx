import api from "@/utils/axios";

interface data {
  url: string;
  buildPath: string;
  env?: Record<string, string | number | boolean>;
  projectName: string;
  framework: string;
  branch: string;
}

export const deployProject = async (data: data) => {
  const res = await api.post("/deploy", {
    url: data.url,
    buildPath: data.buildPath,
    env: data.env,
    projectName: data.projectName,
    framework: data.framework,
    branch: data.branch,
  });

  return res.data;
};

export const reDeployProject = async (data: { projectId: string }) => {
  const res = await api.post("/redeploy", {
    projectId: data.projectId,
  });

  return res.data;
};

export const getDeployments = async (data: { projectId: string }) => {
  const res = await api.get(`/getDeployments/${data.projectId}`);
  return res.data;
};

export const getLogs = async (data: { jobId: string }) => {
  const res = await api.get(`/logs/${data.jobId}`);
  return res.data;
};
