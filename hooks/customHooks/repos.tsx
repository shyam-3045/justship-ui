import { useQuery } from "@tanstack/react-query";
import { getBranches, getRepos } from "../services/respos";

export type BranchResponseItem = {
  name: string;
};

type BranchesResponse =
  | BranchResponseItem[]
  | string[]
  | { branches: BranchResponseItem[] | string[] }
  | { data: BranchResponseItem[] | string[] };

export const useGetRepos = (enabled = true) => {
  return useQuery({
    queryKey: ["repos"],
    queryFn: getRepos,
    enabled,
  });
};

export const useBranches = (repo: string) => {
  return useQuery<BranchesResponse>({
    queryKey: ["branches", repo],
    queryFn: () => getBranches(repo),
    enabled: !!repo,
  });
};
