import { useMutation } from "@tanstack/react-query"
import { deployProject, reDeployProject } from "../services/deploy";

interface data {
  url: string;
  buildPath: string;
  env?: Record<string, string | number | boolean>;
  projectName: string;
  framework: string;
}
export const useDeployProject = ()=>
{
    return useMutation({
        mutationFn : (payload :data ) => 
            deployProject(payload),
        onSuccess :()=>
            console.log("Project Deployment Triggered !")
    })
}

export const useRedeployHook = ()=>
{
    return useMutation({
        mutationFn :(payload :{
            projectId:string
        }) =>
            reDeployProject({projectId:payload.projectId}),
            onSuccess:()=>
                console.log("Redeploy Triggered !")

    })
}


