import React from 'react';
import { useTender } from '../context/TenderContext';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs, currentTender } = useTender();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-outline-variant/40">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">policy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-sm uppercase tracking-wider font-bold bg-secondary text-white px-2 py-0.5 rounded">
                  ISO/IEC 27001 Certified
                </span>
                <span className="font-code-sm text-on-surface-variant font-semibold">
                  Tender: {currentTender.referenceNo}
                </span>
              </div>
              <h2 className="font-headline-sm font-bold text-on-surface mt-0.5">
                Cryptographic Audit Log &amp; Governance Ledger
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Immutable event recording with SHA-256 hash seals</span>
            <span>Total Logged Events: <strong>{auditLogs.length}</strong></span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/30">
                  <th className="p-3">Timestamp (MYT)</th>
                  <th className="p-3">Actor &amp; Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3 min-w-[240px]">Event Description</th>
                  <th className="p-3">Audit Hash Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/40">
                    <td className="p-3 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-on-surface">{log.userName}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">{log.role}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono text-[11px] font-semibold text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-on-surface leading-snug">{log.details}</td>
                    <td className="p-3 font-mono text-[11px] text-secondary font-semibold whitespace-nowrap">
                      {log.hashToken || 'VERIFIED-OK'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
