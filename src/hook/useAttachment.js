import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAttachment,
  deleteAttachment,
  createAttachment,
  getAttachmentSubtask,
  deleteAttachmentSubtask,
  createAttachmentSubtask,
} from "../services/attachment";

export const useAttachment = (itemId, isSubtask = false) => {
  const queryClient = useQueryClient();

  // For backward compatibility: if itemId is undefined, return empty mutations
  if (!itemId) {
    return {
      uploadAttachmentMutation: { mutate: () => {}, isLoading: false },
      deleteAttachmentMutation: { mutate: () => {}, isLoading: false },
      attachmentsQuery: { data: [], isLoading: false, isError: false },
    };
  }

  // Select appropriate functions based on type
  const getAttachmentFn = isSubtask ? getAttachmentSubtask : getAttachment;
  const createAttachmentFn = isSubtask
    ? createAttachmentSubtask
    : createAttachment;
  const deleteAttachmentFn = isSubtask
    ? deleteAttachmentSubtask
    : deleteAttachment;

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      return await createAttachmentFn(itemId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", itemId] });
      if (!isSubtask) {
        queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
      }
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId) => deleteAttachmentFn(itemId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", itemId] });
    },
  });

  const attachmentsQuery = useQuery({
    queryKey: ["attachments", itemId],
    queryFn: () => getAttachmentFn(itemId),
    enabled: !!itemId,
  });

  return {
    uploadAttachmentMutation,
    deleteAttachmentMutation,
    attachmentsQuery,
  };
};
