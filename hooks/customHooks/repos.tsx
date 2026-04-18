import { useQuery } from "@tanstack/react-query";
import { getRepos } from "../services/respos";

export const useGetRepos = () => {
  return useQuery({
    queryKey: ["repos"],
    queryFn: getRepos
  });
};