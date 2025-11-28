import { useState, useRef, useEffect } from "react";
import {
  PieChart,
  BarChart3,
  FileCheck2,
  Calendar,
  SquareDashedKanban,
  X,
} from "lucide-react";
import { useKuarterStats, useProgress } from "../hook/useProgress";
import { useKuarterLogs } from "../hook/useLog";
import { useGroupsByKuarter } from "../hook/useGroups";
import { getKuarter } from "../services/kuarter";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import NotificationBell from "../components/ui/NotificationBell";
import { progress } from "framer-motion";

// ==================== CONSTANTS ====================
const GRID_COLS = 12;
const ROW_HEIGHT = 100;
const GAP = 16;

const DEFAULT_CARDS = [
  {
    id: "pie-chart",
    x: 0,
    y: 0,
    w: 5,
    h: 5,
    title: "Distribution Project",
    icon: PieChart,
  },
  {
    id: "tasks",
    x: 5,
    y: 0,
    w: 7,
    h: 3,
    title: "Tasks by Status",
    icon: BarChart3,
  },
  {
    id: "recent",
    x: 5,
    y: 6,
    w: 7,
    h: 3,
    title: "Recent Activities",
    icon: FileCheck2,
  },
  { id: "agenda", x: 5, y: 3, w: 7, h: 3, title: "Agenda", icon: Calendar },
  {
    id: "heatmap",
    x: 0,
    y: 5,
    w: 5,
    h: 4,
    title: "Heat Map Activities",
    icon: SquareDashedKanban,
  },
];

const SAMPLE_TASKS = [
  {
    title: "Project Kickoff",
    startDate: "2025-11-10",
    dueDate: "2025-11-15",
    meetingDate: "2025-11-12",
  },
  {
    title: "Design Review",
    startDate: "2025-11-18",
    dueDate: "2025-11-20",
    meetingDate: "2025-11-19",
  },
];

const DEFAULT_PIE_DATA = [
  { label: "IT", value: 35, color: "#707070" },
  { label: "Marketing", value: 25, color: "#707070" },
  { label: "Finance", value: 20, color: "#707070" },
  { label: "HR", value: 15, color: "#707070" },
  { label: "Operations", value: 5, color: "#707070" },
];

// ==================== HELPER FUNCTIONS ====================
const checkCollision = (card1, card2) => {
  return !(
    card1.x >= card2.x + card2.w ||
    card1.x + card1.w <= card2.x ||
    card1.y >= card2.y + card2.h ||
    card1.y + card1.h <= card2.y
  );
};

const compactLayout = (cardsToCompact, movingCardId = null) => {
  const sorted = [...cardsToCompact].sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });

  const result = [];

  for (const card of sorted) {
    if (card.id === movingCardId) {
      result.push(card);
      continue;
    }

    let newCard = { ...card };

    // Ensure card doesn't exceed grid bounds
    if (newCard.x + newCard.w > GRID_COLS) {
      newCard.x = Math.max(0, GRID_COLS - newCard.w);
    }

    // Find best position
    for (let y = 0; y < card.y; y++) {
      const testCard = { ...newCard, y };
      const hasCollision = result.some((c) => checkCollision(testCard, c));
      if (!hasCollision) {
        newCard.y = y;
      } else {
        break;
      }
    }
    result.push(newCard);
  }
  return result;
};

