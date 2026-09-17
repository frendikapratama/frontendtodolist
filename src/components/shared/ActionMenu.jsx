import React, { useRef, useEffect, useState, useCallback } from "react";
import { MoreVertical } from "lucide-react";

/**
 * Reusable action menu (⋮ dropdown) component.
 * @param {{ items: Array<{ label, icon, onClick, className?, divider? }> }} props
 */
const ActionMenu = React.memo(({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleItemClick = useCallback(
    (e, item) => {
      e.stopPropagation();
      setIsOpen(false);
      item.onClick?.();
    },
    []
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        title="Aksi"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl py-1 min-w-[160px] z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {items.map((item, i) => {
            if (item.divider) {
              return (
                <div key={`div-${i}`} className="border-t border-white/5 my-1" />
              );
            }

            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={(e) => handleItemClick(e, item)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  item.className ||
                  "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

ActionMenu.displayName = "ActionMenu";

export default ActionMenu;
