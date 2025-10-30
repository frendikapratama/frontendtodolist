import { useRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerPopup = ({ value, onChange, onClose, buttonRef }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );

  useEffect(() => {
    if (buttonRef.current && popupRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      let top = buttonRect.bottom + 4;
      let left = buttonRect.left;

      if (top + popupRect.height > window.innerHeight) {
        top = buttonRect.top - popupRect.height - 4;
      }
      if (left + popupRect.width > window.innerWidth) {
        left = window.innerWidth - popupRect.width - 8;
      }
      setPosition({ top, left });
    }
  }, [buttonRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, buttonRef]);

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      onChange(formattedDate);
      setSelectedDate(date);
    }
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
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
