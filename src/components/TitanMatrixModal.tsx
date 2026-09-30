import React from 'react';
import { useToast } from './GlobalToast';

interface TitanMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TitanMatrixModal: React.FC<TitanMatrixModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[175] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-navy-900 flex justify-between items-center shrink-0">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <i className="ph-bold ph-table text-purple-400 text-xl"></i>
            <span>Phased Advisory Comparison View (Project Titan) — MP-STR-2026-015</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-navy-800"
          >
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3 shadow-sm">
            <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 shrink-0 mt-0.5">
              <i className="ph-bold ph-shield-check text-lg"></i>
            </div>
            <div>
              <p className="text-emerald-900 font-bold text-sm">
                Governance Clearance Verified by Internal Audit Dept (Clearing Ref: GOV-2026-AUD88)
              </p>
              <p className="text-emerald-700 text-xs mt-0.5">
                Commercial proposals unlocked &amp; decrypted upon GCGRI clearance on Aug 20, 2026 at 10:00 AM MYT.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 w-64 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                    Evaluation Scope / Milestones
                  </th>
                  <th className="px-4 py-3 text-right bg-purple-50 text-purple-800 border-r border-purple-200 align-top">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-bold text-slate-900">Bidder 1: Investment Bank A</span>
                      <button
                        type="button"
                        onClick={() =>
                          showToast('Downloading Official Signed Fee Proposal (PDF) for Investment Bank A...')
                        }
                        className="mt-1 bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 py-1 px-2 rounded shadow-xs text-[9px] font-bold transition-colors"
                      >
                        📥 Download Official Signed Fee Proposal (PDF)
                      </button>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right border-r border-slate-200 align-top">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-bold text-slate-900">Bidder 2: Investment Bank B</span>
                      <button
                        type="button"
                        onClick={() =>
                          showToast('Downloading Official Signed Fee Proposal (PDF) for Investment Bank B...')
                        }
                        className="mt-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 py-1 px-2 rounded shadow-xs text-[9px] font-bold transition-colors"
                      >
                        📥 Download Official Signed Fee Proposal (PDF)
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-semibold text-slate-800">
                    Phase 1: Strategic Assessment &amp; Option Evaluation
                  </td>
                  <td className="px-4 py-3 text-right bg-purple-50/50 border-r border-slate-200 font-mono">
                    150,000.00
                  </td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-mono">
                    400,000.00
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-semibold text-slate-800">
                    Phase 2: Execution &amp; Advisory Fee
                  </td>
                  <td className="px-4 py-3 text-right bg-purple-50/50 border-r border-slate-200 font-mono">
                    650,000.00
                  </td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-mono">
                    450,000.00
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-semibold text-slate-800">
                    Milestone / Success Fee (Conditional)
                  </td>
                  <td className="px-4 py-3 text-right bg-purple-50/50 border-r border-slate-200 font-mono">
                    Optional
                  </td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-mono">
                    150,000.00
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-semibold text-slate-800">
                    Estimated Out-of-Pocket Expenses
                  </td>
                  <td className="px-4 py-3 text-right bg-purple-50/50 border-r border-slate-200 font-mono">
                    Capped RM 20,000.00
                  </td>
                  <td className="px-4 py-3 text-right border-r border-slate-200 font-mono">
                    At Cost
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => showToast('Exporting Project Titan advisory matrix to Excel...')}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <i className="ph-bold ph-microsoft-excel-logo text-green-600 text-base"></i>
              <span>Export to Excel</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Generating official Project Titan Evaluation PDF report...')}
              className="px-5 py-2.5 bg-navy-900 text-white hover:bg-navy-800 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <i className="ph-bold ph-file-pdf text-red-400 text-base"></i>
              <span>Generate Eval Report (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
