import { useMutation, useQuery } from "@tanstack/react-query"
import { getProjects, setActiveVersion } from "../services/project"


interface data {
    projetId:string,
    version:number
}
export const useSetActiveversion = ()=>
{
    return useMutation({
        mutationFn :(payload:data)=>
            setActiveVersion(payload),

        onSuccess:()=>
            console.log("version Changed Successfully !")
    })
}

export const useGetProjects = ()=>
{
    return useQuery({
        queryKey : ["projects"],
        queryFn : getProjects
    })
}