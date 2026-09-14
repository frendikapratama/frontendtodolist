import { useQuery } from "@tanstack/react-query";
import { getDivision } from "../services/division";

export const useDivision = () => {
  const divisionQuery = useQuery({
    queryKey: ["division"],
    queryFn: () => getDivision(),
  });

  return {
    divisionQuery,
  };
};
