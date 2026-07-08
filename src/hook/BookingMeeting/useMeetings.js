import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import toast from "react-hot-toast";
import meetingService from "../../services/BookingMeeting/meeting";
import { AuthContext } from "../../context/AuthContext";
import { getSocket } from "../../config/socket";

const useMeetings = () => {
  const queryClient = useQueryClient();
  const { socket } = useContext(AuthContext);

  useEffect(() => {
    const s = socket || getSocket();
    if (!s) return;

    const invalidateAll = () => {
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
        exact: false,
      });
    };

    const invalidateDetail = (data) => {
      if (data?.meetingId) {
        queryClient.invalidateQueries({
          queryKey: ["meetingDetail", data.meetingId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
        exact: false,
      });
    };

    s.on("meeting:created", invalidateAll);
    s.on("meeting:updated", invalidateAll);
    s.on("meeting:rescheduled", invalidateAll);
    s.on("meeting:cancelled", invalidateAll);
    s.on("meeting:statusUpdated", invalidateAll);

    s.on("meeting:result_added", invalidateDetail);
    s.on("meeting:result_updated", invalidateDetail);
    s.on("meeting:result_deleted", invalidateDetail);

    return () => {
      s.off("meeting:created", invalidateAll);
      s.off("meeting:updated", invalidateAll);
      s.off("meeting:rescheduled", invalidateAll);
      s.off("meeting:cancelled", invalidateAll);
      s.off("meeting:statusUpdated", invalidateAll);

      s.off("meeting:result_added", invalidateDetail);
      s.off("meeting:result_updated", invalidateDetail);
      s.off("meeting:result_deleted", invalidateDetail);
    };
  }, [socket, queryClient]);

  const meetingsQuery = (page = 1, limit = 25) =>
    useQuery({
      queryKey: ["meetings", page, limit],
      queryFn: () => meetingService.getMeetings(page, limit),
    });

  const meetingParticipantsQuery = (meetingId) =>
    useQuery({
      queryKey: ["meetingParticipants", meetingId],
      queryFn: () => meetingService.getMeetingParticipants(meetingId),
      enabled: !!meetingId,
    });

  const dashboardQuery = () =>
    useQuery({
      queryKey: ["meetings", "dashboard"],
      queryFn: () => meetingService.getDashboardData(),
      staleTime: 0,
    });

  const meetingDetailQuery = (meetingId) =>
    useQuery({
      queryKey: ["meetingDetail", meetingId],
      queryFn: () => meetingService.getMeetingDetail(meetingId),
      enabled: !!meetingId,
    });

  const checkAvailabilityMutation = useMutation({
    mutationFn: meetingService.checkAvailability,
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to check availability",
      );
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: meetingService.createMeeting,
    onSuccess: () => {
      toast.success("Meeting booked successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to book meeting");
    },
  });

  const updateMeetingMutation = useMutation({
    mutationFn: ({ id, payload }) => meetingService.updateMeeting(id, payload),
    onSuccess: () => {
      toast.success("Meeting updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update meeting");
    },
  });

  const rescheduleMeetingMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      meetingService.rescheduleMeeting(id, payload),
    onSuccess: () => {
      toast.success("Meeting rescheduled successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to reschedule meeting",
      );
    },
  });

  const cancelMeetingMutation = useMutation({
    mutationFn: ({ id, payload }) => meetingService.cancelMeeting(id, payload),
    onSuccess: () => {
      toast.success("Meeting cancelled successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to cancel meeting");
    },
  });

  const addMeetingResultMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      meetingService.addMeetingResult(id, payload),
    onSuccess: (data, variables) => {
      toast.success("Meeting result added successfully");
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: ["meetingDetail", variables.id],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to add meeting result",
      );
    },
  });

  const updateMeetingResultMutation = useMutation({
    mutationFn: ({ meetingId, resultId, payload }) =>
      meetingService.updateMeetingResult(meetingId, resultId, payload),
    onSuccess: (data, variables) => {
      toast.success("Meeting result updated successfully");
      if (variables?.meetingId) {
        queryClient.invalidateQueries({
          queryKey: ["meetingDetail", variables.meetingId],
        });
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update meeting result",
      );
    },
  });

  const deleteMeetingResultMutation = useMutation({
    mutationFn: ({ meetingId, resultId, payload }) =>
      meetingService.deleteMeetingResult(meetingId, resultId, payload),
    onSuccess: (data, variables) => {
      toast.success("Meeting result deleted successfully");
      if (variables?.meetingId) {
        queryClient.invalidateQueries({
          queryKey: ["meetingDetail", variables.meetingId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["meetings"],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete meeting result",
      );
    },
  });

  return {
    meetingsQuery,
    meetingParticipantsQuery,
    dashboardQuery,
    meetingDetailQuery,
    checkAvailabilityMutation,
    createMeetingMutation,
    updateMeetingMutation,
    rescheduleMeetingMutation,
    cancelMeetingMutation,
    addMeetingResultMutation,
    updateMeetingResultMutation,
    deleteMeetingResultMutation,
  };
};

export default useMeetings;
