import { RefreshCw, Download, ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GroupReportHeader({
  groupName,
  projectId,
  isLoading,
  isExporting,
  onRefresh,
  onExport,
}) {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 bg-white/5 backdrop-blur-xs border  rounded-xl p-6  border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        {/* Back button */}
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-3 transition-all"
        >
          <ArrowLeft size={14} />
          Back to Project
        </button>

        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300">
            <BarChart3 size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
              Group Report
            </h1>
            <p className="text-white/60 text-sm mt-0.5">
              {groupName ? (
                <>
                  Detailed report for group:{" "}
                  <span className="text-indigo-300 font-semibold">
                    {groupName}
                  </span>
                </>
              ) : (
                "Loading group data..."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-95"
          title="Refresh Report Data"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>

        <button
          onClick={onExport}
          disabled={isExporting || isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download size={16} />
          {isExporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>
    </div>
  );
}
