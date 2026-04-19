import { useMutation, useQuery } from "@tanstack/react-query"
import { getMe } from "../services/auth"

export const useGetMe = ()=>
{
    return useQuery({
        queryKey : ["me"],
        queryFn:getMe
    })
}

