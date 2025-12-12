import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, getComment, replyComment } from "../services/comment";
import toast from "react-hot-toast";

export const useComment = (taskId) => {
  const queryClient = useQueryClient();

  const commentQuery = useQuery({
    queryKey: ["comment", taskId],
    queryFn: () => getComment(taskId),
    enabled: !!taskId,
  });
  const createCommentMutation = useMutation({
    mutationFn: ({ taskId, data }) => createComment(taskId, data),
    onSuccess: () => {},
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const replyCommentMutation = useMutation({
    mutationFn: ({ taskId, commentId, data }) =>
      replyComment(taskId, commentId, data),
    onSuccess: () => {
      toast.success("Reply Successfully");
    },
    onError: () => {
      toast.error("Failed to reply");
    },
  });
  return {
    commentQuery,
    replyCommentMutation,
    createCommentMutation,
  };
};
