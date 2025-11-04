import { useRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerPopup = ({ value, onChange, onClose, buttonRef }) => {
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

      // Default position: below the button with small gap
      let top = buttonRect.bottom + 4;
      let left = buttonRect.left;

      // Jika popup terlalu ke bawah, posisikan di atas
      if (top + popupRect.height > viewportHeight - 10) {
        top = buttonRect.top - popupRect.height - 4;
      }

      // Jika popup terlalu ke kanan, sesuaikan posisi horizontal
      if (left + popupRect.width > viewportWidth - 10) {
        left = viewportWidth - popupRect.width - 10;
      }

      // Pastikan tidak keluar dari viewport kiri
      if (left < 10) {
        left = 10;
      }

      // Pastikan tidak keluar dari viewport atas/bawah
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

    // Delay sedikit untuk menghindari immediate close saat pertama klik
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
      const formattedDate = date.toISOString().split("T")[0];
      onChange(formattedDate);
      setSelectedDate(date);
    }
    onClose();
  };

  // Sembunyikan sementara sampai posisi dihitung
  if (!isPositioned) {
    return (
      <div className="fixed opacity-0" ref={popupRef}>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          inline
          calendarClassName="shadow-lg border border-gray-200 rounded-lg"
        />
      </div>
    );
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white"
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
        calendarClassName="shadow-lg border border-gray-200 rounded-lg"
      />
    </div>
  );
};

export default DatePickerPopup;
