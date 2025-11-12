import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAttachment,
  deleteAttachment,
  createAttachment,
} from "../services/attachment";

export const useAttachment = (taskId) => {
  const queryClient = useQueryClient();

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      return await createAttachment(taskId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments", taskId]);
      queryClient.invalidateQueries(["comments", taskId]);
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId) => deleteAttachment(taskId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["attachments", taskId]);
    },
  });

  const attachmentsQuery = useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => getAttachment(taskId),
    enabled: !!taskId,
  });

  return {
    uploadAttachmentMutation,
    deleteAttachmentMutation,
    attachmentsQuery,
  };
};
