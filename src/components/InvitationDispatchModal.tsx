import React, { useState } from 'react';
import { useToast } from './GlobalToast';

interface InvitationDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: () => void;
}

export const InvitationDispatchModal: React.FC<InvitationDispatchModalProps> = ({
  isOpen,
  onClose,
  onDispatched,
}) => {
  const { showToast } = useToast();
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setIsDispatched(true);
      showToast('Official email invitations dispatched to 3 suppliers!');
      if (onDispatched) onDispatched();
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[160] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-navy-900 flex justify-between items-center shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <i className="ph-bold ph-envelope-simple-open text-blue-400 text-xl"></i>
            <span>Official Supplier Invitation Dispatch — Restricted Tender</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-navy-800"
          >
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow bg-slate-50 space-y-6">
          {isDispatched && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg shadow-sm flex items-start gap-3 animate-fade-in-down">
              <i className="ph-fill ph-check-circle text-emerald-600 text-xl mt-0.5 shrink-0"></i>
              <p className="text-sm font-semibold text-emerald-900">
                Official invitation emails &amp; secure access links successfully dispatched to 3 pre-qualified suppliers!
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
            <i className="ph-fill ph-info text-blue-600 text-xl mt-0.5 shrink-0"></i>
            <p className="text-xs text-blue-900 font-medium leading-relaxed">
              Suppliers listed below were recommended by Project Owner (<strong className="text-blue-950 font-bold">Rizal Hamdan</strong>) via TRF Requisition. Formal invitations and secure NDA links must be dispatched by Group Procurement to initiate the restricted bidding process.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Supplier Name &amp; PIC</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3 text-right">Invitation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 font-medium">1</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">Apex Tech Solutions Sdn Bhd</div>
                    <div className="text-[10px] text-slate-500">PIC: John Doe</div>
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-mono text-xs">john@apextech-sample.com</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center justify-end gap-1 w-max ml-auto ${
                        isDispatched
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isDispatched ? 'Dispatched (Email Sent)' : 'Pending Dispatch'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 font-medium">2</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">Nexus Digital Systems</div>
                    <div className="text-[10px] text-slate-500">PIC: Jane Smith</div>
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-mono text-xs">jane@nexusdigital-sample.com</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center justify-end gap-1 w-max ml-auto ${
                        isDispatched
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isDispatched ? 'Dispatched (Email Sent)' : 'Pending Dispatch'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 font-medium">3</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">Synergy Software Matrix</div>
                    <div className="text-[10px] text-slate-500">PIC: Alex Tan</div>
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-mono text-xs">alex@synergymatrix-sample.com</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center justify-end gap-1 w-max ml-auto ${
                        isDispatched
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isDispatched ? 'Dispatched (Email Sent)' : 'Pending Dispatch'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDispatching || isDispatched}
            onClick={handleDispatch}
            className={`px-6 py-2 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              isDispatched
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-navy-900 hover:bg-navy-800'
            }`}
          >
            {isDispatching ? (
              <>
                <i className="ph-bold ph-spinner-gap animate-spin"></i>
                <span>Dispatching...</span>
              </>
            ) : isDispatched ? (
              <>
                <i className="ph-bold ph-check-circle"></i>
                <span>Dispatched Successfully</span>
              </>
            ) : (
              <>
                <i className="ph-bold ph-paper-plane-right"></i>
                <span>Dispatch Official Email Invitations</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
