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