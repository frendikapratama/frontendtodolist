import api from "../../api/axios";

const meetingService = {
  checkAvailability: async (payload) => {
    const { data } = await api.post("/meeting/check-availability", payload);
    return data;
  },

  createMeeting: async (payload) => {
    const { data } = await api.post("/meeting", payload);
    return data;
  },

  getMeetings: async (page = 1, limit = 15) => {
    const { data } = await api.get(`/meeting?page=${page}&limit=${limit}`);
    return data;
  },

  getMeetingParticipants: async (id) => {
    const { data } = await api.get(`/meeting/${id}/participants`);
    return data;
  },

  updateMeeting: async (id, payload) => {
    const { data } = await api.put(`/meeting/${id}`, payload);
    return data;
  },

  rescheduleMeeting: async (id, payload) => {
    const { data } = await api.patch(`/meeting/${id}/reschedule`, payload);
    return data;
  },

  cancelMeeting: async (id, payload) => {
    const { data } = await api.patch(`/meeting/${id}/cancel`, payload);
    return data;
  },
};

export default meetingService;
