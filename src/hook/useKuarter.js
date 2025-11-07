import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getKuarter, createKuarter, getKuarterById } from "../services/kuarter";
import toast from "react-hot-toast";

export const useKuarter = () => {
  const queryClient = useQueryClient();
  const initialFormData = {
    nama: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const KuarterDetail = (id) => {
    return useQuery({
      queryKey: ["kuarter", id],
      queryFn: () => getKuarterById(id),
      enabled: !!id,
    });
  };

  return {
    formData,
    setFormData,
    kuarterQuery,
    createMutation,
    handleChange,
    KuarterDetail,
    resetForm,
  };
};
