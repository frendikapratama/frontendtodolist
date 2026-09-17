import React from "react";

/**
 * Reusable summary/metric card.
 * @param {{ icon: React.ElementType, iconBg, iconColor, iconBorder, title, value, subtitle }} props
 */
const SummaryCard = React.memo(
  ({ icon: Icon, iconBg, iconColor, iconBorder, title, value, subtitle, children }) => {
    return (
      <div className="bg-slate-950/60 rounded-2xl p-5 border border-white/10 shadow-sm flex items-center justify-between backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          {children ? (
            <div className="mt-1">{children}</div>
          ) : (
            <h3 className="text-xl font-bold text-slate-100 mt-1">{value}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconBg} ${iconColor} ${iconBorder}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    );
  }
);

SummaryCard.displayName = "SummaryCard";

export default SummaryCard;
