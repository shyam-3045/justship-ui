import api from "@/utils/axios"

export const getRepos = async()=>
{
    const res = await api.get('/repos')
    return res.data
}