import React, { useState, useRef } from 'react';
import { useTender } from '../context/TenderContext';
import { useToast } from '../components/GlobalToast';
import { QaDrawer } from '../components/QaDrawer';

interface VendorSubmissionViewProps {
  onOpenAuditTrail?: () => void;
}

interface UploadedFile {
  name: string;
  size: string;
  uploadedAt: string;
  sha256?: string;
}

interface CommercialPdfDetails {
  name: string;
  size: string;
  uploadedAt: string;
  declaredTotal: number;
  sha256: string;
  quotationRef: string;
  signatoryName: string;
}

export const VendorSubmissionView: React.FC<VendorSubmissionViewProps> = () => {
  const {
    currentTender,
    currentUser,
    setActiveNavTab,
    submitBid,
    bids,
  } = useTender();
  const { showToast } = useToast();

  const [isQaOpen, setIsQaOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPreviewPdfModalOpen, setIsPreviewPdfModalOpen] = useState(false);

  // Check if current tender already has a bid from this user
  const tenderBids = bids[currentTender.id] || [];
  const existingBid = tenderBids.find((b) => b.bidderId === currentUser.id);

  const [isSubmitted, setIsSubmitted] = useState(!!existingBid);
  const [receiptToken, setReceiptToken] = useState(
    existingBid ? 'MP-ENC-88F9' : 'MP-ENC-88F9'
  );

  // Line item pricing state
  const [prices, setPrices] = useState<Record<string, number>>({
    item_1: 3500.0,
    item_2: 1200.0,
    item_3: 15000.0,
  });

  const [complianceChecked, setComplianceChecked] = useState(true);

  // Envelope 1 file state
  const [technicalFile, setTechnicalFile] = useState<UploadedFile | null>({
    name: 'Technical_Proposal_SyarikatABC_v2.pdf',
    size: '2.4 MB',
    uploadedAt: 'Today at 09:15 AM',
  });
  const [ssmFile, setSsmFile] = useState<UploadedFile | null>({
    name: 'SSM_CIDB_G7_SyarikatABC_Merged.pdf',
    size: '4.8 MB',
    uploadedAt: 'Today at 09:20 AM',
  });

  // Calculate live totals
  const subtotal =
    (prices.item_1 || 0) * 50 +
    (prices.item_2 || 0) * 50 +
    (prices.item_3 || 0) * 1;
  const sst = subtotal * 0.06;
  const grandTotal = subtotal + sst;

  // Envelope 2 Commercial PDF Quotation state
  const [commercialPdf, setCommercialPdf] = useState<CommercialPdfDetails | null>({
    name: 'Official_Commercial_Quotation_SyarikatABC_Ref_QUO-2026.pdf',
    size: '1.85 MB',
    uploadedAt: 'Today at 09:30 AM',
    declaredTotal: 344500.0,
    sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    quotationRef: 'QUO-ABC-2026-MP088',
    signatoryName: currentUser.name || 'Ir. Daniel Wong (Managing Director)',
  });

  const [isCommercialDragOver, setIsCommercialDragOver] = useState(false);
  const [isTechnicalDragOver, setIsTechnicalDragOver] = useState(false);
  const [isSsmDragOver, setIsSsmDragOver] = useState(false);
  const [isEditingDeclaredPdfTotal, setIsEditingDeclaredPdfTotal] = useState(false);
  const [customDeclaredTotalInput, setCustomDeclaredTotalInput] = useState('344500.00');

  const commercialFileInputRef = useRef<HTMLInputElement>(null);
  const technicalFileInputRef = useRef<HTMLInputElement>(null);
  const ssmFileInputRef = useRef<HTMLInputElement>(null);

  const isRfpType =
    currentTender.submissionType.includes('Advisory') ||
    currentTender.submissionType.includes('Strategic');

  const formatCurrency = (num: number) =>
    num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Verification logic: Match official quotation PDF against calculated BOQ Grand Total
  const declaredPdfAmount = commercialPdf ? commercialPdf.declaredTotal : null;
  const priceDiscrepancy =
    declaredPdfAmount !== null ? Math.abs(declaredPdfAmount - grandTotal) : 0;
  const isPriceMatch = declaredPdfAmount !== null && priceDiscrepancy < 0.01;

  const handlePriceChange = (key: string, val: string) => {
    const parsed = parseFloat(val);
    setPrices((prev) => ({
      ...prev,
      [key]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  // Upload handlers
  const handleCommercialPdfUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Invalid file format. Please upload an official quotation in PDF format.');
      return;
    }
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const randomSha = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    // By default, match with current calculated grand total
    setCommercialPdf({
      name: file.name,
      size: sizeMb,
      uploadedAt: 'Just now',
      declaredTotal: grandTotal,
      sha256: randomSha,
      quotationRef: `QUO-${Math.random().toString(36).substring(2, 7).toUpperCase()}-2026`,
      signatoryName: currentUser.name,
    });
    setCustomDeclaredTotalInput(grandTotal.toFixed(2));
    showToast(`Commercial Quotation PDF "${file.name}" uploaded successfully!`);
  };

  const handleCommercialDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCommercialDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCommercialPdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleTechnicalPdfUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Technical proposal must be a PDF document.');
      return;
    }
    setTechnicalFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      uploadedAt: 'Just now',
    });
    showToast(`Technical Proposal "${file.name}" uploaded.`);
  };

  const handleSsmPdfUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Registration certificates must be a PDF document.');
      return;
    }
    setSsmFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      uploadedAt: 'Just now',
    });
    showToast(`Company Registration credentials "${file.name}" uploaded.`);
  };

  // Auto-sync declared quotation price with BOQ Grand Total
  const handleSyncPdfToBoq = () => {
    if (!commercialPdf) return;
    setCommercialPdf({
      ...commercialPdf,
      declaredTotal: grandTotal,
    });
    setCustomDeclaredTotalInput(grandTotal.toFixed(2));
    setIsEditingDeclaredPdfTotal(false);
    showToast(`PDF declared total synchronized to BOQ figure (RM ${formatCurrency(grandTotal)}) ✓`);
  };

  const handleSaveCustomDeclaredTotal = () => {
    if (!commercialPdf) return;
    const parsed = parseFloat(customDeclaredTotalInput.replace(/,/g, ''));
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid numeric value for the PDF declared total.');
      return;
    }
    setCommercialPdf({
      ...commercialPdf,
      declaredTotal: parsed,
    });
    setIsEditingDeclaredPdfTotal(false);
    if (Math.abs(parsed - grandTotal) < 0.01) {
      showToast('Official quotation figure matches BOQ total exactly.');
    } else {
      showToast('Notice: Price mismatch detected between PDF and BOQ table.');
    }
  };

  const handleSaveDraft = () => {
    showToast('Draft submission & uploaded documents saved to local secure vault.');
  };

  const handleOpenSubmitModal = () => {
    if (!commercialPdf) {
      showToast('Error: Please upload your Official Commercial Quotation (PDF) before submitting.');
      return;
    }
    if (!complianceChecked) {
      showToast('Please confirm the technical compliance declaration in Envelope 1.');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);

    const bqEntries = [
      { itemId: 'bq_101', unitPrice: prices.item_1 || 3500, totalAmount: (prices.item_1 || 3500) * 50 },
      { itemId: 'bq_102', unitPrice: prices.item_2 || 1200, totalAmount: (prices.item_2 || 1200) * 50 },
      { itemId: 'bq_103', unitPrice: prices.item_3 || 15000, totalAmount: (prices.item_3 || 15000) * 1 },
    ];

    submitBid({
      tenderId: currentTender.id,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      companyName: currentUser.companyName,
      vendorId: currentUser.vendorId || 'V-88219',
      cidbGrade: currentUser.cidbGrade || 'CIDB G7',
      ssmRegistration: currentUser.ssmNumber || '201401039821',
      technicalProposalFileName: technicalFile?.name || 'Technical_Proposal_SyarikatABC_v2.pdf',
      technicalProposalFileSize: technicalFile?.size || '2.4 MB',
      ssmFileName: ssmFile?.name || 'SSM_CIDB_G7_SyarikatABC_Merged.pdf',
      cidbFileName: ssmFile?.name || 'CIDB_G7_SyarikatABC_exp2027.pdf',
      complianceDeclared: complianceChecked,
      commercialProposalFileName: commercialPdf?.name || 'Official_Commercial_Prop_ABC.pdf',
      commercialProposalFileSize: commercialPdf?.size || '1.85 MB',
      commercialPdfDeclaredTotal: commercialPdf?.declaredTotal,
      isCommercialPdfMatched: isPriceMatch,
      pricingValidityAgreed: true,
      bqEntries,
      subtotal,
      sstAmount: sst,
      grandTotal,
    });

    setIsSubmitted(true);
    setReceiptToken(`MP-ENC-${Math.random().toString(16).substring(2, 6).toUpperCase()}`);
    showToast('Bid successfully encrypted (AES-256) and submitted!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleEditResubmit = () => {
    if (isSubmitted) {
      setIsSubmitted(false);
      showToast('Edit mode enabled. You may update figures or replace documents.');
    } else {
      handleOpenSubmitModal();
    }
  };

  return (
    <div className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative pb-32">
      {/* Back Navigation & Action Bar */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveNavTab('active-tenders');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-sm font-semibold text-slate-600 hover:text-navy-800 flex items-center gap-2 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs hover:bg-slate-50 cursor-pointer"
        >
          <i className="ph-bold ph-arrow-left"></i>
          <span>Back to Active Tenders List</span>
        </button>

        <button
          type="button"
          onClick={() => setIsQaOpen(true)}
          className="text-sm font-bold text-navy-800 bg-white border border-navy-300 hover:bg-navy-50 px-4 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <i className="ph-fill ph-chats-circle text-mpRed text-lg"></i>
          <span>Ask Clarification / Submit Q&amp;A</span>
        </button>
      </div>

      {/* Dynamic Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              {currentTender.submissionType}
            </span>
            <span className="text-sm text-slate-500 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {currentTender.referenceNo}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {currentTender.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Supplier / Bidder: <strong className="text-slate-800">{currentUser.companyName}</strong></span>
            <span>•</span>
            <span>Representative: <strong className="text-slate-800">{currentUser.name}</strong></span>
          </p>
        </div>

        <div className="bg-navy-900 text-white rounded-lg p-3 shadow-inner flex flex-col items-center shrink-0 w-full md:w-auto border border-navy-700">
          <span className="text-[10px] text-slate-300 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
            <i className="ph-fill ph-clock-countdown text-mpRed"></i> Closing Deadline
          </span>
          <div className="font-mono text-lg sm:text-xl font-semibold tracking-wide">
            <span className="text-mpRed">06</span>
            <span className="text-slate-400 text-sm">D</span> : <span>14</span>
            <span className="text-slate-400 text-sm">H</span> : <span>22</span>
            <span className="text-slate-400 text-sm">M</span>
          </div>
        </div>
      </div>

      {/* Submission Success Banner */}
      {isSubmitted && (
        <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <i className="ph-fill ph-check-circle text-3xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-emerald-950 font-bold text-base">Bid Successfully Submitted &amp; Sealed!</h3>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Submitted ✓</span>
              </div>
              <p className="text-emerald-800 text-xs sm:text-sm mt-1">
                {currentUser.companyName} has submitted a formal tender proposal amounting to{' '}
                <strong className="font-mono font-bold text-emerald-950">RM {formatCurrency(grandTotal)}</strong>.
                Official Receipt Token: <strong className="font-mono font-bold">{receiptToken}</strong>.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-emerald-900">
                <span className="flex items-center gap-1 font-semibold">
                  <i className="ph-bold ph-file-pdf text-red-600"></i>
                  Quotation PDF: {commercialPdf?.name || 'Attached'}
                </span>
                <span>•</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Price Matched: RM {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => showToast(`Official digital receipt token (${receiptToken}) copied to clipboard.`)}
              className="w-full sm:w-auto bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="ph ph-file-text"></i>
              <span>Digital Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveNavTab('active-tenders')}
              className="w-full sm:w-auto bg-navy-800 hover:bg-navy-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Tenders</span>
              <i className="ph-bold ph-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Stacked Two-Envelope Layout */}
      <div className="flex flex-col space-y-8">
        {/* ENVELOPE 1: TECHNICAL & COMPLIANCE */}
        <div className="w-full relative">
          <div
            className={`absolute -top-3 left-4 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-xs z-10 flex items-center gap-1 ${
              isSubmitted
                ? 'bg-emerald-500 text-white border border-emerald-600'
                : 'bg-amber-400 text-amber-900 border border-amber-200'
            }`}
          >
            {isSubmitted ? (
              <>
                <i className="ph-bold ph-check"></i> Envelope 1: Submitted
              </>
            ) : (
              <>
                <i className="ph-fill ph-circle-notch animate-spin"></i> Envelope 1: In Progress
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden h-full">
            <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-navy-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Technical &amp; Compliance Envelope
                  </h3>
                  <p className="text-xs text-slate-500">
                    Non-financial documents evaluated strictly before commercial opening.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md">
                Unsealed at Stage 1
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* RFP Documents Reference */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-xs font-bold text-blue-900 mb-3 uppercase tracking-wider flex items-center gap-1">
                  <i className="ph-fill ph-download-simple text-blue-600 text-sm"></i>
                  <span>Official Downloaded Tender Documents</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => showToast('Downloading Tender_RFP_Brief.pdf...')}
                    className="flex items-center text-xs p-2 rounded bg-white border border-blue-200 text-slate-700 shadow-xs cursor-pointer hover:bg-blue-50/40 transition-colors"
                  >
                    <i className="ph-fill ph-file-pdf text-red-500 mr-2 text-base"></i>
                    <span>Tender_RFP_Brief.pdf</span>
                  </div>
                  <div
                    onClick={() => showToast('Downloading Technical_Requirements_Specs.pdf...')}
                    className="flex items-center text-xs p-2 rounded bg-white border border-purple-200 text-slate-700 shadow-xs cursor-pointer hover:bg-purple-50/40 transition-colors"
                  >
                    <i className="ph-fill ph-ruler text-purple-500 mr-2 text-base"></i>
                    <span>Technical_Requirements_Specs.pdf</span>
                  </div>
                </div>
              </div>

              {/* Technical Proposal Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Technical Proposal (PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  ref={technicalFileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleTechnicalPdfUpload(e.target.files[0])}
                />
                {technicalFile ? (
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="ph-fill ph-file-pdf text-2xl text-red-500"></i>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{technicalFile.name}</p>
                        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <i className="ph-bold ph-check"></i> Uploaded ({technicalFile.size}) • {technicalFile.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => technicalFileInputRef.current?.click()}
                        className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTechnicalFile(null);
                          showToast('Technical proposal removed.');
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 bg-white rounded shadow-xs border border-slate-200 cursor-pointer"
                        title="Remove file"
                      >
                        <i className="ph ph-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => technicalFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsTechnicalDragOver(true);
                    }}
                    onDragLeave={() => setIsTechnicalDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsTechnicalDragOver(false);
                      if (e.dataTransfer.files?.[0]) handleTechnicalPdfUpload(e.dataTransfer.files[0]);
                    }}
                    className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      isTechnicalDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <i className="ph ph-upload-simple text-2xl text-slate-400 mb-1"></i>
                    <p className="text-sm font-semibold text-navy-800">Click to upload Technical Proposal</p>
                    <p className="text-xs text-slate-500">PDF format only (Max 25MB)</p>
                  </div>
                )}
              </div>

              {/* Company Registration (SSM & CIDB - Merged PDF) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Company Registration (SSM &amp; CIDB - Merged PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  ref={ssmFileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleSsmPdfUpload(e.target.files[0])}
                />
                {ssmFile ? (
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="ph-fill ph-file-pdf text-2xl text-red-500"></i>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{ssmFile.name}</p>
                        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <i className="ph-bold ph-check"></i> Merged SSM Certificate &amp; CIDB Card Verified ({ssmFile.size})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => ssmFileInputRef.current?.click()}
                        className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSsmFile(null);
                          showToast('Registration PDF removed.');
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 bg-white rounded shadow-xs border border-slate-200 cursor-pointer"
                        title="Remove file"
                      >
                        <i className="ph ph-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => ssmFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsSsmDragOver(true);
                    }}
                    onDragLeave={() => setIsSsmDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsSsmDragOver(false);
                      if (e.dataTransfer.files?.[0]) handleSsmPdfUpload(e.dataTransfer.files[0]);
                    }}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      isSsmDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="h-10 w-10 bg-white rounded-full shadow-xs flex items-center justify-center text-slate-400 mb-2">
                      <i className="ph ph-upload-simple text-xl"></i>
                    </div>
                    <p className="text-sm font-semibold text-navy-800">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">PDF format only (Max 10MB)</p>
                  </div>
                )}
              </div>

              {/* Compliance Declaration Checkbox */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={complianceChecked}
                    onChange={(e) => setComplianceChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-mpRed border-slate-300 rounded focus:ring-mpRed cursor-pointer accent-mpRed"
                  />
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                    I hereby declare that all technical specifications proposed meet or exceed the mandatory requirements outlined in the official RFP document.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ENVELOPE 2: FINANCIAL / COMMERCIAL SUBMISSION */}
        <div className="w-full relative">
          <div
            className={`absolute -top-3 left-4 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md z-10 flex items-center gap-1 ${
              isSubmitted
                ? 'bg-emerald-600 text-white border border-emerald-700'
                : 'bg-navy-800 text-white border border-navy-600'
            }`}
          >
            {isSubmitted ? (
              <>
                <i className="ph-fill ph-shield-check"></i> Envelope 2: Encrypted ✓
              </>
            ) : (
              <>
                <i className="ph-fill ph-lock-key text-slate-300"></i> Envelope 2: AES-256 Vaulted
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden h-full">
            <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-mpRed text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    Financial &amp; Commercial Submission Envelope (Sebut Harga)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Encrypted upon submission. Locked until Governance unseals at Commercial Stage.
                  </p>
                </div>
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200 flex items-center gap-1.5 shadow-xs w-fit">
                <i className="ph-fill ph-shield-check text-base"></i>
                <span>AES-256 Protocol Active</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* Section A: Digital Pricing Table / BOQ */}
              {!isRfpType ? (
                <div>
                  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <i className="ph-bold ph-table text-navy-700"></i>
                        <span>Digital Line-by-Line Pricing (BOQ Input Boxes)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Fill in your unit prices below. The grand total must strictly match your uploaded Official Quotation PDF.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-navy-50 text-navy-800 px-2.5 py-1 rounded border border-navy-200 self-start sm:self-auto">
                      Grand Total: RM {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-xs mb-6 w-full">
                    <table className="table-fixed w-full border-collapse text-left text-xs sm:text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-3 w-16 text-center">Item</th>
                          <th className="px-4 py-3 w-auto">Description (As per BOQ)</th>
                          <th className="px-4 py-3 w-20 text-center">Qty</th>
                          <th className="px-4 py-3 w-40 text-right">Unit Price (MYR)</th>
                          <th className="px-4 py-3 w-44 text-right bg-slate-200/50">Total Amount (MYR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-slate-400">1</td>
                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-normal">
                            High-Performance Laptop i7/16GB RAM
                          </td>
                          <td className="px-4 py-3 text-center font-bold bg-slate-50/50">50</td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              disabled={isSubmitted}
                              value={prices.item_1}
                              onChange={(e) => handlePriceChange('item_1', e.target.value)}
                              className={`w-28 text-right border border-slate-300 rounded px-2 py-1 text-sm outline-none font-mono font-medium ${
                                isSubmitted
                                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                  : 'focus:ring-2 focus:ring-navy-500'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold bg-slate-50 text-slate-900">
                            {formatCurrency((prices.item_1 || 0) * 50)}
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-slate-400">2</td>
                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-normal">
                            27-inch 4K Professional Monitor
                          </td>
                          <td className="px-4 py-3 text-center font-bold bg-slate-50/50">50</td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              disabled={isSubmitted}
                              value={prices.item_2}
                              onChange={(e) => handlePriceChange('item_2', e.target.value)}
                              className={`w-28 text-right border border-slate-300 rounded px-2 py-1 text-sm outline-none font-mono font-medium ${
                                isSubmitted
                                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                  : 'focus:ring-2 focus:ring-navy-500'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold bg-slate-50 text-slate-900">
                            {formatCurrency((prices.item_2 || 0) * 50)}
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-slate-400">3</td>
                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-normal">
                            On-site Support &amp; Warranty (3 Years)
                          </td>
                          <td className="px-4 py-3 text-center font-bold bg-slate-50/50">1</td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              disabled={isSubmitted}
                              value={prices.item_3}
                              onChange={(e) => handlePriceChange('item_3', e.target.value)}
                              className={`w-28 text-right border border-slate-300 rounded px-2 py-1 text-sm outline-none font-mono font-medium ${
                                isSubmitted
                                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                  : 'focus:ring-2 focus:ring-navy-500'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold bg-slate-50 text-slate-900">
                            {formatCurrency((prices.item_3 || 0) * 1)}
                          </td>
                        </tr>
                      </tbody>

                      <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-slate-800">
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-right font-semibold text-xs text-slate-500">
                            Subtotal Before Tax
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-bold">
                            RM {formatCurrency(subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-right font-semibold text-xs text-slate-500">
                            SST (6%)
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-slate-600">
                            RM {formatCurrency(sst)}
                          </td>
                        </tr>
                        <tr className="bg-navy-50">
                          <td
                            colSpan={4}
                            className="px-4 py-3 text-right font-bold text-navy-900 uppercase tracking-wider text-xs"
                          >
                            Grand Total Bid Value (MYR)
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-extrabold text-navy-900 text-base">
                            RM {formatCurrency(grandTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                /* Advisory / RFP Fee Structure */
                <div className="space-y-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-bold text-slate-800">
                      Phased Advisory Fee Structure (Required)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide fixed milestone breakdown as requested in the RFP terms.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Phase 1: Strategic Assessment
                      </label>
                      <input
                        type="number"
                        defaultValue={150000}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Phase 2: Execution &amp; Advisory Fee
                      </label>
                      <input
                        type="number"
                        defaultValue={650000}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section B: Official Commercial Quotation (Sebut Harga) PDF Upload Box */}
              <div className="pt-2 border-t border-slate-200">
                <div className="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-mpRed text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                        Mandatory
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        Official Commercial Quotation / Sebut Harga Rasmi (PDF)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload your formal price quotation on company letterhead signed by authorized personnel.
                      The total figure in this PDF <strong className="text-slate-800">must match the Grand Total of RM {formatCurrency(grandTotal)}</strong> filled in above.
                    </p>
                  </div>

                  {commercialPdf && (
                    <button
                      type="button"
                      onClick={() => setIsPreviewPdfModalOpen(true)}
                      className="text-xs font-semibold px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <i className="ph-bold ph-eye"></i>
                      <span>Preview Quotation PDF</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={commercialFileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleCommercialPdfUpload(e.target.files[0])}
                />

                {/* Upload Zone (Dashed box matching the user image) */}
                {!commercialPdf ? (
                  <div
                    onClick={() => commercialFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsCommercialDragOver(true);
                    }}
                    onDragLeave={() => setIsCommercialDragOver(false)}
                    onDrop={handleCommercialDrop}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                      isCommercialDragOver
                        ? 'border-mpRed bg-red-50/50 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center text-mpRed mb-3 border border-slate-200">
                      <i className="ph-bold ph-upload-simple text-2xl"></i>
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to upload or drag and drop official quotation
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Official Sebut Harga in PDF format only (Max 15MB)
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Or quick-test with:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCommercialPdf({
                            name: 'SebutHarga_Rasmi_SyarikatABC_Ref889.pdf',
                            size: '1.85 MB',
                            uploadedAt: 'Just now',
                            declaredTotal: grandTotal,
                            sha256: 'a98f12c5b369da218d6e3c09b82142e0fa532891d4e782bc41238910fedcba45',
                            quotationRef: 'QUO-ABC-2026-MP088',
                            signatoryName: currentUser.name,
                          });
                          setCustomDeclaredTotalInput(grandTotal.toFixed(2));
                          showToast('Sample Official Quotation attached.');
                        }}
                        className="text-xs font-semibold text-navy-800 bg-white px-2.5 py-1 rounded border border-navy-200 hover:bg-navy-50 shadow-2xs"
                      >
                        SebutHarga_Rasmi_SyarikatABC.pdf
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Uploaded File Details Card */
                  <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 shrink-0">
                          <i className="ph-fill ph-file-pdf text-2xl"></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{commercialPdf.name}</p>
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Encrypted Slot
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>File Size: {commercialPdf.size}</span>
                            <span>•</span>
                            <span>Uploaded: {commercialPdf.uploadedAt}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">Ref: {commercialPdf.quotationRef}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => commercialFileInputRef.current?.click()}
                          className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <i className="ph ph-arrow-counter-clockwise"></i>
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCommercialPdf(null);
                            showToast('Quotation PDF removed. Please upload an official file before submitting.');
                          }}
                          className="text-slate-400 hover:text-red-600 p-1.5 bg-white rounded-lg shadow-2xs border border-slate-200 cursor-pointer"
                          title="Remove file"
                        >
                          <i className="ph ph-trash"></i>
                        </button>
                      </div>
                    </div>

                    {/* Cryptographic SHA-256 Pre-vault Fingerprint */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <i className="ph-fill ph-lock-key text-emerald-600"></i>
                        <span>SHA-256 Checksum:</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-700 truncate max-w-md bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {commercialPdf.sha256}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section C: Cross-Verification & Price Matching Status Box */}
              {commercialPdf && (
                <div
                  className={`rounded-xl border p-4 sm:p-5 transition-all ${
                    isPriceMatch
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPriceMatch
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        <i
                          className={`text-xl ${
                            isPriceMatch ? 'ph-bold ph-check' : 'ph-bold ph-warning'
                          }`}
                        ></i>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm sm:text-base">
                            {isPriceMatch
                              ? 'Official Quotation Matched with BOQ Form Total ✓'
                              : 'Commercial Price Discrepancy Detected ⚠️'}
                          </h5>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                              isPriceMatch
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {isPriceMatch ? 'Verified 100%' : 'Mismatch'}
                          </span>
                        </div>

                        <p className="text-xs mt-1 leading-relaxed">
                          {isPriceMatch ? (
                            <span>
                              The total declared in <strong className="font-mono">{commercialPdf.name}</strong>{' '}
                              (<strong>RM {formatCurrency(commercialPdf.declaredTotal)}</strong>) matches the
                              digital BOQ Grand Total (<strong>RM {formatCurrency(grandTotal)}</strong>) exactly.
                              Discrepancy: <strong className="font-mono">RM 0.00</strong>.
                            </span>
                          ) : (
                            <span>
                              Declared in PDF: <strong className="font-mono">RM {formatCurrency(commercialPdf.declaredTotal)}</strong> vs{' '}
                              Digital BOQ Total: <strong className="font-mono">RM {formatCurrency(grandTotal)}</strong>.{' '}
                              Variance difference of{' '}
                              <strong className="font-mono text-red-700">
                                RM {formatCurrency(priceDiscrepancy)}
                              </strong>
                              . Under Media Prima guidelines, both figures must reconcile before sealing.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Quick Alignment / Adjustment Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-start md:self-center">
                      {!isPriceMatch && (
                        <button
                          type="button"
                          onClick={handleSyncPdfToBoq}
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <i className="ph-bold ph-arrows-clockwise"></i>
                          <span>Sync PDF to BOQ (RM {formatCurrency(grandTotal)})</span>
                        </button>
                      )}

                      {!isEditingDeclaredPdfTotal ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomDeclaredTotalInput(commercialPdf.declaredTotal.toFixed(2));
                            setIsEditingDeclaredPdfTotal(true);
                          }}
                          className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <i className="ph ph-pencil-simple"></i>
                          <span>Adjust Declared PDF Figure</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-300 shadow-xs">
                          <span className="text-xs font-mono font-bold text-slate-500 pl-1">RM</span>
                          <input
                            type="number"
                            value={customDeclaredTotalInput}
                            onChange={(e) => setCustomDeclaredTotalInput(e.target.value)}
                            className="w-28 text-xs font-mono border-0 outline-none p-1"
                            placeholder="Declared Total"
                          />
                          <button
                            type="button"
                            onClick={handleSaveCustomDeclaredTotal}
                            className="px-2 py-1 bg-navy-800 text-white rounded text-xs font-bold hover:bg-navy-900 cursor-pointer"
                          >
                            Set
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingDeclaredPdfTotal(false)}
                            className="text-slate-400 hover:text-slate-600 px-1"
                          >
                            <i className="ph ph-x"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Envelope Status:</span>
            <span className="inline-flex items-center gap-1 font-bold text-slate-800">
              <i className="ph-fill ph-file-text text-blue-600"></i> Envelope 1 Ready
            </span>
            <span>•</span>
            <span className={`inline-flex items-center gap-1 font-bold ${
              commercialPdf && isPriceMatch ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              <i className={`ph-fill ${commercialPdf && isPriceMatch ? 'ph-check-circle' : 'ph-warning'}`}></i>
              Envelope 2: {commercialPdf ? (isPriceMatch ? 'Price Matched ✓' : 'Discrepancy ⚠️') : 'PDF Missing'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border-2 border-navy-200 text-navy-800 font-bold rounded-lg hover:bg-navy-50 transition-colors text-sm shadow-xs order-2 sm:order-1 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleToggleEditResubmit}
              className={`w-full sm:w-auto px-8 py-2.5 text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-md order-1 sm:order-2 cursor-pointer ${
                isSubmitted
                  ? 'bg-navy-800 hover:bg-navy-900'
                  : 'bg-mpRed hover:bg-red-700'
              }`}
            >
              {isSubmitted ? (
                <>
                  <i className="ph-bold ph-pencil-simple text-lg"></i>
                  <span>Edit / Resubmit Bid</span>
                </>
              ) : (
                <>
                  <i className="ph-fill ph-lock-key text-lg"></i>
                  <span>Finalize &amp; Submit Encrypted Bid</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Official Quotation PDF Preview Modal */}
      {isPreviewPdfModalOpen && commercialPdf && (
        <div className="fixed inset-0 z-[160] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-slide-up flex flex-col max-h-[90vh]">
            <div className="bg-navy-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ph-fill ph-file-pdf text-red-400 text-xl"></i>
                <h3 className="font-bold text-sm sm:text-base">
                  Document Preview: {commercialPdf.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewPdfModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <i className="ph ph-x text-lg"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-grow font-sans text-slate-800">
              {/* Company Letterhead Simulated Sheet */}
              <div className="bg-white border border-slate-300 p-8 rounded-lg shadow-sm space-y-6">
                <div className="border-b-2 border-navy-800 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black tracking-wide text-navy-900 uppercase">
                      {currentUser.companyName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Co. Reg: {currentUser.ssmNumber || '201401039821 (1094321-X)'} • CIDB Grade: {currentUser.cidbGrade || 'G7'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Level 12, Menara Tech, Jalan Tun Razak, 50400 Kuala Lumpur
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">
                      OFFICIAL QUOTATION
                    </span>
                    <span className="text-sm font-mono font-bold text-mpRed">
                      {commercialPdf.quotationRef}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Date: 29 September 2026</p>
                  </div>
                </div>

                <div className="text-xs space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                  <p><strong className="text-slate-700">Client:</strong> Media Prima Berhad • Group Procurement Division</p>
                  <p><strong className="text-slate-700">Tender Reference:</strong> {currentTender.referenceNo}</p>
                  <p><strong className="text-slate-700">Tender Title:</strong> {currentTender.title}</p>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-b">No.</th>
                      <th className="p-2 border-b">Item Description</th>
                      <th className="p-2 border-b text-center">Qty</th>
                      <th className="p-2 border-b text-right">Unit (MYR)</th>
                      <th className="p-2 border-b text-right">Total (MYR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 text-center text-slate-400">1</td>
                      <td className="p-2 font-medium">High-Performance Laptop i7/16GB RAM</td>
                      <td className="p-2 text-center">50</td>
                      <td className="p-2 text-right font-mono">{formatCurrency(prices.item_1)}</td>
                      <td className="p-2 text-right font-mono font-semibold">{formatCurrency(prices.item_1 * 50)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center text-slate-400">2</td>
                      <td className="p-2 font-medium">27-inch 4K Professional Monitor</td>
                      <td className="p-2 text-center">50</td>
                      <td className="p-2 text-right font-mono">{formatCurrency(prices.item_2)}</td>
                      <td className="p-2 text-right font-mono font-semibold">{formatCurrency(prices.item_2 * 50)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center text-slate-400">3</td>
                      <td className="p-2 font-medium">On-site Support &amp; Warranty (3 Years)</td>
                      <td className="p-2 text-center">1</td>
                      <td className="p-2 text-right font-mono">{formatCurrency(prices.item_3)}</td>
                      <td className="p-2 text-right font-mono font-semibold">{formatCurrency(prices.item_3 * 1)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold border-t">
                    <tr>
                      <td colSpan={4} className="p-2 text-right text-slate-600">Subtotal Before SST:</td>
                      <td className="p-2 text-right font-mono">RM {formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-2 text-right text-slate-600">Sales &amp; Service Tax (6% SST):</td>
                      <td className="p-2 text-right font-mono">RM {formatCurrency(sst)}</td>
                    </tr>
                    <tr className="bg-navy-900 text-white font-bold">
                      <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider text-xs">
                        Declared Quotation Total:
                      </td>
                      <td className="p-2.5 text-right font-mono text-sm">
                        RM {formatCurrency(commercialPdf.declaredTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Signatory Stamp */}
                <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500">
                    <p>• Validity Period: 90 days from tender closing date</p>
                    <p>• Delivery: 4 weeks upon issuance of official PO</p>
                  </div>
                  <div className="text-center w-48">
                    <div className="h-12 border-b border-dashed border-slate-400 flex items-center justify-center text-slate-300 italic text-xs">
                      [Digitally Signed &amp; Sealed]
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{commercialPdf.signatoryName}</p>
                    <p className="text-[10px] text-slate-500">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Matches BOQ Form:{' '}
                <strong className={isPriceMatch ? 'text-emerald-700' : 'text-amber-600'}>
                  {isPriceMatch ? 'Yes (100% Reconciled)' : 'Mismatch Detected'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewPdfModalOpen(false)}
                className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg text-xs hover:bg-navy-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AES-256 Submission Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="bg-mpRed p-4 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <i className="ph-fill ph-shield-check text-xl"></i>
                <span>Confirm Bid Submission</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <i className="ph ph-x text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 font-medium text-sm leading-relaxed mb-4">
                Are you sure you want to finalize and submit this bid for{' '}
                <strong className="text-slate-900">{currentTender.referenceNo}</strong>?
              </p>

              {/* Price Match Audit Summary in Confirmation */}
              <div
                className={`p-3 rounded-lg border mb-4 text-xs ${
                  isPriceMatch
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Grand Total Bid:</span>
                  <span className="font-mono text-sm">RM {formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Quotation PDF Attached:</span>
                  <span className="font-semibold truncate max-w-[180px]">{commercialPdf?.name}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-0.5">
                  <span>Reconciliation Status:</span>
                  <span className="font-bold">
                    {isPriceMatch ? 'Exact Match (RM 0.00 variance) ✓' : `Mismatch: RM ${formatCurrency(priceDiscrepancy)} ⚠️`}
                  </span>
                </div>
              </div>

              {!isPriceMatch && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg mb-4 text-xs text-red-800">
                  <strong>Warning:</strong> You are submitting with an unresolved discrepancy between your uploaded PDF and the digital BOQ table.
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-3 mb-6">
                <i className="ph-fill ph-lock-key text-navy-600 text-xl shrink-0 mt-0.5"></i>
                <p className="text-xs text-slate-600 leading-snug">
                  Your Financial Envelope will be <strong className="text-navy-900">AES-256 Encrypted</strong> and remain locked to all parties (including Media Prima Procurement) until the official Tender Opening Date.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="px-5 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 text-sm flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Encrypt &amp; Submit</span>
                  <i className="ph-bold ph-paper-plane-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Q&A Drawer */}
      <QaDrawer isOpen={isQaOpen} onClose={() => setIsQaOpen(false)} />
    </div>
  );
};
