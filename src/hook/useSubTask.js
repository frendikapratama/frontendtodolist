import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { getByGroup } from "../services/task";
import { addSubTask } from "../services/subtask";
import toast from "react-hot-toast";

export const useSubTask = (taskId) => {
  const queryClient = useQueryClient();

  // const taskByGroup = useQuery({
  //   queryKey: ["subtask", taskId],
  //   queryFn: () => getByGroup(taskId),
  //   enabled: !!taskId,
  // });

  const addSubTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => addSubTask(taskId, data),
    onSuccess: () => {
      toast.success("succes");
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah project");
      }
    },
  });

  return { addSubTaskMutation };
};
