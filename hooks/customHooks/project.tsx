import { useMutation } from "@tanstack/react-query"
import { setActiveVersion } from "../services/project"


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