import { useMutation, useQueryClient, useQuery ,keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../services/userServices";

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

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
    posisi: "User",
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
    isSystemAdmin: "all",
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const userQuery = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
     placeholderData: keepPreviousData, 
  });

  const mutation = useMutation({
    mutationFn: ({ id, data, isEdit }) => {
      if (isEdit) {
        return updateUser(id, data);
      }

      return createUser(data);
    },

    onSuccess: (_, variables) => {
      toast.success(
        variables.isEdit
          ? "User updated successfully"
          : "User added successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      resetForm();
    },

    onError: (error, variables) => {
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

  const deleteMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      toast.success("User deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
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

  return {
    preview,
    mutation,
    fileInputRef,
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