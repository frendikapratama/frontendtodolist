import { useQuery } from "@tanstack/react-query";
import { getReports } from "../services/report";

export const useReport = (filters = {}) => {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => getReports(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
