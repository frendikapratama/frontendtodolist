import React, { useState, useEffect, useContext } from "react";
import { useKuarter } from "../../hook/useKuarter";
import { useNavigate } from "react-router-dom";
import { KuarterForm } from "./KuarterForm";
import { Trash2, Eye, Layers, Pencil } from "lucide-react";
import NotificationBell from "../../components/ui/NotificationBell";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Kuarter = () => {
  const { kuarterQuery, updatedKuarterMutation, deleteMutation } = useKuarter();
  const [editing, setEditing] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [activeIndex, setActiveIndex] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isAdmin = user?.isSystemAdmin === true;

  // Warna untuk setiap status
  const STATUS_COLORS = {
    Done: "#10b981", // Emerald Green
    "Done-In review": "#06b6d4", // Cyan / Teal
    "In Progress": "#3b82f6", // Blue
    "To Do": "#f59e0b", // Amber / Orange
    Hold: "#64748b", // Slate
    Blocked: "#ef4444", // Red
  };

  const ALL_STATUSES = [
    "Done",
    "To Do",
    "Done-In review",
    "In Progress",
    "Hold",
    "Blocked",
  ];

  // Helper untuk memetakan data task
  const getChartData = (kuarter) => {
    const totalTask = kuarter.totalTask || 0;

    return ALL_STATUSES.map((status) => {
      const value = kuarter[status] || 0;
      const percentage =
        totalTask > 0 ? ((value / totalTask) * 100).toFixed(1) : "0.0";

      return {
        name: status,
        value: value,
        color: STATUS_COLORS[status] || "#6b7280",
        percentage: percentage,
      };
    });
  };

  // Helper styling badge departemen
  const getDepartmentBadgeStyle = (dept) => {
    const normalized = String(dept || "").toUpperCase();
    switch (normalized) {
      case "PBPG":
        return {
          text: "text-blue-400",
          dot: "bg-blue-400",
        };
      case "HPC":
        return {
          text: "text-emerald-400",
          dot: "bg-emerald-400",
        };
      case "PT":
        return {
          text: "text-amber-400",
          dot: "bg-amber-400",
        };
      default:
        return {
          text: "text-rose-400",
          dot: "bg-rose-400",
        };
    }
  };

  // Custom Tooltip yang dioptimalkan agar tidak tertutup elemen lain
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-2xl border border-white/20 z-50 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="font-semibold text-xs text-white">{data.name}</p>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
            <span>Tasks:</span>
            <span className="font-mono font-bold text-white">{data.value}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
            <span>Share:</span>
            <span className="font-mono font-bold text-sky-300">
              {data.payload.percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      closeModalDelete();
    }
  }, [deleteMutation.isSuccess]);

  const openCreateModal = () => {
    document.getElementById("createModal").showModal();
  };

  const ConfirmationModal = () => {
    document.getElementById("ConfirmationModal").showModal();
  };

  const closeModalDelete = () => {
    document.getElementById("ConfirmationModal").close();
  };

  const closeModal = () => {
    document.getElementById("createModal").close();
  };

  const handleDetailKuarter = (kuarterId) => {
    const kuarter = kuarterQuery.data?.find((item) => item._id === kuarterId);
    const userDepartment = String(user?.departemen || "")
      .trim()
      .toUpperCase();
    const kuarterDepartment = String(kuarter?.departemen || "")
      .trim()
      .toUpperCase();

    if (userDepartment !== "OFFICE" && userDepartment !== kuarterDepartment) {
      toast.error("Anda tidak memiliki akses ke kuarter department ini");
      return;
    }

    navigate(`/kuarter/${kuarterId}`);
  };

  const handleEdit = (id) => {
    if (!editedName.trim()) return;
    updatedKuarterMutation.mutate({
      id,
      data: { nama: editedName.trim() },
    });
    setEditing(null);
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") handleEdit(id);
    if (e.key === "Escape") setEditing(null);
  };

  const onPieEnter = (_, index, kuarterId) => {
    setActiveIndex((prev) => ({ ...prev, [kuarterId]: index }));
  };

  const onPieLeave = (kuarterId) => {
    setActiveIndex((prev) => ({ ...prev, [kuarterId]: null }));
  };

  return (
    <div className="p-2 md:p-4">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          List Quarters
        </h1>
        <div className="flex flex-row gap-2 items-center">
          <NotificationBell />
          <button
            onClick={openCreateModal}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 cursor-pointer"
          >
            Add Quarter
          </button>
        </div>
      </div>

      {/* Create Modal */}
      <dialog id="createModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl text-black bg-white rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-xl">Add Quarter</h3>
          </div>
          <KuarterForm onClose={closeModal} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>

      {/* Delete Confirmation Modal */}
      <dialog id="ConfirmationModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-white text-black rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-lg">
              Are you sure want to delete this quarter? This action can't be
              undone.
            </h3>
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all duration-200"
              onClick={closeModalDelete}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
              onClick={() => {
                if (toDelete) deleteMutation.mutate(toDelete);
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModalDelete}>close</button>
        </form>
      </dialog>

      {/* Content Grid */}
      <div>
        {kuarterQuery.isLoading ? (
          <div className="flex justify-center items-center mt-20">
            <span className="loading loading-spinner loading-lg text-white"></span>
          </div>
        ) : kuarterQuery.data?.length === 0 ? (
          <div className="flex flex-col justify-center items-center mt-20">
            <div className="bg-[#1A3D64]/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-70" />
              <h2 className="text-gray-300 text-lg">Belum ada kuarter</h2>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {kuarterQuery.data?.map((kuarter) => {
              const chartData = getChartData(kuarter);
              const activeChartData = chartData.filter((d) => d.value > 0);
              const hasTasks = activeChartData.length > 0;
              const currentActiveIndex = activeIndex[kuarter._id];
              const deptStyle = getDepartmentBadgeStyle(kuarter.departemen);
              const totalTask = kuarter.totalTask || 0;

              const doneCount = kuarter["Done"] || 0;
              const completionRate =
                totalTask > 0 ? Math.round((doneCount / totalTask) * 100) : 0;

              const hoveredItem =
                currentActiveIndex !== null && currentActiveIndex !== undefined
                  ? activeChartData[currentActiveIndex]
                  : null;

              return (
                <div
                  key={kuarter._id}
                  className="relative z-10 bg-[#132A45]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 overflow-visible animate-fadeIn flex flex-col justify-between"
                >
                  <div className="p-5 flex flex-col justify-between h-full space-y-4">
                    {/* Header: Title & Department Indicator */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        {editing === kuarter._id ? (
                          <input
                            type="text"
                            className="text-lg font-semibold text-white bg-[#1D546C]/40 border border-white/30 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                            value={editedName}
                            autoFocus
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={() => handleEdit(kuarter._id)}
                            onKeyDown={(e) => handleEditKeyDown(e, kuarter._id)}
                          />
                        ) : (
                          <div className="min-h-12 flex items-center flex-1">
                            <h2
                              className="text-base font-bold text-white hover:bg-white/5 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200 line-clamp-2 leading-snug w-full group/title flex items-center justify-between"
                              title={kuarter.nama}
                              onClick={() => {
                                setEditing(kuarter._id);
                                setEditedName(kuarter.nama);
                              }}
                            >
                              <span>{kuarter.nama}</span>
                              <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/title:opacity-100 transition-opacity ml-2 shrink-0" />
                            </h2>
                          </div>
                        )}

                        {/* Badge Departemen */}
                        <div className="flex items-center gap-2 shrink-0 pt-1">
                          <span
                            className={`w-2 h-2 rounded-full ${deptStyle.dot}`}
                          />
                          <span
                            className={`text-xs font-bold tracking-wide uppercase ${deptStyle.text}`}
                          >
                            {kuarter.departemen}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chart & Task Distribution Box */}
                    <div className="bg-[#102237]/60 rounded-xl p-4 border border-white/5 flex-1 flex flex-col justify-between relative">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-semibold text-slate-300">
                          Task Distribution
                        </h4>
                        <span className="text-xs bg-blue-500/20 text-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                          Total: {totalTask}
                        </span>
                      </div>

                      {/* Donut Chart */}
                      {hasTasks ? (
                        <div className="relative h-[165px] w-full flex items-center justify-center my-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={activeChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={46}
                                outerRadius={68}
                                paddingAngle={2}
                                cornerRadius={4}
                                stroke="none"
                                dataKey="value"
                                onMouseEnter={(_, index) =>
                                  onPieEnter(_, index, kuarter._id)
                                }
                                onMouseLeave={() => onPieLeave(kuarter._id)}
                                isAnimationActive={true}
                              >
                                {activeChartData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    opacity={
                                      currentActiveIndex === null ||
                                      currentActiveIndex === undefined ||
                                      currentActiveIndex === index
                                        ? 1
                                        : 0.4
                                    }
                                    style={{
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                    }}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                content={<CustomTooltip />}
                                wrapperStyle={{ zIndex: 100 }}
                              />
                            </PieChart>
                          </ResponsiveContainer>

                          {/* Teks di Tengah Donut Chart dengan latar belakang lembut agar tidak tertutup */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
                            <div className="bg-[#0f1f33]/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 shadow-inner flex flex-col items-center justify-center">
                              {hoveredItem ? (
                                <>
                                  <span
                                    className="text-base font-extrabold font-mono leading-none"
                                    style={{ color: hoveredItem.color }}
                                  >
                                    {hoveredItem.percentage}%
                                  </span>
                                  <span className="text-[9px] font-medium text-slate-300 mt-0.5 truncate max-w-[70px]">
                                    {hoveredItem.name}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-lg font-extrabold text-white font-mono leading-none">
                                    {completionRate}%
                                  </span>
                                  <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-400 mt-0.5">
                                    Completed
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[165px]">
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-1">
                            <span className="text-[11px] font-mono text-slate-500">
                              0%
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">No tasks yet</p>
                        </div>
                      )}

                      {/* Segmented Line Progress Bar di Bawah Chart */}
                      {hasTasks && (
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex my-2">
                          {activeChartData.map((entry, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: `${entry.percentage}%`,
                                backgroundColor: entry.color,
                              }}
                              title={`${entry.name}: ${entry.value} (${entry.percentage}%)`}
                              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                            />
                          ))}
                        </div>
                      )}

                      {/* Legend List (2 Kolom) */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-white/10">
                        {chartData.map((entry, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs py-0.5"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span
                                className="text-slate-300 text-[11px] truncate"
                                title={entry.name}
                              >
                                {entry.name}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px] font-mono ml-1 shrink-0">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 pt-1">
                      {isAdmin && (
                        <button
                          className="flex-1 px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-medium rounded-xl transition-all duration-200 border border-rose-500/30 flex items-center justify-center gap-2 cursor-pointer text-xs"
                          onClick={() => {
                            setToDelete(kuarter._id);
                            ConfirmationModal();
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                      <button
                        className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs"
                        onClick={() => handleDetailKuarter(kuarter._id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kuarter;
