import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';

export const TenderProcessStepper: React.FC = () => {
  const {
    currentTenderId,
    setCurrentTenderId,
    tenders,
    bids,
    currentUser,
    startTenderWorkflowStage,
    resetITEquipmentTenderProcess,
    fastForwardITEquipmentTender,
    activeNavTab,
  } = useTender();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const itTender = tenders.find((t) => t.id === 'MP-IT-2026-001') || tenders[0];
  const itBids = bids['MP-IT-2026-001'] || [];
  const syarikatAbcBid = itBids.find(
    (b) => b.bidderId === 'usr_ahmad_syakir' || b.companyName.includes('Syarikat ABC')
  );

  const isStep1Done = !!syarikatAbcBid;
  const verifiedCount = itBids.filter((b) => b.isAuditVerified).length;
  const totalBids = itBids.length;
  const isStep2Done = (itTender.status === 'Released' || itTender.status === 'Awarded') && verifiedCount === totalBids && totalBids > 0;
  const isStep3Active = itTender.status === 'Released' || itTender.status === 'Awarded';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReset = () => {
    resetITEquipmentTenderProcess();
    showToast('Process workflow reset to Step 1 (Quotation Submission).');
  };

  const handleFastForward = () => {
    fastForwardITEquipmentTender();
    showToast('Bid submitted, audit cleared & commercial summary unsealed!');
  };

  // Determine current active step index (1, 2, or 3)
  const getCurrentStepIndex = () => {
    if (activeNavTab === 'submissions' || (currentUser.role === 'vendor' && !isStep1Done)) return 1;
    if (activeNavTab === 'governance-audit' || currentUser.role === 'governance' || currentUser.role === 'auditor') return 2;
    if (activeNavTab === 'procurement-admin' || currentUser.role === 'admin' || currentUser.role === 'procurement') return 3;
    return 1;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Tender Process Stepper</span>
            </span>

            <span className="text-slate-600 font-medium hidden sm:inline">
              Tender: <strong className="text-slate-900 font-semibold">Supply and Delivery of IT Equipment for Regional Offices</strong>{' '}
              <span className="font-mono text-slate-500">(MP-IT-2026-001)</span>
            </span>

            {currentTenderId !== 'MP-IT-2026-001' && (
              <button
                type="button"
                onClick={() => setCurrentTenderId('MP-IT-2026-001')}
                className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200 transition-colors cursor-pointer"
              >
                Select IT Equipment Tender
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {toastMessage && (
              <span className="bg-emerald-600 text-white font-medium px-3 py-1 rounded-md text-xs shadow-xs animate-fadeIn flex items-center gap-1.5">
                <i className="ph-bold ph-check-circle"></i>
                {toastMessage}
              </span>
            )}

            <button
              type="button"
              onClick={handleReset}
              title="Reset data to Step 1 for an end-to-end demonstration"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
            >
              <i className="ph-bold ph-arrows-clockwise text-slate-500"></i>
              <span>Reset Demo</span>
            </button>

            <button
              type="button"
              onClick={handleFastForward}
              title="Automatically complete submission and audit verification to inspect commercial matrix"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <i className="ph-bold ph-fast-forward"></i>
              <span>Fast-Forward Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand process guide' : 'Collapse process guide'}
            >
              <i className={`ph-bold ${isCollapsed ? 'ph-caret-down' : 'ph-caret-up'} text-sm`}></i>
            </button>
          </div>
        </div>

        {/* 3 Step Interactive Stepper */}
        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* STEP 1 */}
            <div
              onClick={() => startTenderWorkflowStage('submit', 'MP-IT-2026-001')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                currentStep === 1
                  ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-100 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isStep1Done
                          ? 'bg-emerald-500 text-white'
                          : currentStep === 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isStep1Done ? '✓' : '1'}
                    </span>
                    <span className="font-bold text-xs text-slate-900">
                      Step 1: Sealed Bid Submission
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isStep1Done
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isStep1Done ? 'Submitted ✓' : 'Pending Submission'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Vendor <strong className="text-slate-700">Ahmad Syakir (Syarikat ABC)</strong> enters itemized pricing &amp; submits quotation.
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Role: Supplier (Vendor)</span>
                <span className="font-semibold text-blue-600 group-hover:underline flex items-center gap-1 text-[11px]">
                  <span>Open Submission</span>
                  <i className="ph ph-arrow-right"></i>
                </span>
              </div>
            </div>

            {/* STEP 2 */}
            <div
              onClick={() => startTenderWorkflowStage('audit', 'MP-IT-2026-001')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                currentStep === 2
                  ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-100 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isStep2Done
                          ? 'bg-emerald-500 text-white'
                          : currentStep === 2
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isStep2Done ? '✓' : '2'}
                    </span>
                    <span className="font-bold text-xs text-slate-900">
                      Step 2: Internal Audit Verification
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isStep2Done
                        ? 'bg-emerald-100 text-emerald-800'
                        : verifiedCount > 0
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isStep2Done ? 'Verified & Unsealed ✓' : `${verifiedCount}/${totalBids} Verified`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Audit Officer <strong className="text-slate-700">Ir. Daniel Wong</strong> inspects integrity &amp; unseals commercial proposals.
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Role: Independent Auditor</span>
                <span className="font-semibold text-purple-600 group-hover:underline flex items-center gap-1 text-[11px]">
                  <span>Inspect &amp; Verify</span>
                  <i className="ph ph-arrow-right"></i>
                </span>
              </div>
            </div>

            {/* STEP 3 */}
            <div
              onClick={() => startTenderWorkflowStage('matrix', 'MP-IT-2026-001')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                currentStep === 3
                  ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-100 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isStep3Active
                          ? 'bg-emerald-500 text-white'
                          : currentStep === 3
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      3
                    </span>
                    <span className="font-bold text-xs text-slate-900">
                      Step 3: Commercial Comparison Matrix
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isStep3Active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isStep3Active ? 'Ready for Evaluation ✓' : 'Awaiting Audit Clearance'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Procurement Head <strong className="text-slate-700">Noraini Ismail</strong> evaluates comparative pricing &amp; 70:30 weighted scores.
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Role: Group Procurement</span>
                <span className="font-semibold text-emerald-700 group-hover:underline flex items-center gap-1 text-[11px]">
                  <span>View Commercial Matrix</span>
                  <i className="ph ph-arrow-right"></i>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
