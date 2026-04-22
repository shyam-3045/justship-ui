import api from "@/utils/axios"
import { $ZodNumber } from "zod/v4/core"

interface data {
    projetId:string,
    version:number
}
export const setActiveVersion = async(data:data)=>
{
    const res = await api.post('/project/set-active-version',{
        projetId:data.projetId,
        version:data.version
    })

    return res.data
}
export const getProjects = async()=>
{
    const res = await api.get ("/getProjects")
    return  res.data
}



type EnvType = {
  projectId: string;
  env: Record<string, string>;
}

export const getEnv = async (projectId: string) => {
  const res = await api.get(`/project/${projectId}/env`);
  return res.data;
};

export const updateEnv = async (data: EnvType) => {
  const res = await api.post(`/project/${data.projectId}/env`, {
    env: data.env,
  });
  return res.data;
};

export const deleteproject = async(projectId:string)=>
{
  const res = await api.delete(`/projects/${projectId}`)
  return res.data
}