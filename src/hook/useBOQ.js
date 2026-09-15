import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBOQByProject,
  getBOQSections,
  createBOQItem,
  updateBOQItem,
  updateBOQStatus,
  deleteBOQItem,
} from "../services/boq";
import toast from "react-hot-toast";

export const useBOQ = (projectId, queryParams = {}) => {
  const queryClient = useQueryClient();

  const boqQuery = useQuery({
    queryKey: ["boq", projectId, queryParams],
    queryFn: () => getBOQByProject(projectId, queryParams),
    enabled: !!projectId,
    keepPreviousData: true,
  });

  const sectionsQuery = useQuery({
    queryKey: ["boq-sections", projectId],
    queryFn: () => getBOQSections(projectId),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createBOQItem(projectId, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Item BOQ berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["boq", projectId] });
      queryClient.invalidateQueries({ queryKey: ["boq-sections", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      if (Array.isArray(res?.error)) {
        res.error.forEach((msg) => toast.error(msg));
        return;
      }
      toast.error(res?.message || "Gagal menambahkan item BOQ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }) => updateBOQItem(itemId, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Item BOQ berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["boq", projectId] });
      queryClient.invalidateQueries({ queryKey: ["boq-sections", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      if (Array.isArray(res?.error)) {
        res.error.forEach((msg) => toast.error(msg));
        return;
      }
      toast.error(res?.message || "Gagal memperbarui item BOQ");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ itemId, status }) => updateBOQStatus(itemId, status),
    onSuccess: (res) => {
      toast.success(res?.message || "Status BOQ berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["boq", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal memperbarui status BOQ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId) => deleteBOQItem(itemId),
    onSuccess: (res) => {
      toast.success(res?.message || "Item BOQ berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["boq", projectId] });
      queryClient.invalidateQueries({ queryKey: ["boq-sections", projectId] });
    },
    onError: (error) => {
      const res = error.response?.data;
      toast.error(res?.message || "Gagal menghapus item BOQ");
    },
  });

  return {
    boqQuery,
    sectionsQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  };
};
