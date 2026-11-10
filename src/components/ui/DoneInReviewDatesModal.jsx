import { useState, useEffect } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";

const formatDateForInput = (dateVal) => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

const DoneInReviewDatesModal = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  type = "Task",
  isLoading = false,
}) => {
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen && item) {
      setStartDate(formatDateForInput(item.start_date));
      setDueDate(formatDateForInput(item.due_date));
      setFinishDate(formatDateForInput(item.finish_date));
      setErrorMessage("");
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !dueDate || !finishDate) {
      setErrorMessage(
        "All dates (Start Date, Due Date, and Finish Date) must be filled in before changing the status to Done-In review.",
      );
      return;
    }

    setErrorMessage("");
    onSubmit({
      startDate,
      dueDate,
      finishDate,
    });
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 leading-tight">
                Complete Dates {type}
              </h3>
              <p className="text-xs text-gray-500">
                Required for status{" "}
                <span className="font-semibold text-teal-700">
                  Done-In review
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Item Name */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[0.7em] font-semibold text-gray-400 uppercase tracking-wider block">
              {type} Name
            </span>
            <p className="text-sm font-medium text-gray-800 line-clamp-2">
              {item.nama || "Tanpa Nama"}
            </p>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Before changing the status to <strong>Done-In review</strong>, you
              must complete the <strong>Start Date</strong>,{" "}
              <strong>Due Date</strong>, and <strong>Finish Date</strong>.
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Date Inputs */}
          <div className="space-y-3.5 pt-1">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs"
                required
              />
            </div>

            {/* Finish Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Finish Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={finishDate}
                onChange={(e) => setFinishDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Save & Change Status"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoneInReviewDatesModal;
