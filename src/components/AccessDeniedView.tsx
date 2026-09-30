import React from 'react';
import { useTender } from '../context/TenderContext';
import { getPrimaryRole } from '../types/tender';

interface AccessDeniedViewProps {
  attemptedTab?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedTab }) => {
  const { currentUser, setActiveNavTab } = useTender();
  const primaryRole = getPrimaryRole(currentUser.role);

  const getRoleBadge = () => {
    switch (primaryRole) {
      case 'vendor':
        return {
          title: 'Supplier / Vendor',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          allowedText: 'Permitted Access: Published Tenders, Two-Envelope Sealed Bidding & Clarification Q&A Desk.',
          returnTab: 'active-tenders' as const,
          returnLabel: 'Return to Active Tenders',
        };
      case 'governance':
        return {
          title: 'Governance & Internal Audit',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          allowedText: 'Permitted Access: Cryptographic Integrity Auditing & Bid Unsealing Clearance.',
          returnTab: 'governance-audit' as const,
          returnLabel: 'Return to Audit Portal',
        };
      case 'procurement':
        return {
          title: 'Group Procurement Division',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          allowedText: 'Permitted Access: Commercial Matrix, Tender Management, Create Tender & Addendum Publishing.',
          returnTab: 'procurement-admin' as const,
          returnLabel: 'Return to Commercial Matrix',
        };
      default:
        return {
          title: currentUser.role,
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          allowedText: 'Restricted role access.',
          returnTab: 'active-tenders' as const,
          returnLabel: 'Return to Main Dashboard',
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="w-full flex-1 flex items-center justify-center p-6 bg-slate-100/70 min-h-[70vh]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center flex flex-col items-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 shadow-inner">
          <span className="material-symbols-outlined text-[36px]">shield_lock</span>
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-3 bg-red-100 text-red-700 border border-red-200">
          Access Restricted • RBAC Policy
        </span>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Role-Restricted View
        </h2>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          You are currently signed in as <span className="font-semibold text-slate-900">{currentUser.name}</span> from <span className="font-medium text-slate-800">{currentUser.companyName}</span>.
        </p>

        {/* Role Pill */}
        <div className={`w-full p-3.5 rounded-xl border text-xs font-medium mb-5 text-left flex items-start gap-2.5 ${roleInfo.bg}`}>
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
          <div>
            <div className="font-bold">Current Assigned Role: {roleInfo.title}</div>
            <div className="text-[11px] mt-0.5 opacity-90">{roleInfo.allowedText}</div>
          </div>
        </div>

        {attemptedTab && (
          <p className="text-[11px] text-slate-400 mb-5">
            Attempted access: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono text-[10px]">{attemptedTab}</code>
          </p>
        )}

        <button
          type="button"
          onClick={() => setActiveNavTab(roleInfo.returnTab)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0037b0] hover:bg-[#002b8a] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>{roleInfo.returnLabel}</span>
        </button>
      </div>
    </div>
  );
};
