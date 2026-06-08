import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  getComment,
  replyComment,
  getCommentSubtask,
  createCommentSubtask,
  replyCommentSubtask,
  deleteComment,
  deleteCommentSubtask,
  editComment,
  editCommentSubtask,
} from "../services/comment";
import toast from "react-hot-toast";

export const useComment = (itemId, isSubtask = false) => {
  const queryClient = useQueryClient();

  const getCommentFn = isSubtask ? getCommentSubtask : getComment;
  const createCommentFn = isSubtask ? createCommentSubtask : createComment;
  const replyCommentFn = isSubtask ? replyCommentSubtask : replyComment;
  const deleteCommentFn = isSubtask ? deleteCommentSubtask : deleteComment;
  const editCommentFn = isSubtask ? editCommentSubtask : editComment;

  const queryKey = isSubtask
    ? ["subtask-comment", itemId]
    : ["task-comment", itemId];

  const commentQuery = useQuery({
    queryKey,
    queryFn: () => getCommentFn(itemId),
    enabled: !!itemId,
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ taskId, subtaskId, data }) => {
      const id = isSubtask ? subtaskId : taskId;
      return createCommentFn(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const replyCommentMutation = useMutation({
    mutationFn: ({ taskId, subtaskId, commentId, data }) => {
      const id = isSubtask ? subtaskId : taskId;
      return replyCommentFn(id, commentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Reply Successfully");
    },
    onError: () => {
      toast.error("Failed to reply");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => deleteCommentFn(id),
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast.error(
        "Failed to delete comment, yo dont have acces delete this comment!"
      );
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: (data) => editCommentFn(data.commentId, { text: data.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Comment updated successfully");
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  return {
    commentQuery,
    replyCommentMutation,
    createCommentMutation,
    deleteCommentMutation,
    editCommentMutation,
  };
};
