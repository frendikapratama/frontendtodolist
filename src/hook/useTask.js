import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getByGroup } from "../services/task";
import { addTask } from "../services/task";
import toast from "react-hot-toast";

export const useTask = (groupId) => {
  const queryClient = useQueryClient();
  const taskByGroup = useQuery({
    queryKey: ["task", groupId],
    queryFn: () => getByGroup(groupId),
    enabled: !!groupId,
  });

  const addTaskMutation = useMutation({
    mutationFn: ({ groupId, data }) => addTask(groupId, data),
    onSuccess: () => {
      toast.success("succes");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
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

  return { taskByGroup, addTaskMutation };
};
