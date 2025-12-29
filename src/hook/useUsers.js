import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState, useRef } from "react";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../services/userServices";

export const useUsersState = () => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const initialFormData = {
    username: "",
    email: "",
    password: "",
    noHp: "",
    departemen: "",
    divisi: "",
    posisi: "",
    role: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    divisi: "all",
    departemen: "all",
    page: 1,
    limit: 10,
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get users query
  const userQuery = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
  });

  // Create and update mutation
  const mutation = useMutation({
    mutationFn: ({ data, isEdit }) => {
      if (isEdit) {
        return updateUser(data);
      }
      return createUser(data);
    },
    onSuccess: (variables) => {
      const message = variables.isEdit
        ? "User updated successfully"
        : "User added successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      resetForm();
    },
    onError: (error, variables) => {
      console.error("Mutation error:", error);
      const action = variables.isEdit ? "update" : "create";

      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        if (Array.isArray(errorData)) {
          errorData.forEach((msg) => toast.error(msg));
        } else {
          toast.error(errorData);
        }
      } else {
        toast.error(`Failed to ${action} user`);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        if (Array.isArray(errorData)) {
          errorData.forEach((msg) => toast.error(msg));
        } else {
          toast.error(errorData);
        }
      } else {
        toast.error("Failed to delete user");
      }
    },
  });

  const handleSubmit = (e, isEdit = false) => {
    e.preventDefault();
    const submitData = { ...formData };

    mutation.mutate({ data: submitData, isEdit });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    preview,
    mutation,
    fileInputRef,
    handleChange,
    handleSubmit,
    resetForm,
    setPreview,
    formData,
    userQuery,
    setFormData,
    filters,
    setFilters,
    deleteMutation,
  };
};
