import api from "../../api/axios";

export async function getRooms() {
  const res = await api.get("rooms");
  return res.data.data;
}

export async function createRoom(data) {
  const formData = new FormData();
  formData.append("nama", data.nama);
  formData.append("lokasi", data.lokasi);
  formData.append("kapasitas", data.kapasitas);
  formData.append("facilities", JSON.stringify(data.facilities));
  if (data.photo) {
    formData.append("photo", data.photo);
  }

  const res = await api.post("rooms", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function updateRoom(id, data) {
  const formData = new FormData();
  formData.append("nama", data.nama);
  formData.append("lokasi", data.lokasi);
  formData.append("kapasitas", data.kapasitas);
  formData.append("facilities", JSON.stringify(data.facilities));
  if (data.photo) {
    formData.append("photo", data.photo);
  }

  const res = await api.put(`rooms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function deleteRoom(id) {
  const res = await api.delete(`rooms/${id}`);
  return res.data.data;
}
