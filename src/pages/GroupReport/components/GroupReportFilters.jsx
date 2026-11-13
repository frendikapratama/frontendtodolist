import { Search, Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "To Do", label: "To Do" },
  { value: "In Progress", label: "In Progress" },
  { value: "Hold", label: "Hold" },
  { value: "Blocked", label: "Blocked" },
  { value: "Done", label: "Done" },
  { value: "Done-In review", label: "Done-In review" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];

const SELECT_CLASS =
  "w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden focus:bg-[#1C3A5A] transition-all";
const DATE_CLASS =
  "w-full px-3 py-1.5 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden transition-all scheme-dark";
const LABEL_CLASS =
  "block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5";

export default function GroupReportFilters({ filters, onChange, onReset }) {
  const { search, status, priority, startDate, endDate } = filters;

  const handleChange = (key) => (e) => onChange({ [key]: e.target.value });

  return (
    <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-5 space-y-4">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="flex items-center gap-2 text-white font-semibold">
          <Filter size={16} className="text-indigo-400" />
          Filters Panel
        </span>
        <button
          onClick={onReset}
          className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline transition-all cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>

      {/* Row 1: Search + Status + Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className={LABEL_CLASS}>Search Item</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by task name..."
              value={search}
              onChange={handleChange("search")}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white placeholder-white/30 focus:outline-hidden transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={LABEL_CLASS}>Status</label>
          <select value={status} onChange={handleChange("status")} className={SELECT_CLASS}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#18304B] text-white">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className={LABEL_CLASS}>Priority</label>
          <select value={priority} onChange={handleChange("priority")} className={SELECT_CLASS}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#18304B] text-white">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Date range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Start Date From</label>
          <input type="date" value={startDate} onChange={handleChange("startDate")} className={DATE_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Start Date To</label>
          <input type="date" value={endDate} onChange={handleChange("endDate")} className={DATE_CLASS} />
        </div>
      </div>
    </div>
  );
}

