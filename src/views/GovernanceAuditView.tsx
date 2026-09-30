import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { useToast } from '../components/GlobalToast';
import { PdfViewerModal } from '../components/PdfViewerModal';

export const GovernanceAuditView: React.FC = () => {
  const {
    currentTenderId,
    setCurrentTenderId,
    tenders,
    bids,
    verifyBid,
    verifyAllBids,
    releaseTenderToProcurement,
    setActiveNavTab,
  } = useTender();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [activePdfModal, setActivePdfModal] = useState<{
    isOpen: boolean;
    fileName: string;
    fileTitle?: string;
  }>({ isOpen: false, fileName: '' });

  // Get active tender (default to MP-IT-2026-001)
  const tender = tenders.find((t) => t.id === currentTenderId) || tenders[0];
  const tenderBids = bids[tender.id] || [];

  const isReleased = tender.status === 'Released' || tender.status === 'Awarded';
  const totalBids = tenderBids.length;
  const verifiedCount = tenderBids.filter((b) => b.isAuditVerified).length;
  const allVerified = totalBids > 0 && verifiedCount === totalBids;

  const sampleTenderIds = ['MP-IT-2026-001', 'MP-ENG-2026-042', 'MP-BC-2026-008', 'MP-STR-2026-015'];

  const handleVerifyToggle = (bidId: string, currentStatus: boolean) => {
    verifyBid(bidId, !currentStatus, !currentStatus ? 'Verified 100% compliant with Technical & MOF parameters by Internal Audit.' : undefined);
    showToast(!currentStatus ? 'Bidder submission marked as verified compliant.' : 'Verification removed.');
  };

  const handleVerifyAll = () => {
    verifyAllBids(tender.id);
    showToast(`All (${totalBids}) submitted bids for this tender verified successfully!`);
  };

  const handleGrantClearance = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      releaseTenderToProcurement(tender.id);
      showToast('Governance clearance granted! Commercial envelope data unsealed for Procurement.');
    }, 900);
  };

  return (
    <div className="flex-grow w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Sample Tenders Quick Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <i className="ph-bold ph-cards text-purple-600"></i>
            <span>Sample Tenders with Submissions (Click to View):</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {tenders.length} Active Dossiers Available
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sampleTenderIds.map((id) => {
            const t = tenders.find((x) => x.id === id);
            if (!t) return null;
            const count = (bids[t.id] || []).length;
            const isSelected = currentTenderId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCurrentTenderId(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{t.referenceNo}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count} Bids
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tender Header & Reference */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
              Governance &amp; Audit Inspection Desk
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              Ref: {tender.referenceNo}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {tender.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department: <strong className="text-slate-700">{tender.department}</strong> • Location: <strong className="text-slate-700">{tender.location}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentTenderId}
            onChange={(e) => setCurrentTenderId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.referenceNo} — {t.title.substring(0, 40)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Governance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">Total Bids Lodged</p>
            <p className="text-2xl font-bold text-slate-900">{totalBids}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sealed supplier submissions</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <i className="ph-bold ph-files"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">Audit Verification</p>
            <p className="text-2xl font-bold text-purple-700">
              {verifiedCount} <span className="text-sm font-medium text-slate-400">/ {totalBids}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {allVerified ? 'All bids verified compliant' : 'Pending full audit review'}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            <i className="ph-bold ph-shield-check"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">Tender Box Status</p>
            <p className={`text-base font-bold ${isReleased ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isReleased ? 'Unsealed & Released' : 'Vault Sealed (AES-256)'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isReleased ? 'Cleared for commercial matrix' : 'Financial envelope encrypted'}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${
            isReleased ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <i className={`ph-bold ${isReleased ? 'ph-lock-key-open' : 'ph-lock-key'}`}></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase font-bold text-slate-500 mb-1">Integrity Assurance</p>
            <p className="text-2xl font-bold text-emerald-700">100%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">ISO 37001 Anti-Bribery Standard</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <i className="ph-bold ph-check-circle"></i>
          </div>
        </div>
      </div>

      {/* Audit Success Banner & Next Step CTA */}
      {isReleased && (
        <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <i className="ph-fill ph-shield-check text-3xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-emerald-950 font-bold text-base">
                  Audit Clearance Granted &amp; Commercial Data Unsealed!
                </h3>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Cleared ✓
                </span>
              </div>
              <p className="text-emerald-800 text-xs sm:text-sm mt-1">
                Governance Clearance Certificate: <strong className="font-mono font-bold">GOV-2026-AUD88</strong> signed off by <strong className="font-semibold">Ir. Daniel Wong</strong>. Pricing schedules and total summary matrix are available for evaluation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveNavTab('procurement-admin')}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>View Total Procurement Summary</span>
            <i className="ph-bold ph-arrow-right"></i>
          </button>
        </div>
      )}

      {/* Submissions Verification Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <i className="ph-bold ph-list-checks text-purple-600"></i>
              <span>Bidder Submissions &amp; Compliance Verification</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify statutory compliance, digital signatures, and technical proposals for {tender.referenceNo}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!allVerified && (
              <button
                type="button"
                onClick={handleVerifyAll}
                className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i className="ph-bold ph-checks"></i>
                <span>Verify All ({totalBids})</span>
              </button>
            )}

            {!isReleased && (
              <button
                type="button"
                disabled={isProcessing || !allVerified}
                onClick={handleGrantClearance}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                  allVerified
                    ? 'bg-purple-700 hover:bg-purple-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title={!allVerified ? 'Please verify all submissions first' : 'Unseal commercial envelope'}
              >
                {isProcessing ? (
                  <>
                    <i className="ph-bold ph-spinner animate-spin"></i>
                    <span>Processing Clearance...</span>
                  </>
                ) : (
                  <>
                    <i className="ph-bold ph-shield-check"></i>
                    <span>Grant Clearance &amp; Unseal Commercial Matrix</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Bidder / Company Name</th>
                <th className="px-4 py-3">Submission Timestamp</th>
                <th className="px-4 py-3">Digital Checksum (SHA-256)</th>
                <th className="px-4 py-3 text-center">SSM &amp; CIDB</th>
                <th className="px-4 py-3 text-center">Technical Dossier</th>
                <th className="px-4 py-3 text-center">Audit Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenderBids.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No bidder submissions lodged for this tender yet.
                  </td>
                </tr>
              ) : (
                tenderBids.map((bid, idx) => {
                  const isABC = bid.bidderId === 'usr_ahmad_syakir' || bid.companyName.includes('Syarikat ABC');
                  return (
                    <tr
                      key={bid.id || idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isABC ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{idx + 1}. {bid.companyName}</span>
                          {isABC && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                              Vendor Bid
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Officer: {bid.bidderName} • {bid.cidbGrade || 'CIDB G7'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                        {new Date(bid.submittedAt).toLocaleString('en-MY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {bid.checksumSha256 ? `${bid.checksumSha256.substring(0, 14)}...` : 'AES-256-VAULTED'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                          <i className="ph-bold ph-check"></i> Valid
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setActivePdfModal({
                              isOpen: true,
                              fileName: bid.technicalProposalFileName || 'Technical_Proposal.pdf',
                              fileTitle: `Technical Proposal - ${bid.companyName}`,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <i className="ph-bold ph-file-text"></i>
                          <span>View Proposal</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            bid.isAuditVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <i className={`ph-bold ${bid.isAuditVerified ? 'ph-check-circle' : 'ph-clock'}`}></i>
                          <span>{bid.isAuditVerified ? 'Verified ✓' : 'Pending Audit'}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleVerifyToggle(bid.id, !!bid.isAuditVerified)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            bid.isAuditVerified
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                          }`}
                        >
                          {bid.isAuditVerified ? 'Unverify' : 'Verify Bid'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Modal for viewing proposal */}
      <PdfViewerModal
        isOpen={activePdfModal.isOpen}
        onClose={() => setActivePdfModal({ isOpen: false, fileName: '' })}
        fileName={activePdfModal.fileName}
        fileTitle={activePdfModal.fileTitle}
      />
    </div>
  );
};
