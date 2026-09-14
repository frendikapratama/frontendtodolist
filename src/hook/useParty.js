import {
  getParty,
  createParty,
  updateParty,
  deleteParty,
} from "../services/party";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const PARTY_QUERY_KEY = ["party"];

const getErrorMessage = (error, fallback) => {
  const res = error?.response?.data;
  return res?.error || res?.message || fallback;
};

export const useParty = (params) => {
  const queryClient = useQueryClient();

  const invalidateParty = () =>
    queryClient.invalidateQueries({ queryKey: PARTY_QUERY_KEY });

  const partyQuery = useQuery({
    queryKey: PARTY_QUERY_KEY,
    queryFn: () => getParty(params),
  });

  const createPartyMutation = useMutation({
    mutationFn: createParty,
    onSuccess: (data) => {
      invalidateParty();
      setTimeout(() => toast.success(data?.message || "Party created"), 0);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create party"));
    },
  });

  const updatePartyMutation = useMutation({
    mutationFn: ({ id, data }) => updateParty(id, data),
    onSuccess: (data) => {
      invalidateParty();
      setTimeout(() => toast.success(data?.message || "Party updated"), 0);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update party"));
    },
  });

  const deletePartyMutation = useMutation({
    mutationFn: deleteParty,
    onSuccess: (data) => {
      invalidateParty();
      setTimeout(() => toast.success(data?.message || "Party deleted"), 0);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete party"));
    },
  });

  return {
    partyQuery,
    createPartyMutation,
    updatePartyMutation,
    deletePartyMutation,
  };
};
