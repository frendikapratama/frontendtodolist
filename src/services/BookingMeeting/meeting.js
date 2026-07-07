import api from "../../api/axios";

const meetingService = {
  checkAvailability: async (payload) => {
    const { data } = await api.post("/meeting/check-availability", payload);
    return data;
  },

  getDashboardData: async () => {
    const { data } = await api.get("/meeting/dashboard");
    return data;
  },

  createMeeting: async (payload) => {
    const { data } = await api.post("/meeting", payload);
    return data;
  },

  getMeetings: async (page = 1, limit = 25) => {
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

  getMeetingDetail: async (id) => {
    const { data } = await api.get(`/meeting/${id}/detail`);
    return data;
  },

  addMeetingResult: async (id, payload) => {
    const formData = new FormData();

    if (payload.file) {
      formData.append("file", payload.file);
    }
    if (payload.content) {
      formData.append("content", payload.content);
    }
    if (payload.userId) {
      formData.append("userId", payload.userId);
    }

    const { data } = await api.post(`/meeting/${id}/results`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  updateMeetingResult: async (meetingId, resultId, payload) => {
    const { data } = await api.put(
      `/meeting/${meetingId}/results/${resultId}`,
      payload,
    );
    return data;
  },

  deleteMeetingResult: async (meetingId, resultId, payload) => {
    const { data } = await api.delete(
      `/meeting/${meetingId}/results/${resultId}`,
      {
        data: payload,
      },
    );
    return data;
  },
};

export default meetingService;
