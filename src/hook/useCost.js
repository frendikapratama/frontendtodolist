import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCostsByProject,
  getCostById,
  createCost,
  updateCost,
  updateCostStatus,
  deleteCost,
} from "../services/cost";
import toast from "react-hot-toast";

export const useCost = (projectId, queryParams = {}) => {
  const queryClient = useQueryClient();

  const costQuery = useQuery({
    queryKey: ["costs", projectId, queryParams],
    queryFn: () => getCostsByProject(projectId, queryParams),
    enabled: !!projectId,
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createCost({ ...data, projectId }),
    onSuccess: (res) => {
      toast.success(res?.message || "Cost berhasil dicatat");
      if (res?.warning) {
        toast(res.warning, {
          icon: "⚠️",
          duration: 6000,
          style: {
            color: "#fbbf24", // setara text-amber-400
            fontWeight: 500, // font-medium
            fontSize: "0.75rem", // text-xs
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal mencatat Cost");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCost(id, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Cost berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal memperbarui Cost");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateCostStatus(id, { status }),
    onSuccess: (res) => {
      toast.success(res?.message || "Status cost berhasil diubah");
      queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal mengubah status Cost");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCost(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Cost berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["costs", projectId] });
      queryClient.invalidateQueries({ queryKey: ["budgets", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal menghapus Cost");
    },
  });

  return {
    costQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  };
};
