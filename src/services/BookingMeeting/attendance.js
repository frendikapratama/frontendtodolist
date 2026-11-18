import api from "../../api/axios";

export async function getAttendanceOptions(meetingId) {
  const { data } = await api.get(`/meeting-attendance/${meetingId}/options`);
  return data;
}

export async function submitAttendance(meetingId, formData) {
  const { data } = await api.post(`/meeting-attendance/${meetingId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getAttendanceRecap(meetingId) {
  const { data } = await api.get(`/meeting-attendance/${meetingId}/recap`);
  return data;
}
