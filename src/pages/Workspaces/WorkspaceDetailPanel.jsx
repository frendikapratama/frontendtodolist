import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import { useWorkspaceStats } from "../../hook/useProgress";

// ==================== ANIMATED DIVISION NAME COMPONENT ====================
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
    <div className="division-name-container">
      <style>{`
        .division-name-container {
          {/* width: full; */}
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 0.75rem;
          padding: 1rem 1.5rem;
          margin-bottom: 1rem;
        }

        .division-name-wrapper {
          position: relative;
          height: 2.5rem;
          overflow: hidden;
        }

        .division-name-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          position: absolute;
          width: 100%;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .division-name-text.current {
          animation: slideDown 0.5s ease-out forwards;
        }

        .division-name-text.previous {
          animation: slideUp 0.5s ease-out forwards;
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
          <div className="division-name-text previous">{prevName}</div>
        )}
        <div
          className={`division-name-text ${isAnimating ? "current" : ""}`}
          style={{
            animation: isAnimating
              ? "slideDown 0.5s ease-out forwards"
              : "none",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
};

// ==================== CUSTOM TOOLTIP ====================
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">
          Value: <span className="font-bold">{data.value}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage:{" "}
          <span className="font-bold">{data.payload.percentage}%</span>
        </p>
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
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium">Select a division to view details</p>
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

  // Chart data
  const chartData = [
    {
      name: "In Progress",
      value: mergedData.inProgressTask || 0,
      color: "#3b82f6",
    },
    {
      name: "Completed",
      value: mergedData.completedTask || 0,
      color: "#10b981",
    },
    {
      name: "Hold & Block",
      value: mergedData.holdBlockedTask || 0,
      color: "#6b7280",
    },
    { name: "Planned", value: mergedData.planningTask || 0, color: "#f59e0b" },
  ].map((item) => ({
    ...item,
    percentage: ((item.value / totalTaskForCalculation) * 100).toFixed(1),
  }));
  const stats = [
    {
      label: "In Progress",
      value: mergedData.inProgressTask || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed",
      value: mergedData.completedTask || 0,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Hold & Block",
      value: mergedData.holdBlockedTask || 0,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      label: "Planned",
      value: mergedData.planningTask || 0,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Total Task",
      value: mergedData.totalTask || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Project",
      value: mergedData.totalProject || 0,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {`${percentage}%`}
      </text>
    );
  };

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
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>

      <div className="space-y-4 animate-fadeIn">
        {/* Header */}
        <div>
          <AnimatedDivisionName name={workspace.nama} />
          <p className="text-sm text-white mt-2">Division Statistics</p>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Task Distribution
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart key={workspace._id}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationBegin={0}
                animationDuration={800}
                label={renderCustomLabel}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.6
                    }
                    style={{
                      filter:
                        activeIndex === index
                          ? "brightness(1.1)"
                          : "brightness(1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-700">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-md`}
              style={{
                animation: isAnimating
                  ? `slideUp 0.5s ease-out ${index * 0.1}s both`
                  : "none",
              }}
            >
              <p className="text-xs font-medium text-gray-600 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>
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
