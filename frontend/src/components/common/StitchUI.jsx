import React from 'react';
import { Shield, ChevronRight, Check } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  badge,
  badgeType = 'default',
  subtext,
  icon: Icon,
  trend,
  className = '',
}) => {
  const badgeStyles = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </span>
            {badge && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeStyles[badgeType] || badgeStyles.default}`}>
                {badge}
              </span>
            )}
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtext}</span>
          {trend && (
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const StatusPill = ({ status, text }) => {
  const s = (status || '').toLowerCase();

  let style = 'bg-slate-100 text-slate-600';
  let dotColor = 'bg-slate-400';

  if (s.includes('active') || s.includes('live') || s.includes('completed') || s.includes('honors')) {
    style = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
    dotColor = 'bg-indigo-600';
  } else if (s.includes('progress') || s.includes('pending') || s.includes('deliberation')) {
    style = 'bg-amber-50 text-amber-700 border border-amber-100';
    dotColor = 'bg-amber-500';
  } else if (s.includes('upcoming') || s.includes('standby') || s.includes('scheduled')) {
    style = 'bg-slate-100 text-slate-600';
    dotColor = 'bg-slate-400';
  } else if (s.includes('archived') || s.includes('closed')) {
    style = 'bg-slate-100 text-slate-500';
    dotColor = 'bg-slate-400';
  } else if (s.includes('absent') || s.includes('failed') || s.includes('unpaid')) {
    style = 'bg-rose-50 text-rose-700 border border-rose-100';
    dotColor = 'bg-rose-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {text || status}
    </span>
  );
};

export const ProtocolBanner = ({
  title,
  description,
  buttonText = 'Read Protocol',
  onAction,
  icon = Shield,
  badgeText = 'STANDARD POLICY',
}) => {
  const Icon = icon;
  return (
    <div className="bg-indigo-50/40 rounded-xl border border-indigo-100/80 p-4 lg:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            {badgeText && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-3xl">
            {description}
          </p>
        </div>
      </div>
      {buttonText && (
        <button
          onClick={onAction}
          className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export const ToggleSwitch = ({ checked, onChange, label, disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
        checked ? 'bg-indigo-600' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-xs ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
};

export const BreadcrumbNav = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
          <span className={index === items.length - 1 ? 'text-slate-700 font-semibold' : 'hover:text-slate-600'}>
            {item}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};
