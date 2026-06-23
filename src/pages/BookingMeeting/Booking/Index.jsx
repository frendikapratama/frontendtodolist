import React, { useState } from "react";
import useRooms from "../../../hook/BookingMeeting/useRooms";
import { SOCKET_URL } from "../../../api/axios";
import { Image, MapPin, Users, ArrowRight } from "lucide-react";
import BookingMeetingForm from "./BookingMeetingForm";

const BASE_URL = SOCKET_URL;

const IndexBooking = () => {
  const { roomsQuery } = useRooms();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingRoomId, setBookingRoomId] = useState(null);

  const openBookingModal = (roomId) => {
    setBookingRoomId(roomId);
    document.getElementById("bookingModal").showModal();
  };

  const closeBookingModal = () => {
    setBookingRoomId(null);
    document.getElementById("bookingModal").close();
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
  const selectedRoom = rooms.find((room) => room._id === bookingRoomId);

  const filteredRooms = rooms.filter(
    (room) =>
      room.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.lokasi.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 backdrop-blur-xs p-4 rounded-xl border border-white/10">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search room or location..."
            className="w-full bg-slate-900/50 text-white placeholder-slate-500 text-sm border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Showing{" "}
          <span className="text-white font-bold">{filteredRooms.length}</span>{" "}
          of {totalRooms} rooms
        </div>
      </div>

      {/* Grid Rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <div
            key={room._id}
            className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-white/20 transition-all shadow-md"
          >
            {/* Photo & Status Badge */}
            <div className="relative">
              {room.photo ? (
                <img
                  src={`${BASE_URL}/uploads/rooms/${room.photo}`}
                  alt={room.nama}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-slate-800 flex flex-col items-center justify-center gap-1 border-b border-white/10">
                  <Image size={20} className="text-slate-500" />
                  <span className="text-slate-600 text-xs">No photo</span>
                </div>
              )}

              {/* Status Badge Indicator */}
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Available
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              {/* Title + Actions */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold text-white truncate"
                    title={room.nama}
                  >
                    {room.nama}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">{room.lokasi}</span>
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/5 my-2" />

              {/* Capacity */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <span className="text-xs text-slate-300">
                  Capacity:{" "}
                  <span className="text-white font-semibold">
                    {room.kapasitas} px
                  </span>
                </span>
              </div>

              {/* Facilities */}
              <div className="mb-4 flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                  Facilities
                </p>
                {room.facilities?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px]"
                      >
                        <span className="truncate max-w-[60px]">
                          {facility.facilityId?.nama}
                        </span>
                        <span className="bg-blue-500/30 text-blue-200 rounded px-0.5 text-[9px] font-bold">
                          ×{facility.total}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 italic">
                    No facilities
                  </p>
                )}
              </div>

              {/* Action Button: Book Now */}
              <div className="mt-auto pt-1">
                <button
                  onClick={() => openBookingModal(room._id)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                  Book Room
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking modal — same dialog pattern as Facilities */}
      <dialog id="bookingModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-slate-900  text-white rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-xl">
              Book Room{selectedRoom ? `: ${selectedRoom.nama}` : ""}
            </h3>
          </div>

          {bookingRoomId && (
            <BookingMeetingForm
              defaultRoomId={bookingRoomId}
              onClose={closeBookingModal}
              onSuccess={closeBookingModal}
            />
          )}
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default IndexBooking;
