import { useComment } from "../../hook/useComment";
import { useAttachment } from "../../hook/useAttachment";

const TaskBadges = ({ taskId, task, isSubtask = false }) => {
  const { commentQuery } = useComment(taskId, isSubtask);
  const { attachmentsQuery } = useAttachment(taskId, isSubtask);

  const currentTaskCommentCount = commentQuery.data?.length || 0;
  const currentTaskAttachmentCount = attachmentsQuery.data?.length || 0;
  let totalBadge = currentTaskCommentCount + currentTaskAttachmentCount;

  if (!isSubtask) {
    const subtaskList = task?.subtask || [];

    if (subtaskList.length > 0) {
      const totalSubtaskNotificationCount = subtaskList.reduce(
        (total, subtask) => {
          const subtaskCommentCount = subtask.comments?.length || 0;
          const subtaskAttachmentCount = subtask.attachments?.length || 0;
          return total + subtaskCommentCount + subtaskAttachmentCount;
        },
        0,
      );

      totalBadge += totalSubtaskNotificationCount;
    }
  }

  if (totalBadge === 0) return null;

  return (
    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex items-center justify-center min-w-[18px] h-[18px]">
      {totalBadge}
    </span>
  );
};

export default TaskBadges;
