import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MENU_WIDTH = 192;
const VIEWPORT_GUTTER = 8;
const MENU_GAP = 6;

const ActionDropdownPortal = ({
  anchorId,
  className,
  children,
  width = MENU_WIDTH,
}) => {
  const [position, setPosition] = useState(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = document.getElementById(anchorId);
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const menuHeight = menuRef.current?.getBoundingClientRect().height || 200;
      const spaceAbove = rect.top - VIEWPORT_GUTTER - MENU_GAP;
      const spaceBelow =
        window.innerHeight - rect.bottom - VIEWPORT_GUTTER - MENU_GAP;
      const openAbove =
        spaceBelow < menuHeight &&
        (spaceAbove >= menuHeight || spaceAbove > spaceBelow);
      const availableHeight = Math.max(80, openAbove ? spaceAbove : spaceBelow);
      const renderedHeight = Math.min(menuHeight, availableHeight);
      const top = openAbove
        ? Math.max(VIEWPORT_GUTTER, rect.top - MENU_GAP - renderedHeight)
        : Math.min(
            rect.bottom + MENU_GAP,
            window.innerHeight - VIEWPORT_GUTTER - renderedHeight,
          );
      const left = Math.min(
        Math.max(VIEWPORT_GUTTER, rect.right - width),
        window.innerWidth - width - VIEWPORT_GUTTER,
      );

      setPosition((current) => {
        if (
          current?.top === top &&
          current?.left === left &&
          current?.maxHeight === availableHeight
        ) {
          return current;
        }
        return { top, left, maxHeight: availableHeight };
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorId, position, width]);

  if (!position) return null;

  return createPortal(
    <div
      ref={menuRef}
      data-action-menu-portal
      className={className}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 1000,
        width: `min(${width}px, calc(100vw - ${VIEWPORT_GUTTER * 2}px))`,
        maxHeight: position.maxHeight,
        overflowY: "auto",
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

export default ActionDropdownPortal;
