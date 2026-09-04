import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

export default function ActionMenu({ label = "Actions", items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="action-menu" ref={menuRef}>
      <button
        type="button"
        className="btn btn-ghost btn-sm action-menu-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={label}
      >
        <MoreHorizontal size={16} />
        {label && label !== "Actions" && label !== "Manage" && (
          <span style={{ marginLeft: "0.25rem" }}>{label}</span>
        )}
      </button>

      {isOpen && (
        <div className="action-menu-panel" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`action-menu-item${item.danger ? " is-danger" : ""}`}
              onClick={(e) => {
                setIsOpen(false);
                item.onClick(e);
              }}
              role="menuitem"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
