import { useRef, useEffect, useState } from "react";

const PopupSelect = ({ value, options, onChange, onClose, buttonRef }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
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

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => {
            onChange(option);
            onClose();
          }}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
            value === option
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-700"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default PopupSelect;
