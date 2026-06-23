import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRooms,
  createRoom,
  deleteRoom,
  updateRoom,
} from "../../services/BookingMeeting/rooms";
import toast from "react-hot-toast";

export const useRooms = () => {
  const queryClient = useQueryClient();

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      toast.success("Room created successfully");

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to create room";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRoom(id, data),
    onSuccess: () => {
      toast.success("Room updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update room";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      toast.success("Room deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to delete room";
      toast.error(errorMessage);
    },
  });

  return {
    roomsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

export default useRooms;
