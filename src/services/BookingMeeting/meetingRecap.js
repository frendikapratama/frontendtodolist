import api from "../../api/axios";

const meetingRecapService = {
  getRecapSummary: async (params = {}) => {
    const { data } = await api.get("/meeting-recap/summary", { params });
    return data;
  },

  getMeetingResultsList: async (params = {}) => {
    const { data } = await api.get("/meeting-recap/results", { params });
    return data;
  },
};

export default meetingRecapService;
