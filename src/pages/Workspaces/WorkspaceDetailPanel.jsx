import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import { useWorkspaceStats } from "../../hook/useProgress";
import { Layers } from "lucide-react";

const AnimatedDivisionName = ({ name }) => {
  const [prevName, setPrevName] = useState(name);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (name !== prevName) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setPrevName(name);
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [name, prevName]);

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-indigo-600/90 to-blue-700/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 mb-4 shadow-xl border border-white/15">
      <style>{`
        .division-name-wrapper {
          position: relative;
          height: 2.25rem;
          overflow: hidden;
        }

        .division-name-text {
          font-size: 1.35rem;
          font-weight: 700;
          color: white;
          position: absolute;
          width: 100%;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          letter-spacing: -0.01em;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>

      <div className="division-name-wrapper">
        {isAnimating && (
          <div
            className="division-name-text"
            style={{ animation: "slideUp 0.5s ease-out forwards" }}
          >
            {prevName}
          </div>
        )}
        <div
          className="division-name-text"
          style={{
            animation: isAnimating
              ? "slideDown 0.5s ease-out forwards"
              : "none",
          }}
        >
          {name}
        </div>
      </div>
      <p className="text-xs font-medium text-indigo-100/80 mt-1 uppercase tracking-wider">
        Division Monitoring & Analytics
      </p>
    </div>
  );
};

// ==================== CUSTOM TOOLTIP ====================
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-2xl border border-white/15 z-50 pointer-events-none">
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

const WorkspaceDetailPanel = ({ workspace }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { workspaceStats } = useWorkspaceStats(workspace?._id);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1200);
    return () => clearTimeout(timer);
  }, [workspace]);

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-slate-400 bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
        <Layers className="w-12 h-12 mb-3 text-slate-400 opacity-60" />
        <p className="text-sm font-medium text-slate-300">
          Select a division to view details
        </p>
      </div>
    );
  }

  const apiData = workspaceStats.data;
  const mergedData = {
    inProgressTask: apiData?.inProgressTask ?? workspace.inProgressTask ?? 0,
    completedTask: apiData?.completedTask ?? workspace.completedTask ?? 0,
    holdBlockedTask: apiData?.holdBlockedTask ?? workspace.holdBlockedTask ?? 0,
    planningTask: apiData?.planningTask ?? workspace.planningTask ?? 0,
    totalTask:
      apiData?.totalTask ?? workspace.totalTask ?? workspace.totalTask ?? 0,
    totalProject: apiData?.totalProject ?? workspace.totalProject ?? 0,
    progress: apiData?.progress ?? 0,
    projects: apiData?.projects ?? [],
  };

  const totalTaskCalculated =
    (mergedData.inProgressTask || 0) +
    (mergedData.completedTask || 0) +
    (mergedData.holdBlockedTask || 0) +
    (mergedData.planningTask || 0);

  const totalTaskForCalculation =
    mergedData.totalTask || totalTaskCalculated || 1;

  // Chart data dengan warna konsisten
  const chartData = [
    {
      name: "In Progress",
      value: mergedData.inProgressTask || 0,
      color: "#3b82f6", // Blue
    },
    {
      name: "Completed",
      value: mergedData.completedTask || 0,
      color: "#10b981", // Emerald
    },
    {
      name: "Hold & Block",
      value: mergedData.holdBlockedTask || 0,
      color: "#64748b", // Slate
    },
    {
      name: "Planned",
      value: mergedData.planningTask || 0,
      color: "#f59e0b", // Amber
    },
  ].map((item) => ({
    ...item,
    percentage:
      totalTaskForCalculation > 0
        ? ((item.value / totalTaskForCalculation) * 100).toFixed(1)
        : "0.0",
  }));

  const activeChartData = chartData.filter((d) => d.value > 0);
  const hasTasks = activeChartData.length > 0;

  // Hitung persentase Completed default untuk tengah Donut Chart
  const completionRate =
    totalTaskForCalculation > 0
      ? Math.round(
          ((mergedData.completedTask || 0) / totalTaskForCalculation) * 100,
        )
      : 0;

  const hoveredItem =
    activeIndex !== null && activeIndex !== undefined
      ? activeChartData[activeIndex]
      : null;

  // Statistik dengan gaya tema gelap transparan (Glassmorphism) yang selaras dengan kartu kuarter
  const stats = [
    {
      label: "In Progress",
      value: mergedData.inProgressTask || 0,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-400/20 hover:border-blue-400/40",
    },
    {
      label: "Completed",
      value: mergedData.completedTask || 0,
      color: "text-emerald-400",
      bgColor:
        "bg-emerald-500/10 border-emerald-400/20 hover:border-emerald-400/40",
    },
    {
      label: "Hold & Block",
      value: mergedData.holdBlockedTask || 0,
      color: "text-slate-300",
      bgColor: "bg-slate-500/10 border-slate-400/20 hover:border-slate-400/40",
    },
    {
      label: "Planned",
      value: mergedData.planningTask || 0,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-400/20 hover:border-amber-400/40",
    },
    {
      label: "Total Task",
      value: mergedData.totalTask || 0,
      color: "text-purple-400",
      bgColor:
        "bg-purple-500/10 border-purple-400/20 hover:border-purple-400/40",
    },
    {
      label: "Total Project",
      value: mergedData.totalProject || 0,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10 border-sky-400/20 hover:border-sky-400/40",
    },
  ];

  return (
    <>
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
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
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

      <div className="space-y-4 animate-fadeIn">
        {/* Header dengan animasi nama divisi */}
        <AnimatedDivisionName name={workspace.nama} />

        {/* Task Distribution Box (Modern Donut Chart + Progress Bar) */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Task Distribution
            </h4>
            <span className="text-xs bg-sky-500/20 border border-sky-400/25 text-sky-200 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              Total: {mergedData.totalTask || totalTaskCalculated}
            </span>
          </div>

          {/* Donut Chart */}
          {hasTasks ? (
            <div className="relative h-[200px] w-full flex items-center justify-center my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    cornerRadius={5}
                    stroke="none"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    animationBegin={0}
                    animationDuration={700}
                    isAnimationActive={true}
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={
                          activeIndex === null ||
                          activeIndex === undefined ||
                          activeIndex === index
                            ? 1
                            : 0.35
                        }
                        style={{
                          filter:
                            activeIndex === index
                              ? `drop-shadow(0 0 8px ${entry.color}80)`
                              : "none",
                          transition: "all 0.25s ease",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                <div className="bg-slate-950/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10 shadow-inner flex flex-col items-center justify-center">
                  {hoveredItem ? (
                    <>
                      <span
                        className="text-lg font-extrabold font-mono leading-none"
                        style={{ color: hoveredItem.color }}
                      >
                        {hoveredItem.percentage}%
                      </span>
                      <span className="text-[9px] font-medium text-slate-300 mt-0.5 truncate max-w-[85px]">
                        {hoveredItem.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-extrabold text-white font-mono leading-none">
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
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center mb-2">
                <span className="text-xs font-mono text-slate-500">0%</span>
              </div>
              <p className="text-xs text-slate-400">No tasks yet</p>
            </div>
          )}

          {/* Segmented Line Progress Bar di Bawah Chart */}
          {hasTasks && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex my-3">
              {activeChartData.map((entry, idx) => {
                const totalVal = totalTaskForCalculation || 1;
                const percentageWidth = (
                  (entry.value / totalVal) *
                  100
                ).toFixed(1);
                return (
                  <div
                    key={idx}
                    style={{
                      width: `${percentageWidth}%`,
                      backgroundColor: entry.color,
                    }}
                    title={`${entry.name}: ${entry.value} (${percentageWidth}%)`}
                    className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  />
                );
              })}
            </div>
          )}

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
            {chartData.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg border border-transparent hover:bg-white/5 transition-colors cursor-pointer"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-slate-300 truncate">{entry.name}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] font-semibold">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Grid (Sudah disesuaikan dengan Dark Mode Glassmorphism) */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-slate-900/40 border-white/10 shadow-xl ${stat.bgColor}`}
              style={{
                animation: isAnimating
                  ? `slideUp 0.5s ease-out ${index * 0.08}s both`
                  : "none",
              }}
            >
              <p className="text-xs font-medium text-slate-300/80 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>
                {isAnimating ? (
                  <AnimatedNumber value={stat.value} duration={1000} />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WorkspaceDetailPanel;
