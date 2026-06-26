import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import meetingService from "../../services/BookingMeeting/meeting";

const useMeetings = () => {
  const queryClient = useQueryClient();

  const meetingsQuery = (page = 1, limit = 15) =>
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

  const checkAvailabilityMutation = useMutation({
    mutationFn: meetingService.checkAvailability,
  });

  const createMeetingMutation = useMutation({
    mutationFn: meetingService.createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  const updateMeetingMutation = useMutation({
    mutationFn: ({ id, payload }) => meetingService.updateMeeting(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  const rescheduleMeetingMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      meetingService.rescheduleMeeting(id, payload),
    onSuccess: () => {
      toast.success("Meeting rescheduled successfully");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
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
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to cancel meeting");
    },
  });

  return {
    meetingsQuery,
    meetingParticipantsQuery,
    checkAvailabilityMutation,
    createMeetingMutation,
    updateMeetingMutation,
    rescheduleMeetingMutation,
    cancelMeetingMutation,
  };
};

export default useMeetings;
