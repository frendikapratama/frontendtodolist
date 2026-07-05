import { useQuery } from "@tanstack/react-query";
import meetingRecapService from "../../services/BookingMeeting/meetingRecap";

const useMeetingRecap = () => {
  const recapSummaryQuery = (filters = {}) =>
    useQuery({
      queryKey: ["meetingRecap", "summary", filters],
      queryFn: () => meetingRecapService.getRecapSummary(filters),
      staleTime: 30_000,
    });

  const meetingResultsListQuery = (filters = {}) =>
    useQuery({
      queryKey: ["meetingRecap", "resultsList", filters],
      queryFn: () => meetingRecapService.getMeetingResultsList(filters),
      staleTime: 30_000,
    });

  return {
    recapSummaryQuery,
    meetingResultsListQuery,
  };
};

export default useMeetingRecap;
