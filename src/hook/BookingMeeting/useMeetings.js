import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import meetingService from "../../services/BookingMeeting/meeting";

const useMeetings = () => {
  const queryClient = useQueryClient();

  const checkAvailabilityMutation = useMutation({
    mutationFn: meetingService.checkAvailability,
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to check room availability",
      );
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: meetingService.createMeeting,
    onSuccess: () => {
      toast.success("Meeting booked successfully");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      const message = error?.response?.data?.message;
      if (error?.response?.status === 409) {
        toast.error(message || "Room is already booked for that time");
      } else {
        toast.error(message || "Failed to book meeting");
      }
    },
  });

  return {
    checkAvailabilityMutation,
    createMeetingMutation,
  };
};

export default useMeetings;
