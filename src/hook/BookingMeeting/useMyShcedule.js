import {
  mySchedule,
  endMeeting,
} from "../../services/BookingMeeting/mySchedule";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getSocket } from "../../config/socket";
import toast from "react-hot-toast";

export const useMySchedule = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [items, setItems] = useState([]);
  const queryClient = useQueryClient();
  const { socket } = useContext(AuthContext);

  // Reset ke page 1 lalu refetch dari page 1 (dipakai saat ada event socket)
  const resetAndRefetch = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["mySchedule"], exact: false });
  };

  useEffect(() => {
    const s = socket || getSocket();
    if (!s) return;
    const invalidate = () => resetAndRefetch();
    s.on("meeting:created", invalidate);
    s.on("meeting:updated", invalidate);
    s.on("meeting:rescheduled", invalidate);
    s.on("meeting:cancelled", invalidate);
    s.on("meeting:statusUpdated", invalidate);
    s.on("meeting:rsvp_updated", invalidate);
    return () => {
      s.off("meeting:created", invalidate);
      s.off("meeting:updated", invalidate);
      s.off("meeting:rescheduled", invalidate);
      s.off("meeting:cancelled", invalidate);
      s.off("meeting:statusUpdated", invalidate);
      s.off("meeting:rsvp_updated", invalidate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, queryClient]);

  const myScheduleQuery = useQuery({
    queryKey: ["mySchedule", page, limit],
    queryFn: () => mySchedule(page, limit),
    keepPreviousData: true,
  });

  // Gabungkan hasil page baru ke accumulated items
  useEffect(() => {
    if (!myScheduleQuery.data) return;
    const newItems = myScheduleQuery.data.schedule || [];
    setItems((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
  }, [myScheduleQuery.data, page]);

  const pagination = myScheduleQuery.data?.pagination;
  const totalItems = pagination?.total || 0;
  const hasMore = pagination ? page < pagination.totalPages : false;

  const loadMore = () => {
    if (hasMore && !myScheduleQuery.isFetching) {
      setPage((p) => p + 1);
    }
  };

  const endMeetingMutation = useMutation({
    mutationFn: ({ id, payload }) => endMeeting(id, payload),
    onSuccess: () => {
      toast.success("Meeting ended successfully");
      resetAndRefetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to end meeting");
    },
  });

  return {
    myScheduleQuery,
    items,
    totalItems,
    hasMore,
    loadMore,
    isFetchingMore: myScheduleQuery.isFetching && page > 1,
    isInitialLoading: myScheduleQuery.isLoading && page === 1,
    endMeetingMutation,
  };
};
