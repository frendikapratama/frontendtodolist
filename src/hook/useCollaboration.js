import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  sendCollaborationRequest,
  getCollaborationRequests,
  approveCollaboration,
  rejectCollaboration,
  getWorkspaceProjects,
} from "../services/collaboration";

export const useCollaboration = () => {
  const queryClient = useQueryClient();

  const sendRequestMutation = useMutation({
    mutationFn: (data) => sendCollaborationRequest(data),
    onSuccess: () => {
      toast.success("Request kolaborasi berhasil dikirim");
      queryClient.invalidateQueries({ queryKey: ["collaboration-requests"] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Gagal mengirim request";

      if (message.toLowerCase().includes("already") || message.toLowerCase().includes("sent")) {
        toast("Request has been send before!", {
          icon: "⚠️",
          style: { background: "#facc15", color: "#000" },
        });
      } else {
        toast.error(message);
      }
    },
  });

  const approveMutation = useMutation({
    mutationFn: (requestId) => approveCollaboration(requestId),
    onSuccess: () => {
      toast.success("Kolaborasi disetujui");
      queryClient.invalidateQueries({ queryKey: ["collaboration-requests"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menyetujui");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) => rejectCollaboration(requestId),
    onSuccess: () => {
      toast.success("Kolaborasi ditolak");
      queryClient.invalidateQueries({ queryKey: ["collaboration-requests"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menolak");
    },
  });

  const useWorkspaceProjects = (workspaceId) => {
    return useQuery({
      queryKey: ["workspace-projects", workspaceId],
      queryFn: () => getWorkspaceProjects(workspaceId),
      enabled: !!workspaceId,
    });
  };

  const useCollaborationRequests = (workspaceId, type = "incoming", status) => {
    return useQuery({
      queryKey: ["collaboration-requests", workspaceId, type, status],
      queryFn: () => getCollaborationRequests(workspaceId, type, status),
      enabled: !!workspaceId,
    });
  };

  return {
    sendRequestMutation,
    approveMutation,
    rejectMutation,
    useWorkspaceProjects,
    useCollaborationRequests,
  };
};
