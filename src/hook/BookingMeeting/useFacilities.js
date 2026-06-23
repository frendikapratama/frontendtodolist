import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFacilities,
  deleteFacilities,
  getFacilities,
  updateFacilities,
} from "../../services/BookingMeeting/facilities";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const useFacilities = () => {
  const initialFormData = {
    nama: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const queryClient = useQueryClient();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const facilitesQuery = useQuery({
    queryKey: ["facilities", page, limit, debouncedSearch],
    queryFn: () => getFacilities(page, limit, debouncedSearch),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createFacilities(data),
    onSuccess: () => {
      toast.success("Facilities created successfully");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      resetForm();
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Failed to create facility");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateFacilities(id, data),
    onSuccess: () => {
      toast.success("Facilities updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["facilities"],
      });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Failed to create facility");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFacilities,
    onSuccess: () => {
      toast.success("Facilities deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["facilities"],
      });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Failed to create facility");
      }
    },
  });

  const goToPage = (newPage) => {
    if (newPage < 1) return;
    if (
      facilitesQuery.data?.pagination?.totalPages &&
      newPage > facilitesQuery.data.pagination.totalPages
    ) {
      return;
    }
    setPage(newPage);
  };

  const nextPage = () => {
    if (facilitesQuery.data?.pagination?.hasNext) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (facilitesQuery.data?.pagination?.hasPrev) {
      setPage(page - 1);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    facilitesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    page,
    setPage,
    goToPage,
    nextPage,
    prevPage,
    limit,
    search,
    setSearch,
    debouncedSearch,
  };
};
