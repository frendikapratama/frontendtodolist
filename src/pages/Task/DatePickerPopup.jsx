import { useRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerPopup = ({
  value,
  onChange,
  onClose,
  buttonRef,
  showTimeSelect = false,
}) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (buttonRef?.current && popupRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = buttonRect.bottom + 4;
      let left = buttonRect.left;

      if (top + popupRect.height > viewportHeight - 10) {
        top = buttonRect.top - popupRect.height - 4;
      }

      if (left + popupRect.width > viewportWidth - 10) {
        left = viewportWidth - popupRect.width - 10;
      }

      if (left < 10) {
        left = 10;
      }

      if (top < 10) {
        top = 10;
      } else if (top + popupRect.height > viewportHeight - 10) {
        top = viewportHeight - popupRect.height - 10;
      }

      setPosition({ top, left });
      setIsPositioned(true);
    }
  }, [buttonRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, buttonRef]);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      // Jika showTimeSelect false, langsung close dan save
      if (!showTimeSelect) {
        // Format tanpa timezone conversion: YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        onChange(formattedDate);
        onClose();
      }
    }
  };

  const handleTimeConfirm = () => {
    if (selectedDate) {
      // Kirim dalam format ISO lengkap dengan waktu
      onChange(selectedDate.toISOString());
      onClose();
    }
  };

  if (!isPositioned) {
    return (
      <div className="fixed opacity-0" ref={popupRef}>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          inline
          showTimeSelect={showTimeSelect}
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat={showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
          calendarClassName="shadow-lg border border-gray-200 rounded-lg"
        />
      </div>
    );
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white rounded-lg "
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      }}
    >
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        inline
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat={showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
        calendarClassName="shadow-lg border border-gray-200 rounded-lg"
      />

      {/* GANTI bagian ini */}
      {showTimeSelect ? (
        <div className="px-4 pb-3 flex gap-2 justify-between border-t border-gray-200 pt-2">
          <button
            onClick={() => {
              onChange(null);
              onClose();
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Clear date
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleTimeConfirm}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-3 border-t border-gray-200 pt-2">
          <button
            onClick={() => {
              onChange(null);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear date
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePickerPopup;
