import React from 'react';

export const BrandLogo = ({ subtitle = 'H-School', size = 'default', showBadge = true, role = 'School Admin' }) => {
  const isLarge = size === 'large';

  return (
    <div className="flex items-center gap-3">
      {/* H-School Icon */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-black shadow-md shadow-indigo-500/20 ${isLarge ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-xl'}`}>
        <span className="tracking-tighter">H</span>
        {/* Yellow Dot accent matching Stitch logo */}
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight text-slate-900 ${isLarge ? 'text-xl' : 'text-base'}`}>
            H-SCHOOL
          </span>
          {showBadge && role && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {role}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
