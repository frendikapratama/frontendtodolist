import {
  useMutation,
  useQueryClient,
  useQuery,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { useState } from "react";
import {
  getKuarter,
  createKuarter,
  getKuarterById,
  updateKuarter,
  deleteKuarter,
} from "../services/kuarter";
import toast from "react-hot-toast";

export const useKuarter = () => {
  const queryClient = useQueryClient();

  const initialFormData = {
    nama: "",
    departemen: ""
  };

  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const kuarterQuery = useQuery({
    queryKey: ["kuarter"],
    queryFn: () => getKuarter(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => createKuarter(data),
    onSuccess: () => {
      toast.success("berhasil membuat kuarter");
      queryClient.invalidateQueries({ queryKey: ["kuarter"] });
      resetForm();
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah kuarter");
      }
    },
  });

  const updatedKuarterMutation = useMutation({
    mutationFn: ({ id, data }) => updateKuarter(id, data),
    onSuccess: (_, variables) => {
      toast.success("berhasil update");
      queryClient.invalidateQueries({ queryKey: ["kuarter", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["kuarter"] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal edit Kuarter");
      }
    },
  });

  const KuarterDetail = (id) => {
    return useQuery({
      queryKey: ["kuarter", id],
      queryFn: () => getKuarterById(id),
      enabled: !!id,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteKuarter(id),
    onSuccess: (id) => {
      toast.success("berhasil menghapus kuarter");
      queryClient.invalidateQueries({ queryKey: ["kuarter"] });
      queryClient.invalidateQueries({ queryKey: ["kuarter", id] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal hapus Kuarter");
      }
    },
  });

  return {
    formData,
    setFormData,
    kuarterQuery,
    createMutation,
    handleChange,
    KuarterDetail,
    resetForm,
    updatedKuarterMutation,
    deleteMutation,
  };
};
