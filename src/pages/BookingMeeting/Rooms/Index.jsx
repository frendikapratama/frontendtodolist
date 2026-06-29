import { useState } from "react";
import useRooms from "../../../hook/BookingMeeting/useRooms";
import { RoomForm } from "./Form";
import { API_URL } from "../../../api/axios";
import { Edit, Trash2, Plus, Hotel } from "lucide-react";

const IndexRooms = () => {
  const BASE_URL = API_URL;
  const { roomsQuery, createMutation, updateMutation, deleteMutation } =
    useRooms();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchNama, setSearchNama] = useState("");
  const [searchLokasi, setSearchLokasi] = useState("");

  const openCreateModal = () => {
    setSelectedRoom(null);
    document.getElementById("roomModal").showModal();
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    document.getElementById("roomModal").showModal();
  };

  const closeModal = () => {
    setSelectedRoom(null);
    document.getElementById("roomModal").close();
  };

  const handleSubmit = async (data) => {
    if (selectedRoom) {
      return updateMutation.mutateAsync({ id: selectedRoom._id, data });
    }
    return createMutation.mutateAsync(data);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?",
    );
    if (!confirmDelete) return;
    deleteMutation.mutate(id);
  };

  if (roomsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  const rooms = roomsQuery.data || [];
  const totalRooms = rooms.length;

  const filteredRooms = rooms.filter((room) => {
    const matchNama = room.nama
      ?.toLowerCase()
      .includes(searchNama.trim().toLowerCase());
    const matchLokasi = room.lokasi
      ?.toLowerCase()
      .includes(searchLokasi.trim().toLowerCase());
    return matchNama && matchLokasi;
  });

  return (
    <div>
      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-linear-to-b from-slate-900/80 to-slate-900/95 backdrop-blur-md rounded-xl border border-white/10 p-5 transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Sisi Kiri: Info Judul & Badge Total */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
              <Hotel />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Room Management
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-slate-300 rounded-full border border-white/5">
                  {totalRooms || 0} Rooms
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage meeting rooms, schedules, and capacities.
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Action Button */}
          <div className="w-full md:w-auto flex justify-end">
            <button
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-500/50 font-semibold text-sm text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap"
              onClick={openCreateModal}
            >
              <Plus size={18} />
              Add Room
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <dialog id="roomModal" className="modal">
        <div className="modal-box w-11/12 max-w-4xl bg-slate-900 text-white rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="font-bold text-xl">
              {selectedRoom ? "Edit Room" : "Add Room"}
            </h3>
          </div>
          <RoomForm
            onClose={closeModal}
            onSubmit={handleSubmit}
            initialData={selectedRoom}
            isPending={createMutation?.isPending || updateMutation?.isPending}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* ── Total Rooms + Search ── */}

      {/* ── Room Grid / Empty State ── */}
      {rooms.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl py-20 flex flex-col items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-slate-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
            />
          </svg>
          <p className="text-slate-400 text-lg">No rooms available</p>
          <button
            onClick={openCreateModal}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Add your first room
          </button>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl py-20 flex flex-col items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-slate-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <p className="text-slate-400 text-lg">No rooms match your search</p>
          <button
            onClick={() => {
              setSearchNama("");
              setSearchLokasi("");
            }}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-white/20 transition-all"
            >
              {/* Photo */}
              {room.photo ? (
                <img
                  src={`${BASE_URL}/uploads/rooms/${room.photo}`}
                  alt={room.nama}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-slate-800 flex flex-col items-center justify-center gap-2 border-b border-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-12 h-12 text-slate-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                  </svg>
                  <span className="text-slate-600 text-xs">No photo</span>
                </div>
              )}

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Title + Actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-base font-bold text-white truncate">
                      {room.nama}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-3.5 h-3.5 shrink-0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                      <span className="truncate">{room.lokasi}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(room)}
                      className="btn btn-sm btn-square btn-ghost text-blue-400 hover:bg-blue-500/10 disabled:opacity-30"
                      title="Edit Room Meeting "
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
                      disabled={deleteMutation.isPending}
                      className="btn btn-sm btn-square btn-ghost text-error hover:bg-error/10 disabled:opacity-30"
                      title="Deletes Room"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 my-3" />

                {/* Capacity */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">
                    Capacity:{" "}
                    <span className="text-white font-semibold">
                      {room.kapasitas} people
                    </span>
                  </span>
                </div>

                {/* Facilities */}
                <div className="mt-auto">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                    Facilities
                  </p>
                  {room.facilities?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {room.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs uppercase"
                        >
                          {facility.facilityId?.nama}
                          <span className="bg-blue-500/30 text-blue-200 rounded px-1 text-[10px] font-bold">
                            ×{facility.total}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic">
                      No facilities listed
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndexRooms;
