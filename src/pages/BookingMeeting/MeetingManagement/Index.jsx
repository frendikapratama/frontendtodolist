import React, { useState } from "react";
import useRooms from "../../../hook/BookingMeeting/useRooms";
import { SOCKET_URL } from "../../../api/axios";
import {
  Image,
  MapPin,
  Users,
  ArrowRight,
  X,
  Info,
  Calendar,
  LayoutGrid,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import BookingMeetingForm from "./BookingMeetingForm";
import TableMeeting from "./TableMeeting";

const BASE_URL = SOCKET_URL;

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, iconColor, subtitle }) => (
  <div className="bg-linear-to-b from-slate-900/40 to-slate-900/80 backdrop-blur-md rounded-xl border border-white/5 p-5 flex items-center gap-4 hover:border-white/15 hover:translate-y-0.5 transition-all duration-300 shadow-lg shadow-black/20 group relative overflow-hidden">
    <div
      className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${color}`}
    />

    {/* Wrapper Ikon */}
    <div
      className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0 border border-white/5 shadow-inner group-hover:scale-105 transition-transform duration-300`}
    >
      <Icon size={20} className={`${iconColor}`} />
    </div>

    {/* Teks / Informasi */}
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors duration-300">
        {value}
      </p>
      <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
        {label}
      </p>
      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-normal truncate">
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

// Modal untuk detail facility
const FacilityDetailModal = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <dialog id="facilityModal" className="modal" open>
      <div className="modal-box w-11/12 max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xl text-white">Facility Details</h3>
            <p className="text-sm text-slate-400 mt-1">{room.nama}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Room Info */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-400" />
              <span className="text-sm text-slate-300">{room.lokasi}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              <span className="text-sm text-slate-300">
                Capacity:{" "}
                <span className="text-white font-semibold">
                  {room.kapasitas}
                </span>
              </span>
            </div>
          </div>

          {/* Facilities List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Available Facilities
              <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                {room.facilities?.length || 0}
              </span>
            </h4>

            {room.facilities?.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {room.facilities.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {facility.facilityId?.nama || "Unnamed Facility"}
                      </p>
                      {facility.facilityId?.deskripsi && (
                        <p className="text-xs text-slate-400">
                          {facility.facilityId.deskripsi}
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-semibold">
                      {facility.total}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">
                  No facilities available
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-white/10 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                document.getElementById("bookingModal").showModal();
              }}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              Book Room
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

const IndexBooking = () => {
  const { roomsQuery } = useRooms();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingRoomId, setBookingRoomId] = useState(null);
  const [facilityRoomId, setFacilityRoomId] = useState(null);

  const openBookingModal = (roomId) => {
    setBookingRoomId(roomId);
    document.getElementById("bookingModal").showModal();
  };

  const closeBookingModal = () => {
    setBookingRoomId(null);
    document.getElementById("bookingModal").close();
  };

  const openFacilityModal = (roomId) => {
    setFacilityRoomId(roomId);
  };

  const closeFacilityModal = () => {
    setFacilityRoomId(null);
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
  const facilityRoom = rooms.find((room) => room._id === facilityRoomId);

  // Calculate statistics
  const availableRooms = rooms.filter(
    (room) => room.status === "available",
  ).length;
  const totalCapacity = rooms.reduce((sum, room) => sum + room.kapasitas, 0);
  const avgCapacity =
    totalRooms > 0 ? Math.round(totalCapacity / totalRooms) : 0;

  const filteredRooms = rooms.filter(
    (room) =>
      room.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.lokasi.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="space-y-4">
        {/* Statistics Dashboard - Professional Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2 sticky top-2 z-20">
          <StatCard
            icon={LayoutGrid}
            label="Total Rooms"
            value={totalRooms}
            color="bg-blue-500/10 border-blue-500/10"
            iconColor="text-blue-400"
            subtitle="All meeting spaces"
          />
          <StatCard
            icon={CheckCircle}
            label="Available"
            value={availableRooms}
            color="bg-emerald-500/10 border-emerald-500/10"
            iconColor="text-emerald-400"
            subtitle={`${totalRooms - availableRooms} rooms occupied`}
          />
          <StatCard
            icon={Clock}
            label="Today's Bookings"
            value="0"
            color="bg-amber-500/10 border-amber-500/10"
            iconColor="text-amber-400"
            subtitle="Scheduled meetings"
          />
        </div>

        {/* Grid Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-white/20  hover:translate-y-0.5 transition-all duration-300"
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
                {/* Title */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-bold text-white truncate"
                      title={room.nama}
                    >
                      {room.nama}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin size={13} className="shrink-0 text-green-400" />
                      <span className="truncate">{room.lokasi}</span>
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 my-2" />

                {/* Capacity */}
                {/* <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <span className="text-xs text-slate-300">
                    Capacity:{" "}
                    <span className="text-white font-semibold">
                      {room.kapasitas} px
                    </span>
                  </span>
                </div> */}

                {/* Action Buttons */}
                <div className="mt-auto pt-4 flex flex-col gap-2">
                  {/* Row 1: Secondary Actions */}
                  <div className="flex gap-2">
                    {/* Facility Button */}
                    <button
                      onClick={() => openFacilityModal(room._id)}
                      className="flex-1 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium text-xs py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Info size={14} className="text-purple-400" />
                      Facility
                    </button>

                    {/* Schedule Button */}
                    <button
                      onClick={() => openBookingModal(room._id)}
                      className="flex-1 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-xs py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar size={14} className="text-emerald-400" />
                      Schedule
                    </button>
                  </div>

                  {/* Row 2: Primary Action */}
                  <button
                    onClick={() => openBookingModal(room._id)}
                    className="w-full bg-blue-600/20 hover:bg-blue-500/30 text-white font-semibold text-xs py-2.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    Book Room
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Facility Modal */}
        {facilityRoomId && (
          <FacilityDetailModal
            room={facilityRoom}
            onClose={closeFacilityModal}
          />
        )}

        {/* Booking Modal */}
        <dialog id="bookingModal" className="modal">
          <div className="modal-box w-11/12 max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl">
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

        <TableMeeting />
      </div>
    </>
  );
};

export default IndexBooking;