// ==================== Heat MaP COMPONENT ====================
const ActivityHeatmap = ({ logs }) => {
  const [data, setData] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (logs && Array.isArray(logs) && logs.length > 0) {
      processLogs(logs);
    } else {
      generateEmptyHeatmap();
    }
  }, [logs]);

  const generateEmptyHeatmap = () => {
    const heatmapData = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      heatmapData.push({
        date: dateKey,
        displayDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        weekday: date.getDay(),
        count: 0,
        actions: [],
      });
    }

    setData(heatmapData);
    setLoading(false);
  };

  const processLogs = (logsData) => {
    const activityMap = {};

    logsData.forEach((log) => {
      const date = new Date(log.createdAt);
      const dateKey = date.toISOString().split("T")[0];

      if (!activityMap[dateKey]) {
        activityMap[dateKey] = {
          date: dateKey,
          count: 0,
          actions: [],
        };
      }

      activityMap[dateKey].count += 1;
      activityMap[dateKey].actions.push({
        action: log.action,
        user: log.user?.username || "Unknown",
        description: log.description || `${log.action.replace(/_/g, " ")}`,
      });
    });

    const heatmapData = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      heatmapData.push({
        date: dateKey,
        displayDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        weekday: date.getDay(),
        count: activityMap[dateKey]?.count || 0,
        actions: activityMap[dateKey]?.actions || [],
      });
    }

    setData(heatmapData);
    setLoading(false);
  };

  const getColor = (count) => {
    if (count === 0) return "#1a1a1a";
    if (count <= 2) return "#2d4a2d";
    if (count <= 5) return "#3d6b3d";
    if (count <= 10) return "#4d8c4d";
    return "#5dad5d";
  };
  const weeks = [];
  let currentWeek = [];

  data.forEach((day, index) => {
    if (index === 0 && day.weekday !== 0) {
      for (let i = 0; i < day.weekday; i++) {
        currentWeek.push(null);
      }
    }
    currentWeek.push(day);
    if (day.weekday === 6 || index === data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const cellSize = 11;
  const gap = 1;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentYear = new Date().getFullYear();
  const filteredWeeks = weeks.filter((week) => {
    return week.some((day) => {
      if (!day) return false;
      const dayDate = new Date(day.date);
      return dayDate.getFullYear() === currentYear;
    });
  });

  if (loading) {
    return (
      <div className="w-full bg-linear-to-br from-gray-900 to-gray-800 p-8 rounded-xl">
        <div className="text-white text-center">Loading activity data...</div>
      </div>
    );
  }

  const totalActivities = data.reduce((sum, day) => sum + day.count, 0);
  const daysActive = data.filter((day) => day.count > 0).length;

  return (
    <div className="w-full bg-linear-to-br from-gray-900 to-gray-800 p-8 rounded-xl">
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4">
          {/* Weekday labels */}
          <div
            className="flex flex-col justify-around pt-7 gap-1"
            style={{ height: `${7 * (cellSize + gap) + 24}px` }}
          >
            {weekdays.map((day, i) => (
              <div
                key={i}
                className="text-gray-400 text-xs"
                style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex flex-col">
            {/* Month labels */}
            <div
              className="flex mb-2"
              style={{ height: "24px", position: "relative" }}
            >
              {filteredWeeks.map((week, weekIndex) => {
                const firstDayInWeek = week.find((d) => d !== null);
                if (!firstDayInWeek) return null;

                let shouldShowMonth = false;
                if (weekIndex === 0) {
                  // Only show if it's not December (which means it's current year January or later)
                  shouldShowMonth = firstDayInWeek.month !== "Dec";
                } else {
                  const prevWeek = filteredWeeks[weekIndex - 1];
                  const prevFirstDay = prevWeek.find((d) => d !== null);
                  if (
                    prevFirstDay &&
                    firstDayInWeek.month !== prevFirstDay.month
                  ) {
                    shouldShowMonth = true;
                  }
                }

                return shouldShowMonth ? (
                  <div
                    key={weekIndex}
                    className="text-gray-400 text-xs font-medium"
                    style={{
                      width: `${cellSize + gap}px`,
                      marginRight: "4px",
                      lineHeight: "24px",
                    }}
                  >
                    {firstDayInWeek.month}
                  </div>
                ) : (
                  <div
                    key={weekIndex}
                    style={{ width: `${cellSize + gap}px`, marginRight: "4px" }}
                  />
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {filteredWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const dayData = week.find(
                      (d) => d && d.weekday === dayIndex
                    );
                    const currentYear = new Date().getFullYear();

                    if (!dayData) {
                      return (
                        <div
                          key={dayIndex}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                          }}
                        />
                      );
                    }
                    const dayDate = new Date(dayData.date);
                    if (dayDate.getFullYear() !== currentYear) {
                      return (
                        <div
                          key={dayIndex}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                          }}
                        />
                      );
                    }

                    return (
                      <div
                        key={dayIndex}
                        className="rounded cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-white/50 hover:scale-110"
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          backgroundColor: getColor(dayData.count),
                        }}
                        onMouseEnter={() => setHoveredCell(dayData)}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6">
        <span className="text-gray-400 text-sm">Less</span>
        <div className="flex gap-1">
          {[0, 2, 5, 10, 15].map((level, i) => (
            <div
              key={i}
              className="rounded"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: getColor(level),
              }}
            />
          ))}
        </div>
        <span className="text-gray-400 text-sm">More</span>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-medium">{hoveredCell.displayDate}</p>
            <span className="text-emerald-400 font-bold">
              {hoveredCell.count} activities
            </span>
          </div>

          {hoveredCell.actions.length > 0 && (
            <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
              {hoveredCell.actions.slice(0, 5).map((action, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-300 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>{action.user}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{action.description}</span>
                </div>
              ))}
              {hoveredCell.actions.length > 5 && (
                <div className="text-xs text-gray-500 pl-4">
                  +{hoveredCell.actions.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== QUARTER SELECTION DIALOG ====================
const QuarterSelectionDialog = ({ quarters, onSelect, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2">Select Quarter</h2>
        <p className="text-white/60 text-sm mb-6">
          Choose a quarter to view the dashboard
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="text-white/60 text-center py-8">
              Loading kuarters...
            </div>
          ) : quarters && quarters.length > 0 ? (
            quarters.map((quarter) => (
              <button
                key={quarter._id}
                onClick={() => onSelect(quarter._id)}
                className="w-full text-left bg-linear-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/40 hover:to-purple-500/40 rounded-lg p-4 border border-white/10 hover:border-white/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">
                      {quarter.kuarterName ||
                        quarter.nama ||
                        quarter.name ||
                        "Unknown Kuarter"}
                    </p>
                    <p className="text-white/60 text-sm">
                      {quarter.departemen || quarter.department || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm">
                      {quarter.totalProject} Projects
                    </p>
                    <p className="text-emerald-400 text-xs">
                      {quarter.progress}% Progress
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-white/60 text-center py-8">
              No kuarters available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== PIE CHART COMPONENT ====================
const InteractivePieChart = ({ pieData }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const PIE_DATA = pieData;

  // Trigger animation reset when pieData changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1200); // Animation duration
    return () => clearTimeout(timer);
  }, [pieData]);

  if (!PIE_DATA || PIE_DATA.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/60 text-lg">There is no data yet</p>
      </div>
    );
  }

  const total = PIE_DATA.reduce((sum, item) => sum + item.value, 0);

  const handleClick = (index) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const getPathData = (startAngle, endAngle, isSelected) => {
    const radius = 100;
    const centerX = 200;
    const centerY = 180;
    const offset = isSelected ? 20 : 0;

    const midAngle = (startAngle + endAngle) / 2;
    const offsetX = Math.cos(midAngle) * offset;
    const offsetY = Math.sin(midAngle) * offset;

    const x1 = centerX + offsetX + radius * Math.cos(startAngle);
    const y1 = centerY + offsetY + radius * Math.sin(startAngle);
    const x2 = centerX + offsetX + radius * Math.cos(endAngle);
    const y2 = centerY + offsetY + radius * Math.sin(endAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${centerX + offsetX} ${
      centerY + offsetY
    } L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (startAngle, endAngle, isSelected) => {
    const midAngle = (startAngle + endAngle) / 2;
    const textRadius = isSelected ? 50 : 65;
    const centerX = 200;
    const centerY = 180;
    const offset = isSelected ? 20 : 0;

    const offsetX = Math.cos(midAngle) * offset;
    const offsetY = Math.sin(midAngle) * offset;

    return {
      x: centerX + offsetX + textRadius * Math.cos(midAngle),
      y: centerY + offsetY + textRadius * Math.sin(midAngle),
    };
  };

  const getOuterTextPosition = (startAngle, endAngle) => {
    const midAngle = (startAngle + endAngle) / 2;
    const outerRadius = 135;
    const centerX = 200;
    const centerY = 180;

    return {
      x: centerX + outerRadius * Math.cos(midAngle),
      y: centerY + outerRadius * Math.sin(midAngle),
    };
  };

  let currentAngle = -Math.PI / 2;

  return (
    <div className="flex items-center justify-center h-full">
      <style>{`
        @keyframes pieChartDraw {
          from {
            opacity: 0;
            transform: rotate(-180deg);
          }
          to {
            opacity: 1;
            transform: rotate(0deg);
          }
        }
        
        .pie-chart-svg {
          animation: ${
            isAnimating
              ? "pieChartDraw 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : "none"
          };
          transform-origin: center;
        }
      `}</style>
      <svg
        width="800"
        height="720"
        viewBox="0 0 400 360"
        className="pie-chart-svg"
      >
        {PIE_DATA.map((item, index) => {
          const sliceAngle = (item.value / total) * 2 * Math.PI;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sliceAngle;
          const isSelected = selectedIndex === index;

          const pathData = getPathData(startAngle, endAngle, isSelected);
          const textPos = getTextPosition(startAngle, endAngle, isSelected);
          const outerTextPos = getOuterTextPosition(startAngle, endAngle);
          const percentage = ((item.value / total) * 100).toFixed(0);

          currentAngle = endAngle;

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={isSelected ? "#6b7280" : item.color}
                stroke="#4b5563"
                strokeWidth="3"
                onClick={() => handleClick(index)}
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  filter: isSelected
                    ? "drop-shadow(0 0 15px rgba(156, 163, 175, 0.8)) drop-shadow(0 0 25px rgba(156, 163, 175, 0.5))"
                    : "none",
                }}
              />

              {!isSelected && (
                <text
                  x={textPos.x}
                  y={textPos.y}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="500"
                  onClick={() => handleClick(index)}
                  style={{ cursor: "pointer", pointerEvents: "none" }}
                  transform={
                    sliceAngle < 0.3
                      ? `rotate(45 ${textPos.x} ${textPos.y})`
                      : ""
                  }
                >
                  {item.label}
                </text>
              )}

              {isSelected && (
                <text
                  x={outerTextPos.x}
                  y={outerTextPos.y}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="600"
                  style={{ pointerEvents: "none" }}
                >
                  {item.label} - {percentage}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==================== CARD CONTENT COMPONENTS ====================
const TasksContent = ({ taskStatuses }) => {
  const hasData =
    taskStatuses && taskStatuses.some((status) => status.count > 0);

  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/60 text-lg">There is no data yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 h-full overflow-y-auto scrollbar-thin">
      {taskStatuses.map((status, i) => (
        <div
          key={i}
          className={`bg-linear-to-br ${status.color} rounded-lg p-4 text-center hover:scale-105 transition-transform`}
        >
          <p className={`text-3xl font-bold text-white`}>
            <AnimatedNumber value={status.count} duration={2000} />
            {status.isPercentage ? "%" : ""}
          </p>
          <p className="text-white/90 text-sm mt-1">{status.label}</p>
        </div>
      ))}
    </div>
  );
};

const RecentActivitiesContent = ({ activities = [] }) => {
  const hasData = activities && activities.length > 0;

  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/60 text-lg">There is no activity yet</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-2 overflow-y-auto h-full pr-2 scrollbar-thin">
      {activities.map((activity, i) => (
        <div
          key={activity._id || i}
          className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-white/90 text-sm font-medium truncate">
                {activity.user?.username || "Unknown"} -{" "}
                {activity.action?.replace(/_/g, " ") || "Action"}
              </p>
              <p className="text-white/60 text-xs mt-1 line-clamp-2">
                {activity.description || "No description"}
              </p>
            </div>
          </div>
          <p className="text-white/50 text-xs mt-2">
            {formatDate(activity.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
};

const AgendaContent = () => (
  <div className="space-y-3 overflow-y-auto h-full">
    {SAMPLE_TASKS.map((task, i) => (
      <div
        key={i}
        className="bg-linear-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-white/10 hover:border-white/30 transition-all"
      >
        <p className="text-white font-medium text-sm">{task.title}</p>
        <p className="text-white/60 text-xs mt-1">
          Meeting: {task.meetingDate}
        </p>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
export default function Dashboard() {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [isLoading, setIsLoading] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [placeholder, setPlaceholder] = useState(null);
  const [containerReady, setContainerReady] = useState(false);
  const [selectedKuarterId, setSelectedKuarterId] = useState(null);
  const [quarters, setQuarters] = useState([]);
  const [quartersLoading, setQuartersLoading] = useState(true);
  const [pieData, setPieData] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const containerRef = useRef(null);

  const { kuarterStats } = useKuarterStats(selectedKuarterId);
  const { kuarterLogs } = useKuarterLogs(selectedKuarterId);
  useEffect(() => {
    const loadQuarters = async () => {
      try {
        const data = await getKuarter();
        setQuarters(data || []);
      } catch (error) {
        console.error("Failed to load quarters:", error);
      } finally {
        setQuartersLoading(false);
      }
    };
    loadQuarters();
  }, []);
  useEffect(() => {
    if (kuarterStats.data) {
      const stats = kuarterStats.data;
      const pieChartData = (stats.workspaces || []).map((workspace, index) => ({
        label: workspace.workspaceName,
        value: workspace.totalProject || 0,
        color:
          DEFAULT_PIE_DATA[index % DEFAULT_PIE_DATA.length]?.color || "#1a1a1a",
      }));
      setPieData(pieChartData);
      const updatedTaskStatuses = [
        {
          label: "Total Project",
          count: stats.totalProject || 0,
          color: "from-indigo-500 to-indigo-700",
        },
        {
          label: "Planning",
          count: stats.planningProject || 0,
          color: "from-amber-400 to-orange-500",
        },
        {
          label: "Undated",
          count: stats.undatedProject || 0,
          color: "from-slate-400 to-slate-600",
        },
        {
          label: "In Progress",
          count: stats.inProgressProject || 0,
          color: "from-blue-500 to-sky-500",
        },
        {
          label: "Not Started",
          count: stats.notStartedProject || 0,
          color: "from-gray-500 to-gray-700",
        },
        {
          label: "Overdue",
          count: stats.overdueProject || 0,
          color: "from-red-500 to-red-700",
        },
        {
          label: "Completed",
          count: stats.completedProject || 0,
          color: "from-emerald-500 to-green-600",
        },
        {
          label: "Progress",
          count: stats.progress || 0,
          color: "from-blue-500 to-indigo-500",
          isPercentage: true,
        },
      ];
      setTaskStatuses(updatedTaskStatuses);
    }
  }, [kuarterStats.data]);

  useEffect(() => {
    if (
      kuarterLogs.data &&
      Array.isArray(kuarterLogs.data) &&
      kuarterLogs.data.length > 0
    ) {
      setActivityLogs(kuarterLogs.data);
      const recent = [...kuarterLogs.data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentActivities(recent);
    } else {
      setActivityLogs([]);
      setRecentActivities([]);
    }
  }, [kuarterLogs.data]);
  const handleSelectQuarter = (kuarterId) => {
    setSelectedKuarterId(kuarterId);
    setIsLoading(true);
  };
  useEffect(() => {
    if (selectedKuarterId && !kuarterStats.isLoading) {
      setIsLoading(false);
    }
  }, [selectedKuarterId, kuarterStats.isLoading]);

  // ==================== STORAGE HOOKS ====================
  useEffect(() => {
    const loadLayout = async () => {
      // Wait for container to be mounted
      if (!containerRef.current) {
        setTimeout(loadLayout, 50);
        return;
      }

      try {
        if (typeof window.storage !== "undefined") {
          const result = await window.storage.get("dashboard-layout");
          if (result?.value) {
            const loadedCards = JSON.parse(result.value);
            const validatedCards = loadedCards.map((card) => ({
              ...card,
              x: Math.min(card.x, Math.max(0, GRID_COLS - card.w)),
              y: Math.max(0, card.y),
              w: Math.min(card.w, GRID_COLS),
              h: Math.max(2, card.h),
            }));
            setCards(compactLayout(validatedCards));
            setContainerReady(true);
            return;
          }
        }
      } catch (error) {
        console.log("Error loading layout:", error);
      }
      const validatedCards = DEFAULT_CARDS.map((card) => ({
        ...card,
        x: Math.min(card.x, Math.max(0, GRID_COLS - card.w)),
        y: Math.max(0, card.y),
        w: Math.min(card.w, GRID_COLS),
        h: Math.max(2, card.h),
      }));
      setCards(compactLayout(validatedCards));
      setContainerReady(true);
    };
    setTimeout(loadLayout, 100);
  }, []);

  // ==================== CONTAINER RESIZE OBSERVER ====================
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Re-validate cards when container size changes
      setCards((prevCards) => {
        const validatedCards = prevCards.map((card) => ({
          ...card,
          x: Math.min(card.x, Math.max(0, GRID_COLS - card.w)),
          w: Math.min(card.w, GRID_COLS - card.x),
        }));
        return compactLayout(validatedCards);
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const saveLayout = async () => {
        try {
          if (typeof window.storage !== "undefined") {
            await window.storage.set("dashboard-layout", JSON.stringify(cards));
          }
        } catch (error) {
          console.log("Layout saved to memory only");
        }
      };
      saveLayout();
    }
  }, [cards, isLoading]);

  // ==================== WINDOW RESIZE HANDLER ====================
  useEffect(() => {
    let resizeTimeout;
    const handleWindowResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (containerRef.current) {
          // Validate and adjust cards if window resized
          const adjustedCards = cards.map((card) => ({
            ...card,
            x: Math.min(card.x, Math.max(0, GRID_COLS - card.w)),
            w: Math.min(card.w, GRID_COLS - card.x),
          }));
          const compacted = compactLayout(adjustedCards);
          // Only update if actually changed
          if (JSON.stringify(compacted) !== JSON.stringify(cards)) {
            setCards(compacted);
          }
        }
      }, 250); // Debounce resize events
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // ==================== POSITION CALCULATIONS ====================
  const getPixelPosition = (gridX, gridY, gridW, gridH) => {
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth - 48;
    const colWidth = (containerWidth - GAP * (GRID_COLS - 1)) / GRID_COLS;

    return {
      left: gridX * (colWidth + GAP),
      top: gridY * (ROW_HEIGHT + GAP),
      width: gridW * colWidth + (gridW - 1) * GAP,
      height: gridH * ROW_HEIGHT + (gridH - 1) * GAP,
    };
  };

  const getGridPosition = (pixelX, pixelY) => {
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth - 48;
    const colWidth = (containerWidth - GAP * (GRID_COLS - 1)) / GRID_COLS;

    const x = Math.round(pixelX / (colWidth + GAP));
    const y = Math.round(pixelY / (ROW_HEIGHT + GAP));

    return {
      x: Math.max(0, Math.min(GRID_COLS - 1, x)),
      y: Math.max(0, y),
    };
  };

  // ==================== EVENT HANDLERS ====================
  const handleMouseDown = (e, cardId, action) => {
    const card = cards.find((c) => c.id === cardId);

    if (action === "drag") {
      const pos = getPixelPosition(card.x, card.y, card.w, card.h);
      setDragging({
        id: cardId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - pos.left,
        offsetY: e.clientY - pos.top,
        originalX: card.x,
        originalY: card.y,
      });
      setPlaceholder({ x: card.x, y: card.y, w: card.w, h: card.h });
    } else if (action === "resize") {
      setResizing({
        id: cardId,
        startX: e.clientX,
        startY: e.clientY,
        originalW: card.w,
        originalH: card.h,
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newPos = getGridPosition(
        e.clientX - dragging.offsetX,
        e.clientY - dragging.offsetY
      );

      const draggedCard = cards.find((c) => c.id === dragging.id);
      const maxX = Math.max(0, GRID_COLS - draggedCard.w);
      const proposedX = Math.min(maxX, newPos.x);
      const proposedY = newPos.y;

      setPlaceholder({
        x: proposedX,
        y: proposedY,
        w: draggedCard.w,
        h: draggedCard.h,
      });

      const tempCards = cards.map((c) =>
        c.id === dragging.id ? { ...c, x: proposedX, y: proposedY } : c
      );

      setCards(compactLayout(tempCards, dragging.id));
    } else if (resizing) {
      const card = cards.find((c) => c.id === resizing.id);
      const containerWidth =
        containerRef.current?.offsetWidth || window.innerWidth - 48;
      const colWidth = (containerWidth - GAP * (GRID_COLS - 1)) / GRID_COLS;

      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;

      // Calculate new width and height with constraints
      const maxW = GRID_COLS - card.x; // Don't exceed container width
      const newW = Math.max(
        2,
        Math.min(
          maxW,
          resizing.originalW + Math.round(deltaX / (colWidth + GAP))
        )
      );
      const newH = Math.max(
        2,
        resizing.originalH + Math.round(deltaY / (ROW_HEIGHT + GAP))
      );

      const tempCards = cards.map((c) =>
        c.id === resizing.id ? { ...c, w: newW, h: newH } : c
      );

      setCards(compactLayout(tempCards, resizing.id));
    }
  };

  const handleMouseUp = () => {
    if (dragging || resizing) {
      setCards(compactLayout(cards));
    }

    setDragging(null);
    setResizing(null);
    setPlaceholder(null);
  };

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, resizing, cards]);

  // ==================== WINDOW RESIZE HANDLER ====================
  useEffect(() => {
    let resizeTimeout;
    const handleWindowResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (containerRef.current) {
          // Validate and adjust cards if window resized
          const adjustedCards = cards.map((card) => ({
            ...card,
            x: Math.min(card.x, Math.max(0, GRID_COLS - card.w)),
            w: Math.min(card.w, GRID_COLS - card.x),
          }));
          const compacted = compactLayout(adjustedCards);
          // Only update if actually changed
          if (JSON.stringify(compacted) !== JSON.stringify(cards)) {
            setCards(compacted);
          }
        }
      }, 250); // Debounce resize events
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // ==================== RENDER CARD CONTENT ====================
  const renderCardContent = (cardId) => {
    switch (cardId) {
      case "pie-chart":
        return <InteractivePieChart pieData={pieData} />;
      case "agenda":
        return <AgendaContent />;
      case "tasks":
        return <TasksContent taskStatuses={taskStatuses} />;
      case "recent":
        return <RecentActivitiesContent activities={recentActivities} />;
      case "heatmap":
        return <ActivityHeatmap logs={activityLogs} />;
      default:
        return null;
    }
  };

  // ==================== RENDER ====================
  const maxY = cards.reduce((max, card) => Math.max(max, card.y + card.h), 0);
  const containerHeight = maxY * (ROW_HEIGHT + GAP) + GAP;
  if (!selectedKuarterId) {
    return (
      <QuarterSelectionDialog
        quarters={quarters}
        onSelect={handleSelectQuarter}
        isLoading={quartersLoading}
      />
    );
  }

  if (isLoading || kuarterStats.isLoading) {
    return (
      <div className="p-6 bg-linear-to-br from-[#1A3D64] to-[#1D546C] min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (kuarterStats.error) {
    return (
      <div className="p-6 bg-linear-to-br from-[#1A3D64] to-[#1D546C] min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading dashboard data</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-linear-to-br from-[#1A3D64] to-[#1D546C] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <div className="flex flex-row gap-2 items-center">
            <button
              onClick={() => setSelectedKuarterId(null)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all text-sm"
            >
              <X size={16} />
              Change Quarter
            </button>
            <NotificationBell />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-sm">
            You are able to drag the cards.
          </p>
          {kuarterStats.data && (
            <p className="text-white/70 text-sm">
              <span className="font-semibold text-white">
                {kuarterStats.data.kuarterName ||
                  kuarterStats.data.nama ||
                  kuarterStats.data.name ||
                  "Unknown Kuarter"}
              </span>{" "}
              -{" "}
              {kuarterStats.data.departemen ||
                kuarterStats.data.department ||
                "N/A"}
            </p>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div
        ref={containerRef}
        className="relative"
        style={{ minHeight: `${Math.max(800, containerHeight)}px` }}
      >
        {/* Placeholder */}
        {placeholder && (
          <div
            className="absolute bg-blue-500/20 border-2 border-dashed border-blue-400/50 rounded-2xl z-0 transition-all duration-200"
            style={getPixelPosition(
              placeholder.x,
              placeholder.y,
              placeholder.w,
              placeholder.h
            )}
          />
        )}

        {/* Cards */}
        {cards.map((card) => {
          const pos = getPixelPosition(card.x, card.y, card.w, card.h);
          const isDraggingThis = dragging?.id === card.id;
          const isResizingThis = resizing?.id === card.id;

          return (
            <div
              key={card.id}
              className={`absolute bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl transition-all duration-200 ${
                isDraggingThis || isResizingThis
                  ? "z-50 shadow-3xl scale-105 opacity-80"
                  : "z-10 hover:bg-white/10"
              }`}
              style={{
                left: `${pos.left}px`,
                top: `${pos.top}px`,
                width: `${pos.width}px`,
                height: `${pos.height}px`,
                cursor: isDraggingThis ? "grabbing" : "default",
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  if (!e.target.closest("select")) {
                    handleMouseDown(e, card.id, "drag");
                  }
                }}
              >
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 select-none">
                  <span className="text-2xl border rounded-full p-1 bg-gray-400 text-gray-800 font-bold border-none">
                    {typeof card.icon === "string"
                      ? card.icon
                      : card.icon && <card.icon size={22} />}
                  </span>
                  {card.title}
                </h2>

                {/* Group Dropdown for Heatmap */}
                {card.id === "heatmap" && groups.length > 0 && (
                  <select
                    value={selectedGroupId || ""}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-1.5 hover:bg-white/20 transition-all cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">Select Group...</option>
                    {groups.map((group) => (
                      <option
                        key={group._id || group.id}
                        value={group._id || group.id}
                      >
                        {group.nama || group.name}
                      </option>
                    ))}
                  </select>
                )}

                <div className="text-white/50 hover:text-white/80 transition-colors">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="5" r="1" />
                    <circle cx="15" cy="5" r="1" />
                    <circle cx="9" cy="12" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="15" cy="19" r="1" />
                  </svg>
                </div>
              </div>

              {/* Card Content */}
              <div className="h-[calc(100%-60px)] overflow-hidden">
                {renderCardContent(card.id)}
              </div>

              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group"
                onMouseDown={(e) => handleMouseDown(e, card.id, "resize")}
              >
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-white/40 group-hover:border-white/80 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
