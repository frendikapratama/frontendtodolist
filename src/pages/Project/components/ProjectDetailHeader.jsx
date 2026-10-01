import {
  ArrowLeft,
  FileText,
  Receipt,
  Coins,
  Wallet,
  Edit3,
} from "lucide-react";
import { PROJECT_DETAIL_STATUS_MAP } from "../projectDetailConstants";

const TAB_CONFIG = [
  {
    key: "overview",
    label: "Overview",
    icon: FileText,
    activeClass: "text-slate-900",
  },
  {
    key: "boq",
    label: "BOQ",
    icon: Receipt,
    activeClass: "text-slate-900",
  },
  {
    key: "budget",
    label: "Budget",
    icon: Coins,
    activeClass: "text-slate-900",
  },
  {
    key: "cost",
    label: "Cost",
    icon: Wallet,
    activeClass: " text-slate-900 ",
  },
];

const ProjectDetailHeader = ({
  project,
  activeTab,
  onTabChange,
  onBack,
  onEditClick,
}) => {
  const statusConfig = PROJECT_DETAIL_STATUS_MAP[
    project?.status?.toLowerCase()
  ] || {
    style: "bg-slate-100 text-slate-600 border-slate-200",
    label: project?.status || "Draft",
  };

  return (
    <>
      {/* HERO / HEADER SECTION */}
      <div className=" border-b border-cyan-500 py-2 px-3 sm:px-3 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Project Identity */}
        <div className="flex items-start sm:items-center gap-4">
          {/* TOP NAVIGATION / BREADCRUMB */}
          <button
            type="button"
            onClick={onBack}
            className=" text-xsfont-medium text-white cursor-pointer "
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1
                className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {project?.nama}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.style}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS & TAB SWITCHER */}
        <div className="flex flex-wrap gap-3">
          {/* TABS NAVIGATION */}
          <div className="flex p-1 text-xs overflow-x-auto max-w-full">
            {TAB_CONFIG.map(({ key, label, icon: Icon, activeClass }) => (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`px-3.5 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === key
                    ? activeClass
                    : "text-white hover:text-blue-500 "
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onEditClick}
            className="  text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Proyek</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailHeader;
