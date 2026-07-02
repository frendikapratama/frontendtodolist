import { mySchedule } from "../../services/BookingMeeting/mySchedule";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
export const useMySchedule = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const myScheduleQuery = useQuery({
    queryKey: ["mySchedule"],
    queryFn: () => mySchedule({ page, limit }),
  });

  return { myScheduleQuery };
};
