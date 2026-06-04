import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PopupSelect = ({ value, options, onChange, onClose, buttonRef }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState(null); 
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const estimatedPopupHeight = options.length * 40 + 8;
      const estimatedPopupWidth = 200;

      let top = buttonRect.bottom + 4;
      let left = buttonRect.left;
      if (top + estimatedPopupHeight > window.innerHeight) {
        top = buttonRect.top - estimatedPopupHeight - 4;
      }
      if (left + estimatedPopupWidth > window.innerWidth) {
        left = window.innerWidth - estimatedPopupWidth - 8;
      }
      if (left < 8) {
        left = 8;
      }

      setPosition({ top, left });
      setIsPositioned(true);
    }
  }, [buttonRef, options.length]);

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
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, buttonRef]);
  if (!isPositioned || !position) {
    return null;
  }

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-100 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '300px',
        overflowY: 'auto'
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => {
            onChange(option);
            onClose();
          }}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition whitespace-nowrap ${value === option
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-700"
            }`}
        >
          {option}
        </button>
      ))}
    </div>,
    document.body
  );
};

export default PopupSelect;