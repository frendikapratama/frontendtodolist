import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFacilities } from "../../services/BookingMeeting/facilities";

export const useFacilitiesSelect = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["facilities-select", debouncedSearch],
    queryFn: () => getFacilities(1, 100, debouncedSearch),
    keepPreviousData: true,
  });

  return { query, setSearch };
};
