import React, { useState, useEffect } from "react";
import meetingService from "../../services/BookingMeeting/meeting";
import { Users, Clock, Calendar, CheckCircle, PlayCircle, MapPin } from "lucide-react";
import dayjs from "dayjs";

const MeetingDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      const response = await meetingService.getDashboardData();
      if (response.success) {
        setRooms(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes just in case there are new bookings
    const dataInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(dataInterval);
  }, []);

  // Timer to update current time every minute to re-evaluate "In Progress" status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Check every 10 seconds for more real-time feel
    return () => clearInterval(timer);
  }, []);

  const getRoomStatus = (room) => {
    const now = dayjs(currentTime);
    const bookings = room.todaysBookings || [];

    // Check if any meeting is currently happening
    const currentMeeting = bookings.find((meeting) => {
      const start = dayjs(meeting.startTime);
      const end = dayjs(meeting.endTime);
      return now.isAfter(start) && now.isBefore(end);
    });

    if (currentMeeting) {
      return { status: "In Progress", meeting: currentMeeting };
    }

    return { status: "Available", meeting: null };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meeting Rooms Dashboard</h1>
          <p className="text-gray-500 mt-2">Real-time status of meeting rooms and today's schedule</p>
        </div>
        <div className="text-right bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xl font-semibold text-gray-700">
            {dayjs(currentTime).format("dddd, DD MMM YYYY")}
          </div>
          <div className="text-3xl font-bold text-primary mt-1 flex items-center justify-end">
            <Clock className="mr-2" size={28} />
            {dayjs(currentTime).format("HH:mm")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const { status, meeting: currentMeeting } = getRoomStatus(room);
          const isAvailable = status === "Available";

          return (
            <div 
              key={room._id} 
              className={`card bg-base-100 shadow-xl border-t-4 transition-all duration-300 hover:shadow-2xl overflow-hidden ${isAvailable ? 'border-success' : 'border-warning'}`}
            >
              <figure className="relative h-56 w-full">
                {room.photo ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/rooms/${room.photo}`}
                    alt={room.nama}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/600x300?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <MapPin size={48} className="mb-2 opacity-20" />
                    <span className="font-medium">No Image Available</span>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full shadow-lg font-bold text-white text-sm flex items-center backdrop-blur-md ${isAvailable ? 'bg-success/90' : 'bg-warning/90 animate-pulse'}`}>
                  {isAvailable ? (
                    <><CheckCircle size={16} className="mr-1.5" /> AVAILABLE</>
                  ) : (
                    <><PlayCircle size={16} className="mr-1.5" /> IN PROGRESS</>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold drop-shadow-md">{room.nama}</h2>
                  <div className="flex items-center text-sm font-medium mt-1 opacity-90 drop-shadow-md">
                    <MapPin size={14} className="mr-1" /> {room.lokasi}
                    <span className="mx-2 opacity-60">•</span>
                    <Users size={14} className="mr-1" /> Cap: {room.kapasitas}
                  </div>
                </div>
              </figure>
              
              <div className="card-body px-6 py-5 bg-white">
                <div className="mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center pb-3 border-b border-gray-100">
                    <Calendar size={18} className="mr-2 text-primary" />
                    Today's Bookings
                  </h3>
                  
                  {room.todaysBookings && room.todaysBookings.length > 0 ? (
                    <div className="space-y-3 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {room.todaysBookings.map((bk) => {
                        const isHappeningNow = currentMeeting && currentMeeting._id === bk._id;
                        return (
                          <div 
                            key={bk._id} 
                            className={`p-4 rounded-xl border-l-4 text-sm transition-all duration-300 ${
                              isHappeningNow 
                                ? 'bg-orange-50 border-warning shadow-md scale-[1.02]' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className={`font-bold text-base line-clamp-1 ${isHappeningNow ? 'text-gray-900' : 'text-gray-700'}`}>
                              {bk.title}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`flex items-center font-medium px-2 py-1 rounded-md ${isHappeningNow ? 'bg-orange-100 text-orange-800' : 'bg-gray-200 text-gray-700'}`}>
                                <Clock size={14} className="mr-1.5" />
                                {dayjs(bk.startTime).format("HH:mm")} - {dayjs(bk.endTime).format("HH:mm")}
                              </span>
                              {isHappeningNow && (
                                <span className="text-xs text-white bg-warning px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center shadow-sm">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-ping"></span>
                                  Live
                                </span>
                              )}
                            </div>
                            {bk.organizerId && (
                              <div className="text-xs text-gray-500 mt-2 truncate flex items-center">
                                <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-gray-600 font-bold">
                                  {bk.organizerId.nama ? bk.organizerId.nama.charAt(0).toUpperCase() : '?'}
                                </span>
                                {bk.organizerId.nama}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-6 text-center p-8 bg-gray-50 rounded-xl text-gray-500 text-sm border-2 border-dashed border-gray-200 flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                        <CheckCircle size={24} />
                      </div>
                      <span className="font-medium text-gray-600">No meetings scheduled today</span>
                      <span className="text-xs mt-1 text-gray-400">Room is free for the rest of the day</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingDashboard;
