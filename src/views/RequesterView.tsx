import React, { useState } from 'react';
import { TrfDrawer } from '../components/TrfDrawer';
import { ReqQaDrawer } from '../components/ReqQaDrawer';
import { useToast } from '../components/GlobalToast';

export const RequesterView: React.FC = () => {
  const { showToast } = useToast();
  const [isTrfOpen, setIsTrfOpen] = useState(false);
  const [isReqQaOpen, setIsReqQaOpen] = useState(false);
  const [isQaAnswered, setIsQaAnswered] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
          <i className="ph-fill ph-user-focus text-blue-600"></i>
          <span>Project Owner Dashboard</span>
        </h2>
        <button
          type="button"
          onClick={() => setIsTrfOpen(true)}
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <i className="ph-bold ph-plus"></i>
          <span>Create New TRF Requisition</span>
        </button>
      </div>

      {/* Requester Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">My Requisitions (TRF)</p>
            <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <i className="ph-fill ph-file-text text-xl"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">Pending Endorsements</p>
            <p className="text-2xl font-bold text-slate-900">1</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <i className="ph-fill ph-hourglass-high text-xl"></i>
          </div>
        </div>

        {/* Highlighted Q&A */}
        <div className="bg-white rounded-xl shadow-md border-2 border-mpRed p-5 flex items-center justify-between ring-4 ring-red-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-100 to-transparent -z-10 rounded-bl-full"></div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-red-600 mb-1">Technical Q&amp;A</p>
            <p className="text-2xl font-bold text-slate-900">
              {isQaAnswered ? 0 : 1}
              {!isQaAnswered && (
                <span className="text-[10px] text-red-500 font-bold ml-1 uppercase">Pending Answer</span>
              )}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 text-mpRed flex items-center justify-center animate-pulse">
            <i className="ph-fill ph-chats-circle text-xl"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">Approved Projects</p>
            <p className="text-2xl font-bold text-emerald-700">2</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i className="ph-fill ph-check-circle text-xl"></i>
          </div>
        </div>
      </div>

      {/* Requisition Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-12">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <i className="ph-fill ph-kanban text-navy-800"></i>
            <span>Requisition &amp; Technical Management</span>
          </h2>
        </div>
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Requisition ID &amp; Project</th>
                <th className="px-4 py-3 whitespace-nowrap">Budget Code</th>
                <th className="px-4 py-3 whitespace-nowrap">Date Submitted</th>
                <th className="px-4 py-3 whitespace-nowrap">Workflow Status</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900 text-xs">MP-CDU-2026-999</div>
                  <div className="text-[11px] text-slate-500 truncate w-48">
                    CORE ERP SYSTEM MODERNIZATION
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">MP/CDU/CAPEX/2026/999</td>
                <td className="px-4 py-3 text-xs text-slate-500">10 Aug 2026</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded flex items-center gap-1 w-fit">
                    <i className="ph-fill ph-spinner-gap animate-spin"></i> Pending Procurement Verification
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => showToast('Displaying Requisition dossier MP-CDU-2026-999...')}
                    className="px-2.5 py-1.5 text-[10px] font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded shadow-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <i className="ph-bold ph-eye text-sm"></i> View Details
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900 text-xs">MP-CDU-2026-888</div>
                  <div className="text-[11px] text-slate-500 truncate w-48">
                    Digital Asset Management Integration
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">MP/CDU/OPEX/2026/102</td>
                <td className="px-4 py-3 text-xs text-slate-500">01 Aug 2026</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded flex items-center gap-1 w-fit">
                    <i className="ph-fill ph-check-circle"></i> Active Bidding
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {!isQaAnswered ? (
                    <button
                      type="button"
                      onClick={() => setIsReqQaOpen(true)}
                      className="px-2.5 py-1.5 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded shadow-xs inline-flex items-center gap-1 animate-pulse cursor-pointer"
                    >
                      <i className="ph-bold ph-chats-circle text-sm"></i>
                      <span>Answer Technical Q&amp;A</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsReqQaOpen(true)}
                      className="px-2.5 py-1.5 text-[10px] font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded shadow-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <i className="ph-bold ph-eye text-sm"></i>
                      <span>View Q&amp;A Details</span>
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TRF Drawer */}
      <TrfDrawer isOpen={isTrfOpen} onClose={() => setIsTrfOpen(false)} />

      {/* SME Q&A Drawer */}
      <ReqQaDrawer
        isOpen={isReqQaOpen}
        onClose={() => setIsReqQaOpen(false)}
        onAnswerPublished={() => setIsQaAnswered(true)}
      />
    </div>
  );
};
