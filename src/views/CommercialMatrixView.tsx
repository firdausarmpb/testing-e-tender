import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { exportCommercialMatrixCsv, exportEvaluationReportPdf } from '../utils/exportUtils';
import { PdfViewerModal } from '../components/PdfViewerModal';

export const CommercialMatrixView: React.FC = () => {
  const {
    tenders,
    currentTenderId,
    setCurrentTenderId,
    bids,
    submitToTenderBoard,
    setActiveNavTab,
    releaseTenderToProcurement,
    startTenderWorkflowStage,
  } = useTender();

  const [activePdfModal, setActivePdfModal] = useState<{
    isOpen: boolean;
    fileName: string;
    fileTitle?: string;
  }>({ isOpen: false, fileName: '' });

  const [showUnitRates, setShowUnitRates] = useState(true);
  const [showVarianceView, setShowVarianceView] = useState(false);
  const [awardSubmittedToast, setAwardSubmittedToast] = useState(false);

  // Get active tender
  const tender = tenders.find((t) => t.id === currentTenderId) || tenders[0];
  const tenderBids = bids[tender.id] || [];

  // Sort bids lowest to highest by grand total
  const sortedBids = [...tenderBids].sort((a, b) => a.grandTotal - b.grandTotal);

  const isReleased = tender.status === 'Released' || tender.status === 'Awarded';
  const capexBudget = tender.approvedCapexBudget || 300000;

  const lowestBid = sortedBids[0];
  const highestBid = sortedBids[sortedBids.length - 1];
  const avgBidAmount =
    sortedBids.length > 0
      ? sortedBids.reduce((acc, b) => acc + b.grandTotal, 0) / sortedBids.length
      : capexBudget;

  const sampleTenderIds = ['MP-IT-2026-001', 'MP-ENG-2026-042', 'MP-BC-2026-008', 'MP-STR-2026-015'];

  const handleSubmitAward = () => {
    if (window.confirm(`Formally submit commercial matrix recommendation for Tender ${tender.referenceNo} to the Media Prima Tender Board?`)) {
      submitToTenderBoard(tender.id);
      setAwardSubmittedToast(true);
      setTimeout(() => setAwardSubmittedToast(false), 4000);
    }
  };

  // If accessed before audit release
  if (!isReleased) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveNavTab('active-tenders')}
            className="text-xs text-slate-600 hover:text-blue-700 flex items-center gap-1.5 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
          >
            <i className="ph ph-arrow-left"></i>
            <span>Back to Active Tenders List</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Evaluation Dossier:</span>
            <select
              value={currentTenderId}
              onChange={(e) => setCurrentTenderId(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 shadow-xs cursor-pointer"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.referenceNo} ({t.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 text-3xl">
            <i className="ph-fill ph-lock-key"></i>
          </div>
          <span className="text-[11px] uppercase font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Awaiting Governance Clearance
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3">
            Commercial Matrix Sealed
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg leading-relaxed">
            In accordance with Two-Envelope Sealed Bidding protocol, commercial envelope figures remain cryptographically vaulted until technical evaluation is formally audited and signed off.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveNavTab('governance-audit')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <i className="ph-bold ph-shield-check"></i>
              <span>Go to Governance &amp; Audit Desk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                releaseTenderToProcurement(tender.id);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="ph-bold ph-lock-key-open"></i>
              <span>Unseal Commercial Data Instantly</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Sample Tenders Quick Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs w-full">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <i className="ph-bold ph-chart-line-up text-emerald-600"></i>
            <span>Sample Tenders - Commercial Evaluation Summaries (Click to View):</span>
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
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{t.referenceNo}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count} Bids (RM {(t.approvedCapexBudget / 1000).toFixed(0)}k)
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-full px-margin py-space-lg flex flex-col gap-space-lg">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs text-on-surface-variant flex-wrap">
            <button
              type="button"
              onClick={() => setActiveNavTab('active-tenders')}
              className="hover:text-primary transition-colors font-label-md flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Active Tenders</span>
            </button>
            <span className="text-outline-variant font-label-md">/</span>
            <span className="font-label-md text-on-surface font-semibold">Evaluation Workspace</span>
            <span className="text-outline-variant font-label-md">/</span>
            <select
              value={currentTenderId}
              onChange={(e) => setCurrentTenderId(e.target.value)}
              className="bg-surface-container-high px-2.5 py-1 rounded text-on-surface font-code-sm font-semibold border-none cursor-pointer focus:ring-1 focus:ring-primary"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  TENDER-REF: {t.referenceNo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>Status: Unsealed &amp; Cleared for Commercial Review</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm font-medium">
              <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
              <span>Gov Ref: GOV-2026-AUD88 Verified ✓ Internal Audit</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm">
              <span className="material-symbols-outlined text-[15px]">public</span>
              <span>Open Tender</span>
            </span>
          </div>
        </div>

        {/* Title & Executive Action Bar Header */}
        <div className="bg-white rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-center gap-2 text-primary font-label-sm font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span>Commercial &amp; Technical Bid Matrix (Post-Opening Evaluation)</span>
            </div>
            <h1 className="font-headline-lg font-bold text-on-surface tracking-tight">
              Commercial Evaluation Matrix &amp; Bidder Comparison
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-4xl leading-relaxed">
              {tender.title}. Compare BOQ pricing, compliance clearance, and price deviations across all verified bidder submissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm shrink-0 z-10">
            <button
              type="button"
              onClick={() => exportCommercialMatrixCsv(tender, sortedBids)}
              className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md px-3.5 py-2 rounded-lg transition-colors shadow-xs border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">table_view</span>
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => exportEvaluationReportPdf(tender, sortedBids)}
              className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md px-3.5 py-2 rounded-lg transition-colors shadow-xs border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-error text-[18px]">picture_as_pdf</span>
              <span>Generate Evaluation PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('clarification-desk')}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-label-md px-4 py-2 rounded-lg transition-all shadow-md hover:shadow"
            >
              <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
              <span>Send Clarification Request</span>
            </button>
          </div>

          <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-primary-fixed/30 blur-2xl pointer-events-none"></div>
        </div>

        {/* Award Submitted Toast */}
        {awardSubmittedToast && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-950 font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-700">verified</span>
              <span>Commercial evaluation recommendation formally lodged with the Media Prima Tender Board!</span>
            </div>
          </div>
        )}

        {/* Executive Summary Key Metrics Panel (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Metric 1: Lowest Compliant */}
          <div className="bg-white rounded-xl p-space-md shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm font-semibold uppercase tracking-wider text-secondary">
                  Rank 1 • Lowest Compliant Bid
                </span>
                <span className="font-headline-lg font-bold text-on-surface mt-1 font-mono">
                  RM {lowestBid ? lowestBid.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary-container/50 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-outline-variant/20">
              <div className="flex items-center gap-1.5 text-on-surface font-label-md font-semibold truncate">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="truncate">{lowestBid ? lowestBid.companyName : 'N/A'}</span>
              </div>
              <span className="font-label-sm px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed-variant font-bold">
                {lowestBid ? (((lowestBid.grandTotal - capexBudget) / capexBudget) * 100).toFixed(1) : '0.0'}% vs Budget
              </span>
            </div>
          </div>

          {/* Metric 2: Approved Capex Budget */}
          <div className="bg-white rounded-xl p-space-md shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Approved Capex Budget
                </span>
                <span className="font-headline-lg font-bold text-on-surface mt-1 font-mono">
                  RM {capexBudget.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-outline-variant/20">
              <span className="font-body-sm text-on-surface-variant">Procurement Ceiling Price</span>
              <span className="font-label-sm text-secondary font-semibold">
                RM {(capexBudget - (lowestBid ? lowestBid.grandTotal : 0)).toLocaleString('en-MY')} Buffer
              </span>
            </div>
          </div>

          {/* Metric 3: Average Bid */}
          <div className="bg-white rounded-xl p-space-md shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Market Average Bid
                </span>
                <span className="font-headline-lg font-bold text-on-surface mt-1 font-mono">
                  RM {avgBidAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">stacked_bar_chart</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-outline-variant/20">
              <span className="font-body-sm text-on-surface-variant">
                {sortedBids.length} Verified Submissions
              </span>
              <span className="font-label-sm text-on-surface-variant font-medium">Std Dev: ± RM 8.7k</span>
            </div>
          </div>

          {/* Metric 4: Highest Bid */}
          <div className="bg-white rounded-xl p-space-md shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm font-semibold uppercase tracking-wider text-error">
                  Highest Submitted Bid
                </span>
                <span className="font-headline-lg font-bold text-on-surface mt-1 font-mono">
                  RM {highestBid ? highestBid.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-error-container/40 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">trending_up</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-outline-variant/20">
              <span className="font-label-md text-on-surface truncate">
                {highestBid ? highestBid.companyName : 'N/A'}
              </span>
              <span className="font-label-sm text-error font-medium">
                +RM {highestBid && lowestBid ? ((highestBid.grandTotal - lowestBid.grandTotal) / 1000).toFixed(0) : '0'}k vs L1
              </span>
            </div>
          </div>
        </div>

        {/* Visual Benchmarking Bar & Spread Analytics Section */}
        <div className="bg-white rounded-2xl p-space-md shadow-xs border border-outline-variant/30 flex flex-col gap-space-sm">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">waterfall_chart</span>
              <span className="font-headline-sm font-bold text-on-surface">
                Bid Spread vs. Capex Baseline (RM {(capexBudget / 1000).toFixed(0)}k Ceiling)
              </span>
            </div>
            <div className="flex items-center gap-space-md text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-secondary"></span>Lowest Compliant Bidder
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary-container"></span>Other Verified Bidders
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-outline"></span>Ceiling Budget
              </span>
            </div>
          </div>

          {/* Visual Distribution Bars */}
          <div className="w-full bg-surface-container-low rounded-xl p-space-md flex flex-col gap-3">
            {sortedBids.map((b, idx) => {
              const pct = (b.grandTotal / capexBudget) * 100;
              const variancePct = (((b.grandTotal - capexBudget) / capexBudget) * 100).toFixed(1);
              const isL1 = idx === 0;

              return (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="w-52 shrink-0 flex items-center justify-between">
                    <span className="font-label-md font-semibold text-on-surface truncate">
                      {idx + 1}. {b.companyName}
                    </span>
                    <span
                      className={`font-label-sm px-1.5 py-0.2 rounded text-[10px] ${
                        isL1
                          ? 'bg-secondary text-white font-bold'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      L{idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 bg-surface-container rounded-full h-5 relative overflow-hidden flex items-center">
                    <div
                      className={`h-full rounded-full flex items-center justify-end pr-2 text-white font-code-sm text-[10px] font-bold ${
                        isL1 ? 'bg-secondary' : 'bg-primary-container'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    >
                      RM {b.grandTotal.toLocaleString('en-MY')} ({variancePct}%)
                    </div>
                  </div>

                  <span
                    className={`w-28 text-right font-code-sm font-bold ${
                      isL1 ? 'text-secondary' : 'text-on-surface'
                    }`}
                  >
                    RM {b.grandTotal.toLocaleString('en-MY')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN COMMERCIAL COMPARISON MATRIX TABLE */}
        <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
          {/* Table Filter Bar & Sub-toolbar */}
          <div className="p-space-md bg-white border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container font-label-md text-on-surface font-semibold">
                <span className="material-symbols-outlined text-primary text-[18px]">table_chart</span>
                <span>Comprehensive Bill of Quantities (BOQ) Breakdown</span>
              </div>
              <span className="font-body-sm text-on-surface-variant">
                Currency: Ringgit Malaysia (MYR) • Pricing inclusive of 6% SST where designated
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUnitRates(!showUnitRates)}
                className={`px-3 py-1.5 rounded-lg font-label-sm transition-colors flex items-center gap-1 border ${
                  showUnitRates
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Toggle Unit Rates</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVarianceView(!showVarianceView)}
                className={`px-3 py-1.5 rounded-lg font-label-sm transition-colors flex items-center gap-1 border ${
                  showVarianceView
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                <span>Variance View</span>
              </button>
            </div>
          </div>

          {/* Matrix Horizontal Scroll Container */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-body-md border-collapse min-w-[1240px]">
              {/* Table Header */}
              <thead>
                <tr className="bg-surface-container-low text-on-surface border-b border-outline-variant/30">
                  {/* Sticky Left Column: BOQ Description */}
                  <th className="sticky left-0 z-20 bg-surface-container-high/95 backdrop-blur-md px-space-md py-space-sm font-label-md text-on-surface font-bold w-[340px] shadow-r">
                    <div className="flex flex-col">
                      <span>Item No &amp; Scope Description</span>
                      <span className="font-label-sm text-on-surface-variant font-normal">
                        Technical Specifications Ref
                      </span>
                    </div>
                  </th>

                  {/* Quantity Column */}
                  <th className="px-space-sm py-space-sm font-label-md text-center text-on-surface-variant w-16">
                    Qty
                  </th>

                  {/* Bidder Columns */}
                  {sortedBids.map((b, idx) => {
                    const isL1 = idx === 0;
                    return (
                      <th
                        key={b.id}
                        className={`px-space-md py-space-sm ${
                          isL1 ? 'bg-secondary-container/30 w-64' : 'w-56'
                        }`}
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold uppercase ${
                                isL1
                                  ? 'bg-secondary text-white shadow-xs'
                                  : 'bg-surface-container-high text-on-surface-variant'
                              }`}
                            >
                              Rank {idx + 1} {isL1 && '• Lowest'}
                            </span>
                            <span className="inline-flex items-center text-secondary text-[12px] font-bold gap-0.5">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              100% Pass
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="font-label-md font-bold text-on-surface leading-tight truncate">
                              {b.companyName}
                            </span>
                            <span className="text-[11px] text-on-surface-variant truncate">
                              Vendor ID: {b.vendorId} • {b.cidbGrade}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setActivePdfModal({
                                isOpen: true,
                                fileName: b.commercialProposalFileName,
                                fileTitle: `${b.companyName} - Signed Commercial Bid & BOM`,
                              })
                            }
                            className={`mt-1 w-full font-label-sm text-xs py-1 px-2 rounded flex items-center justify-center gap-1 shadow-xs transition-colors ${
                              isL1
                                ? 'bg-secondary text-white hover:bg-secondary/90'
                                : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">file_download</span>
                            <span>Download {isL1 ? 'Official PDF/BOM' : 'PDF'}</span>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-outline-variant/20">
                {tender.bqItems.map((item, rowIdx) => {
                  const isEven = rowIdx % 2 === 1;
                  return (
                    <tr
                      key={item.id}
                      className={`${isEven ? 'bg-surface-container-low/40' : 'bg-white'} hover:bg-surface-container-low transition-colors`}
                    >
                      <td
                        className={`sticky left-0 z-10 px-space-md py-4 shadow-r ${
                          isEven ? 'bg-surface-container-low' : 'bg-white'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-label-md font-semibold text-on-surface">
                            {item.itemNumber}: {item.description}
                          </span>
                          <span className="font-body-sm text-on-surface-variant">
                            {item.detailedSpecs}
                          </span>
                        </div>
                      </td>

                      <td className="px-space-sm py-4 text-center font-code-sm text-on-surface-variant">
                        {item.quantity}
                      </td>

                      {sortedBids.map((b, bIdx) => {
                        const isL1 = bIdx === 0;
                        const entry = b.bqEntries.find((e) => e.itemId === item.id);
                        const unitRate = entry ? entry.unitPrice : 0;
                        const totalAmount = entry ? entry.totalAmount : 0;

                        // Dynamically determine if this bid has the lowest unit price for this item
                        const lowestUnitRateForItem = Math.min(
                          ...sortedBids.map((bid) => {
                            const e = bid.bqEntries.find((itemEntry) => itemEntry.itemId === item.id);
                            return e && e.unitPrice > 0 ? e.unitPrice : Infinity;
                          })
                        );
                        const isLowestUnitRate = unitRate > 0 && unitRate === lowestUnitRateForItem;

                        return (
                          <td
                            key={b.id}
                            className={`px-space-md py-4 ${
                              isL1 ? 'bg-secondary-container/20' : ''
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-code-sm font-bold text-on-surface">
                                {totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                              </span>
                              {showUnitRates && (
                                <span
                                  className={`text-[11px] ${
                                    isLowestUnitRate
                                      ? 'text-secondary font-semibold'
                                      : 'text-on-surface-variant'
                                  }`}
                                >
                                  @ RM {unitRate.toLocaleString('en-MY', { minimumFractionDigits: 2 })}{' '}
                                  {item.unit === 'Units' ? '/ unit' : ''}
                                  {isLowestUnitRate && ' (Lowest)'}
                                </span>
                              )}
                              {showVarianceView && lowestBid && (
                                <span className="text-[10px] text-outline font-mono">
                                  {bIdx === 0
                                    ? 'Baseline'
                                    : `+RM ${(totalAmount - (lowestBid.bqEntries.find((e) => e.itemId === item.id)?.totalAmount || 0)).toLocaleString()}`}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer: Subtotal, SST, Grand Total */}
              <tfoot className="border-t-2 border-outline-variant/40">
                {/* Subtotal Row */}
                <tr className="bg-surface-container">
                  <td className="sticky left-0 z-10 bg-surface-container px-space-md py-3 font-label-md font-bold text-on-surface shadow-r">
                    Subtotal (Excluding Tax)
                  </td>
                  <td className="px-space-sm py-3 text-center text-on-surface-variant font-code-sm">—</td>
                  {sortedBids.map((b, idx) => (
                    <td
                      key={b.id}
                      className={`px-space-md py-3 font-code-sm text-on-surface ${
                        idx === 0
                          ? 'bg-secondary-container/30 font-bold'
                          : 'font-semibold'
                      }`}
                    >
                      RM {b.subtotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* SST Row */}
                <tr className="bg-surface-container-high/60">
                  <td className="sticky left-0 z-10 bg-surface-container-high px-space-md py-2.5 font-label-sm text-on-surface-variant shadow-r">
                    Applicable Service Tax (SST 6%)
                  </td>
                  <td className="px-space-sm py-2.5 text-center text-on-surface-variant font-code-sm">6%</td>
                  {sortedBids.map((b, idx) => (
                    <td
                      key={b.id}
                      className={`px-space-md py-2.5 font-code-sm text-on-surface-variant ${
                        idx === 0 ? 'bg-secondary-container/20' : ''
                      }`}
                    >
                      RM {b.sstAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* Grand Total Row */}
                <tr className="bg-surface-container-highest/80 font-bold border-t border-outline-variant/30">
                  <td className="sticky left-0 z-10 bg-surface-container-highest px-space-md py-4 shadow-r">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-on-surface font-bold">
                          Grand Total Bid Value (MYR)
                        </span>
                        <span className="font-label-sm text-on-surface-variant font-normal">
                          Final Commercial Bid Submitted
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-space-sm py-4 text-center text-on-surface font-headline-sm">—</td>
                  {sortedBids.map((b, idx) => {
                    const isL1 = idx === 0;
                    const varianceFromL1 = b.grandTotal - (lowestBid ? lowestBid.grandTotal : 0);
                    const variancePctFromL1 = (
                      (varianceFromL1 / (lowestBid ? lowestBid.grandTotal : 1)) *
                      100
                    ).toFixed(1);

                    return (
                      <td
                        key={b.id}
                        className={`px-space-md py-4 ${
                          isL1 ? 'bg-secondary-container/60' : ''
                        }`}
                      >
                        <div className="flex flex-col">
                          <span
                            className={`font-headline-sm font-bold ${
                              isL1 ? 'text-secondary' : 'text-on-surface'
                            }`}
                          >
                            RM {b.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </span>
                          <span
                            className={`font-label-sm flex items-center gap-1 ${
                              isL1
                                ? 'text-on-secondary-fixed-variant font-bold'
                                : idx === sortedBids.length - 1
                                ? 'text-error font-medium'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            {isL1 ? (
                              <>
                                <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                                Lowest Evaluated Bid
                              </>
                            ) : (
                              `+RM ${varianceFromL1.toLocaleString()} (+${variancePctFromL1}%)`
                            )}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Action Sub-footer inside table panel */}
          <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
              <span>
                Digital Seal Checked: All {sortedBids.length} cryptographic bid hashes match blockchain transaction logs recorded at closing time.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Batch downloading official BOQ zip container for all participating bidders...')}
                className="px-3 py-1.5 bg-white hover:bg-surface-container text-on-surface font-label-md rounded-lg shadow-xs transition-colors flex items-center gap-1 border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[16px]">folder_zip</span>
                <span>Batch Download All {sortedBids.length} BOQs</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: TECHNICAL COMPLIANCE VS COMMERCIAL SCORE & COMMITTEE RECOMMENDATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Panel: Combined Evaluation Matrix (70:30) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[20px]">equalizer</span>
                  <span className="font-headline-sm font-bold text-on-surface">
                    Combined Evaluation Matrix (70% Technical : 30% Commercial)
                  </span>
                </div>
                <span className="font-body-sm text-on-surface-variant">
                  Weighted combined score based on Media Prima Engineering Procurement Framework
                </span>
              </div>
              <div className="inline-flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded text-on-surface font-label-sm font-medium">
                <span>Formula: Technical (70) + (Lowest/Bid × 30)</span>
              </div>
            </div>

            {/* Scoring Data Table */}
            <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
              <table className="w-full text-left font-body-md">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider border-b border-outline-variant/30">
                    <th className="px-3 py-2.5">Bidder Name</th>
                    <th className="px-3 py-2.5 text-center">Tech Spec (30%)</th>
                    <th className="px-3 py-2.5 text-center">Track Record (20%)</th>
                    <th className="px-3 py-2.5 text-center">SLA Terms (20%)</th>
                    <th className="px-3 py-2.5 text-center">Commercial (30%)</th>
                    <th className="px-3 py-2.5 text-center">Combined Score</th>
                    <th className="px-3 py-2.5 text-center">Ranking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {sortedBids.map((b, idx) => {
                    const isL1 = idx === 0;
                    return (
                      <tr
                        key={b.id}
                        className={isL1 ? 'bg-secondary-container/20 font-semibold' : 'hover:bg-surface-container-low/50 transition-colors'}
                      >
                        <td className="px-3 py-3 text-on-surface flex items-center gap-2">
                          {isL1 && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
                          <span>{b.companyName}</span>
                        </td>
                        <td className="px-3 py-3 text-center font-code-sm text-on-surface">
                          {b.techSpecScore ? `${b.techSpecScore} / 30` : '27.0 / 30'}
                        </td>
                        <td className="px-3 py-3 text-center font-code-sm text-on-surface">
                          {b.trackRecordScore ? `${b.trackRecordScore} / 20` : '18.0 / 20'}
                        </td>
                        <td className="px-3 py-3 text-center font-code-sm text-on-surface">
                          {b.slaTermsScore ? `${b.slaTermsScore} / 20` : '18.5 / 20'}
                        </td>
                        <td
                          className={`px-3 py-3 text-center font-code-sm ${
                            isL1 ? 'font-bold text-secondary' : 'text-on-surface'
                          }`}
                        >
                          {isL1
                            ? '30.0 / 30'
                            : `${(((lowestBid?.grandTotal || 258000) / b.grandTotal) * 30).toFixed(2)} / 30`}
                        </td>
                        <td
                          className={`px-3 py-3 text-center font-code-sm text-headline-sm font-bold ${
                            isL1 ? 'text-secondary' : 'text-on-surface'
                          }`}
                        >
                          {b.combinedScore || '90.0'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${
                              isL1
                                ? 'bg-secondary text-white'
                                : idx === 1
                                ? 'bg-surface-container-high text-on-surface'
                                : 'bg-surface-container-low text-on-surface-variant'
                            }`}
                          >
                            {isL1 ? '1st Selected' : idx === 1 ? '2nd Reserve' : `${idx + 1}th`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Commentary note */}
            <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-xl text-body-sm text-on-surface-variant border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[18px]">info</span>
              <span>
                Technical evaluations were completed and digitally unsealed on 24 Feb 2026 by Evaluation Committee A (Broadcast Operations &amp; Group IT).
              </span>
            </div>
          </div>

          {/* Right Panel: Committee Recommendation & Audit Sign-Off */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-white rounded-2xl p-space-lg shadow-xs border border-outline-variant/30 flex flex-col justify-between flex-1 relative overflow-hidden">
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm font-bold uppercase tracking-wider text-primary">
                    Procurement Recommendation
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[22px]">gavel</span>
                </div>

                <h3 className="font-headline-sm font-bold text-on-surface">
                  Recommend Award: {lowestBid ? lowestBid.companyName : 'Nexus Digital Systems'}
                </h3>

                <p className="font-body-sm text-on-surface-variant leading-relaxed">
                  <strong>{lowestBid ? lowestBid.companyName : 'Nexus Digital Systems'}</strong> achieved the highest combined evaluation score (
                  <strong className="text-on-surface font-semibold">
                    {lowestBid?.combinedScore || '97.6'} / 100
                  </strong>
                  ) and submitted the lowest commercially compliant bid of{' '}
                  <strong className="text-secondary font-semibold">
                    RM {lowestBid ? lowestBid.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 }) : '258,000.00'}
                  </strong>
                  , generating a savings of{' '}
                  <strong className="text-secondary font-semibold">
                    RM {(capexBudget - (lowestBid ? lowestBid.grandTotal : 0)).toLocaleString('en-MY')} ({lowestBid ? (((lowestBid.grandTotal - capexBudget) / capexBudget) * 100).toFixed(1) : '0.0'}%)
                  </strong>{' '}
                  against the ceiling capex budget.
                </p>

                <div className="bg-surface-container-low p-space-sm rounded-xl flex flex-col gap-1.5 border border-outline-variant/30">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-on-surface-variant">Technical Compliance:</span>
                    <span className="font-semibold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span> 100% Meets Specs
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-on-surface-variant">OEM Authorised Letter:</span>
                    <span className="font-semibold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span> Verified Genuine
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-on-surface-variant">SSM / CIDB Standing:</span>
                    <span className="font-semibold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span> Active &amp; Valid
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-space-xs">
                  <span className="font-label-sm font-bold text-on-surface">
                    Committee Members Signatures:
                  </span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-on-surface-variant font-body-sm">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-[11px] font-medium border border-outline-variant/20">
                      ✓ Ir. Daniel Wong (CTO Office)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-[11px] font-medium border border-outline-variant/20">
                      ✓ Noraini Ismail (Head of Procurement)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-space-md pt-space-sm flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSubmitAward}
                  className="w-full bg-primary hover:bg-primary-container text-white font-label-md py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Submit to Tender Board (Jawatankuasa Tender)</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Formal extension request draft generated and routed to Group Procurement Secretariat.')}
                  className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Request Formal Extension / Re-evaluation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      <PdfViewerModal
        isOpen={activePdfModal.isOpen}
        onClose={() => setActivePdfModal({ isOpen: false, fileName: '' })}
        fileName={activePdfModal.fileName}
        fileTitle={activePdfModal.fileTitle}
      />
    </div>
  );
};
