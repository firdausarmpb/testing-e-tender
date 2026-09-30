import React from 'react';
import { useTender } from '../context/TenderContext';
import { useToast } from './GlobalToast';
import { exportCommercialMatrixCsv, exportEvaluationReportPdf } from '../utils/exportUtils';

interface CommercialMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId?: string;
}

export const CommercialMatrixModal: React.FC<CommercialMatrixModalProps> = ({
  isOpen,
  onClose,
  tenderId = 'MP-ENG-2026-042',
}) => {
  const { tenders, bids } = useTender();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const targetTender = tenders.find((t) => t.id === tenderId) || tenders[1] || tenders[0];
  const tenderBids = bids[targetTender.id] || [];
  const sortedBids = [...tenderBids].sort((a, b) => a.grandTotal - b.grandTotal);

  const lowestBid = sortedBids[0];
  const highestBid = sortedBids[sortedBids.length - 1];
  const avgBid =
    sortedBids.length > 0
      ? sortedBids.reduce((sum, b) => sum + b.grandTotal, 0) / sortedBids.length
      : 267000;

  const handleExportCsv = () => {
    exportCommercialMatrixCsv(targetTender, sortedBids);
    showToast('Exporting Commercial Comparison Matrix to Excel (.csv)...');
  };

  const handleExportPdf = () => {
    exportEvaluationReportPdf(targetTender, sortedBids);
    showToast('Generating official Tender Evaluation Report PDF...');
  };

  return (
    <div className="fixed inset-0 z-[170] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-navy-900 flex justify-between items-center shrink-0">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <i className="ph-bold ph-table text-emerald-400 text-xl"></i>
            <span>
              Commercial Evaluation Matrix — Line-by-Line Price Comparison ({targetTender.referenceNo})
            </span>
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
          {/* Audit Banner */}
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

          {/* Matrix Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 w-64 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                    Item No &amp; BOQ Description
                  </th>
                  <th className="px-3 py-3 w-16 text-center border-r border-slate-200">Qty</th>

                  {sortedBids.map((b, idx) => {
                    const isLowest = idx === 0;
                    return (
                      <th
                        key={b.id}
                        className={`px-4 py-3 text-right border-r border-slate-200 align-top ${
                          isLowest ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''
                        }`}
                      >
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="font-bold text-slate-900">
                            Bidder {idx + 1}: {b.companyName.split(' ')[0]} {b.companyName.split(' ')[1] || ''}
                          </span>
                          {isLowest && (
                            <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              Lowest Compliant
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              showToast(`Downloading Official Commercial Proposal PDF for ${b.companyName}...`)
                            }
                            className={`mt-1 bg-white border py-1 px-2 rounded shadow-xs text-[9px] font-bold transition-colors ${
                              isLowest
                                ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            📥 Download Official PDF / BOM
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {targetTender.bqItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-semibold text-slate-800">
                      {item.itemNumber}. {item.description}
                    </td>
                    <td className="px-3 py-3 text-center border-r border-slate-200 text-slate-500 font-mono">
                      {item.quantity}
                    </td>
                    {sortedBids.map((b, idx) => {
                      const entry = b.bqEntries.find((e) => e.itemId === item.id);
                      const amount = entry ? entry.totalAmount : 0;
                      const isLowest = idx === 0;

                      return (
                        <td
                          key={b.id}
                          className={`px-4 py-3 text-right font-mono border-r border-slate-200 ${
                            isLowest ? 'bg-emerald-50/50 text-emerald-950 font-bold' : ''
                          }`}
                        >
                          {amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-200 text-slate-800">
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-2 text-right font-bold text-xs sticky left-0 bg-slate-100 z-10 border-r border-slate-200"
                  >
                    Subtotal
                  </td>
                  {sortedBids.map((b, idx) => (
                    <td
                      key={b.id}
                      className={`px-4 py-2 text-right font-mono font-bold border-r border-slate-200 ${
                        idx === 0 ? 'bg-emerald-100/50' : ''
                      }`}
                    >
                      {b.subtotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-2 text-right font-bold text-xs sticky left-0 bg-slate-100 z-10 border-r border-slate-200"
                  >
                    SST (6%)
                  </td>
                  {sortedBids.map((b, idx) => (
                    <td
                      key={b.id}
                      className={`px-4 py-2 text-right font-mono text-slate-600 border-r border-slate-200 ${
                        idx === 0 ? 'bg-emerald-100/50' : ''
                      }`}
                    >
                      {b.sstAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-200">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-right font-black text-navy-900 uppercase tracking-wider text-xs sticky left-0 bg-slate-200 z-10 border-r border-slate-300"
                  >
                    Grand Total Bid Value (MYR)
                  </td>
                  {sortedBids.map((b, idx) => (
                    <td
                      key={b.id}
                      className={`px-4 py-3 text-right font-mono font-black border-r border-slate-300 ${
                        idx === 0
                          ? 'text-emerald-700 text-sm bg-emerald-200'
                          : 'text-navy-900 text-sm'
                      }`}
                    >
                      {b.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Commercial Summary Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Lowest Bid</p>
                <p className="text-lg font-black text-emerald-700 font-mono">
                  RM {lowestBid ? lowestBid.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 }) : '258,000.00'}
                </p>
                <p className="text-[10px] font-medium text-slate-600">
                  {lowestBid ? lowestBid.companyName : 'Nexus Digital Systems'}
                </p>
              </div>
              <div className="w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Highest Bid</p>
                <p className="text-lg font-bold text-slate-800 font-mono">
                  RM {highestBid ? highestBid.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 }) : '280,000.00'}
                </p>
                <p className="text-[10px] font-medium text-slate-600">
                  {highestBid ? highestBid.companyName : 'Vanguard Broadcast Tech'}
                </p>
              </div>
              <div className="w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Average Bid</p>
                <p className="text-lg font-bold text-blue-700 font-mono">
                  RM {avgBid.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] font-medium text-slate-600">
                  Across {sortedBids.length} Valid Submissions
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <i className="ph-bold ph-microsoft-excel-logo text-green-600 text-base"></i>
                <span>Export to Excel</span>
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-5 py-2.5 bg-navy-900 text-white hover:bg-navy-800 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <i className="ph-bold ph-file-pdf text-red-400 text-base"></i>
                <span>Generate Eval Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
