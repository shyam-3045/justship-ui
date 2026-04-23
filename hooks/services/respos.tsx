import api from "@/utils/axios"

export const getRepos = async()=>
{
    const res = await api.get('/repos')
    return res.data
}

export const getBranches = async (repo:string) => {
  const res = await api.get(`/github/branches`, {
    params: { repo },
  });
  return res.data;
};