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
};

export default meetingService;
