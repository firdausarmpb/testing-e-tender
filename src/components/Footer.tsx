import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.02)] mt-space-xl border-t border-outline-variant/30">
      <div className="w-full px-margin py-space-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-space-lg text-on-surface-variant font-body-sm text-body-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-label-md font-bold text-on-surface">Media Prima Berhad</span>
            <span className="text-outline-variant">•</span>
            <span>Registration No. 200001024235 (531841-K)</span>
          </div>
          <p className="text-on-surface-variant text-[12px]">
            © 2025 Media Prima Digital e-Procurement Division. All rights reserved. Sri Pentas, Bandar Utama, 47800 Petaling Jaya, Selangor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-md">
          <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant/30 shadow-xs">
            <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
            <span className="font-label-sm font-semibold text-on-surface">
              ISO/IEC 27001 Certified • High Integrity Portal
            </span>
          </div>

          <div className="flex items-center gap-1 text-on-surface-variant text-[12px]">
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>
              Procurement Helpdesk: <strong className="text-on-surface">etender-support@mediaprima.com.my</strong> | +603-7726 6333
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
