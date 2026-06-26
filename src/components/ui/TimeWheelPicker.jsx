import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");

const SLOT_START_HOUR = 7;
const SLOT_END_HOUR = 20;

const HOURS = Array.from(
  { length: SLOT_END_HOUR - SLOT_START_HOUR + 1 },
  (_, i) => pad(SLOT_START_HOUR + i),
);
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

const TimeWheelPicker = ({ value, onChange, placeholder = "Select time" }) => {
  const [open, setOpen] = useState(false);
  const [tempHour, setTempHour] = useState(HOURS[0]);
  const [tempMinute, setTempMinute] = useState(MINUTES[0]);
  const containerRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const scrollToValue = (listEl, val) => {
    if (!listEl) return;
    const el = listEl.querySelector(`[data-value="${val}"]`);
    el?.scrollIntoView({ block: "center" });
  };

  const openPicker = () => {
    const [h, m] = value ? value.split(":") : [HOURS[0], MINUTES[0]];
    setTempHour(h);
    setTempMinute(m);
    setOpen(true);
    requestAnimationFrame(() => {
      scrollToValue(hourListRef.current, h);
      scrollToValue(minuteListRef.current, m);
    });
  };

  const handleSelectHour = (h) => {
    setTempHour(h);
    scrollToValue(hourListRef.current, h);
  };

  const handleSelectMinute = (m) => {
    setTempMinute(m);
    scrollToValue(minuteListRef.current, m);
  };

  const handleNow = () => {
    const now = new Date();
    let h = pad(now.getHours());
    const m = pad(now.getMinutes());
    if (!HOURS.includes(h)) {
      h = now.getHours() < SLOT_START_HOUR ? HOURS[0] : HOURS[HOURS.length - 1];
    }
    onChange(`${h}:${m}`);
    setOpen(false);
  };

  const handleOk = () => {
    onChange(`${tempHour}:${tempMinute}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="input input-bordered w-full bg-black/60 text-white flex items-center justify-between"
      >
        <span className={value ? "text-white" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <Clock size={16} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex divide-x divide-white/10">
            <div
              ref={hourListRef}
              className="h-32 w-1/2 overflow-y-auto py-5 snap-y snap-mandatory scroll-smooth"
            >
              {HOURS.map((h) => (
                <button
                  type="button"
                  key={h}
                  data-value={h}
                  onClick={() => handleSelectHour(h)}
                  className={`w-full text-center py-1.5 text-xs snap-center transition-colors ${
                    tempHour === h
                      ? "bg-blue-500/20 text-blue-300 font-semibold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div
              ref={minuteListRef}
              className="h-36 w-1/2 overflow-y-auto py-5 snap-y snap-mandatory scroll-smooth"
            >
              {MINUTES.map((m) => (
                <button
                  type="button"
                  key={m}
                  data-value={m}
                  onClick={() => handleSelectMinute(m)}
                  className={`w-full text-center py-1.5 text-xs snap-center transition-colors ${
                    tempMinute === m
                      ? "bg-blue-500/20 text-blue-300 font-semibold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-1 border-t border-white/10">
            <button
              type="button"
              onClick={handleNow}
              className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer"
            >
              Now
            </button>
            <button
              type="button"
              onClick={handleOk}
              className="btn btn-primary btn-xs cursor-pointer"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeWheelPicker;
