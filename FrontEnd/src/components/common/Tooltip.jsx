import React, { useState } from "react";

export default function Tooltip({ text, children, position = "top", className = "" }) {
  const [visible, setVisible] = useState(false);

  if (!text) return children;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-[#132d4b] border-x-transparent border-b-transparent border-t-4",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[#132d4b] border-x-transparent border-t-transparent border-b-4",
    left: "left-full top-1/2 -translate-y-1/2 border-l-[#132d4b] border-y-transparent border-r-transparent border-l-4",
    right: "right-full top-1/2 -translate-y-1/2 border-r-[#132d4b] border-y-transparent border-l-transparent border-r-4",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1 text-xs font-medium text-slate-100 bg-[#132d4b] border border-blue-500/30 rounded-md shadow-xl whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 ${positionClasses[position]}`}
        >
          {text}
          <div className={`absolute w-0 h-0 border-solid border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}

