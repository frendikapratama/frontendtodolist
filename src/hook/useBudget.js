import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgetsByProject,
  getBudgetById,
  createBudget,
  updateBudget,
  updateBudgetStatus,
  deleteBudget,
} from "../services/budget";
import toast from "react-hot-toast";

export const useBudget = (projectId, queryParams = {}) => {
  const queryClient = useQueryClient();

  const budgetQuery = useQuery({
    queryKey: ["budgets", projectId, queryParams],
    queryFn: () => getBudgetsByProject(projectId, queryParams),
    enabled: !!projectId,
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createBudget({ ...data, projectId }),
    onSuccess: (res) => {
      toast.success(res?.message || "Budget berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal membuat Budget");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Budget berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal memperbarui Budget");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => updateBudgetStatus(id, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Status budget berhasil diubah");
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
      queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal mengubah status Budget");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBudget(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Budget berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal menghapus Budget");
    },
  });

  return {
    budgetQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  };
};
