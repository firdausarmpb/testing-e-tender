import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { ClarificationQuestion } from '../types/tender';

export const ClarificationDeskView: React.FC = () => {
  const {
    currentTender,
    currentTenderId,
    setCurrentTenderId,
    tenders,
    clarifications,
    submitClarification,
  } = useTender();

  const [category, setCategory] = useState<ClarificationQuestion['category']>('tech');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const [confirmedFairness, setConfirmedFairness] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tech' | 'boq' | 'gen'>('all');
  const [submitToast, setSubmitToast] = useState<string | null>(null);

  // Filter clarifications by current tender
  const tenderClarifications = clarifications.filter(
    (c) => c.tenderId === currentTenderId || currentTenderId === 'MP-IT-2026-001'
  );

  const filteredClarifications = tenderClarifications.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'tech') return c.category === 'tech';
    if (activeFilter === 'boq') return c.category === 'boq';
    if (activeFilter === 'gen') return c.category === 'gen' || c.category === 'legal' || c.category === 'sub';
    return true;
  });

  const categoryLabels: Record<ClarificationQuestion['category'], string> = {
    tech: 'Technical Specifications & Architecture',
    boq: 'Bill of Quantities (BOQ) & Financial Scope',
    legal: 'Legal, Contract Terms & Compliance',
    sub: 'Submission Procedures & Envelopes',
    gen: 'General Query',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;

    submitClarification({
      tenderId: currentTender.id,
      category,
      categoryLabel: categoryLabels[category],
      subject: subject.trim(),
      details: details.trim(),
      attachmentName,
    });

    setSubmitToast('Clarification successfully dispatched to Procurement Evaluation Panel. Audit ticket logged.');
    setTimeout(() => setSubmitToast(null), 4000);

    // Reset Form
    setSubject('');
    setDetails('');
    setAttachmentName(undefined);
    setConfirmedFairness(false);
  };

  const handleDownloadDigest = () => {
    let digest = `MEDIA PRIMA BERHAD - eTENDER PORTAL\nOFFICIAL CIRCULARS & TECHNICAL CLARIFICATION DIGEST\n`;
    digest += `Tender Dossier: ${currentTender.referenceNo} - ${currentTender.title}\n`;
    digest += `Export Date: ${new Date().toLocaleString('en-MY')}\n`;
    digest += `Integrity Protocol: ISO/IEC 20400 Compliant\n\n`;
    digest += `=========================================================================\n\n`;

    tenderClarifications.forEach((c, idx) => {
      digest += `[CIRCULAR ${idx + 1}] Reference: ${c.circularRef || c.trackingRef}\n`;
      digest += `Category: ${c.categoryLabel} | Date: ${c.submittedAt}\n`;
      digest += `Question: ${c.subject}\n`;
      digest += `Details: ${c.details}\n`;
      if (c.officialAnswer) {
        digest += `Official Response: ${c.officialAnswer}\n`;
        digest += `Responded By: ${c.smeResponder?.name || 'Procurement SME'} (${c.smeResponder?.designation || ''})\n`;
      } else {
        digest += `Status: Under Active SME Review\n`;
      }
      digest += `\n-------------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([digest], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MediaPrima_Q&A_Digest_${currentTender.referenceNo}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Dynamic Top Ambient Accent */}
      <div className="relative w-full overflow-hidden px-margin pt-space-lg pb-space-md">
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-12 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

        {/* Page Header & Tender Context Ribbon */}
        <div className="relative flex flex-col gap-space-md max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm uppercase tracking-wider font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Official Communication Channel
                </span>
                <span className="text-outline-variant text-[12px]">•</span>
                <span className="font-code-sm text-on-surface-variant font-medium">
                  ISO/IEC 20400 Integrity Protocol
                </span>
              </div>
              <h1 className="font-headline-xl text-on-surface tracking-tight">
                Tender Clarification &amp; Technical Q&amp;A Desk
              </h1>
              <p className="font-body-lg text-on-surface-variant leading-relaxed">
                Direct official communication channel between registered bidders and Media Prima Procurement &amp; Subject Matter Experts (SME).
              </p>
            </div>

            {/* Quick Summary Metrics Bar */}
            <div className="flex items-center gap-space-sm bg-white p-2 rounded-2xl shadow-xs border border-outline-variant/30">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-surface-container-low rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-on-surface-variant leading-tight">
                    Published Circulars
                  </span>
                  <span className="font-headline-sm font-bold text-on-surface leading-tight">
                    02 Bulletins
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-3 py-1.5 bg-surface-container-low rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-on-surface-variant leading-tight">
                    Avg SME Response
                  </span>
                  <span className="font-headline-sm font-bold text-on-surface leading-tight">
                    &lt; 18.4 Hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tender Reference Selector Bar */}
          <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md mt-2">
            <div className="flex flex-1 items-center gap-space-md min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[22px]">source_notes</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Tender Dossier
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-fixed font-label-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Active Q&amp;A Period (Closes 48h before deadline)
                  </span>
                </div>
                <div className="relative mt-1">
                  <select
                    value={currentTenderId}
                    onChange={(e) => setCurrentTenderId(e.target.value)}
                    className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm font-semibold rounded-xl px-3 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer border border-outline-variant/20"
                  >
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.referenceNo} - {t.title}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Timelines Box */}
            <div className="flex items-center gap-4 shrink-0 bg-surface-container-low/70 px-4 py-2.5 rounded-xl border border-outline-variant/20">
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-on-surface-variant font-medium">Q&amp;A Window Cut-off:</span>
                <span className="font-headline-sm font-bold text-on-surface">18 Aug 2026, 17:00 MYT</span>
              </div>
              <div className="h-8 w-px bg-outline-variant/40"></div>
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-on-surface-variant font-medium">Remaining Window:</span>
                <span className="font-headline-sm font-bold text-error flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[18px]">alarm</span> 3 Days 06 Hrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Work Area: 2-Column Split Layout */}
      <div className="w-full px-margin pb-space-xl">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: Submit Clarification Card (5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-space-md sticky top-32">
            <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-sm pb-space-sm border-b border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <h2 className="font-headline-lg font-bold text-on-surface">Submit New Question</h2>
                  </div>
                  <p className="font-body-md text-on-surface-variant mt-1">
                    Formal clarification request submitted directly to procurement evaluator panel.
                  </p>
                </div>
                <span className="p-2 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">help_center</span>
                </span>
              </div>

              {submitToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                  <span>{submitToast}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                {/* Category Selector */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-md font-semibold text-on-surface flex items-center justify-between"
                    htmlFor="clarificationCategory"
                  >
                    <span>Category Scope <span className="text-error">*</span></span>
                    <span className="font-label-sm text-on-surface-variant font-normal">
                      Select accurate domain
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="clarificationCategory"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full h-11 bg-white rounded-xl px-3.5 pr-10 text-on-surface font-body-md shadow-xs border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                      required
                    >
                      <option value="tech">Technical Specifications &amp; Architectural Topology</option>
                      <option value="boq">Bill of Quantities (BOQ) &amp; Financial Scope</option>
                      <option value="legal">Legal, Contract Terms &amp; Compliance</option>
                      <option value="sub">Submission Procedures &amp; Envelope Protocols</option>
                      <option value="gen">General Inquiry</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md font-semibold text-on-surface" htmlFor="questionTitle">
                    Clarification Subject / Specific Clause Reference <span className="text-error">*</span>
                  </label>
                  <input
                    id="questionTitle"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Clause 4.2.1 - Core Switch SFP+ Port Density Requirement"
                    required
                    className="w-full h-11 bg-white rounded-xl px-3.5 text-on-surface font-body-md shadow-xs border border-outline-variant/40 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Question Details Area */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md font-semibold text-on-surface" htmlFor="questionDetails">
                      Question Details <span className="text-error">*</span>
                    </label>
                    <span className="font-label-sm text-on-surface-variant font-medium font-mono">
                      {details.length} / 1200
                    </span>
                  </div>
                  <div className="bg-surface-container-low/60 p-2.5 rounded-xl flex items-start gap-2 text-on-surface-variant border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                      info
                    </span>
                    <p className="font-body-sm leading-tight">
                      <strong className="font-semibold text-on-surface">Guideline:</strong> State specific discrepancies, ambient site constraints, or alternate standard compliance references. Never input commercial bid amounts or proprietary secrets.
                    </p>
                  </div>
                  <textarea
                    id="questionDetails"
                    rows={4}
                    maxLength={1200}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide complete technical context, citing relevant section numbers from RFP Document..."
                    required
                    className="w-full bg-white rounded-xl p-3.5 text-on-surface font-body-md shadow-xs border border-outline-variant/40 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  ></textarea>
                </div>

                {/* File Upload Drop Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md font-semibold text-on-surface flex items-center justify-between">
                    <span>Supporting Attachment (Optional)</span>
                    <span className="font-label-sm text-on-surface-variant">PDF, PNG (Max 5MB)</span>
                  </label>
                  <label className="group relative flex flex-col items-center justify-center p-5 bg-surface-container-low/50 hover:bg-surface-container-high/40 rounded-xl transition-all cursor-pointer text-center border border-dashed border-outline-variant/60">
                    <input
                      type="file"
                      accept=".pdf,.png"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentName(e.target.files[0].name);
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-1.5">
                      <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                    </div>
                    <div className="font-label-md font-semibold text-on-surface">
                      Click to browse or drag component cut-sheet
                    </div>
                    <div className="font-body-sm text-on-surface-variant mt-0.5 text-xs">
                      Component datasheets, schematic topology, or technical compliance proofs only.
                    </div>
                    {attachmentName && (
                      <div className="mt-2.5 px-3 py-1 bg-white rounded-full font-code-sm text-primary font-medium flex items-center gap-1.5 shadow-xs border border-primary/20">
                        <span className="material-symbols-outlined text-[14px]">attach_file</span>
                        <span>{attachmentName}</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Confirmation Checkbox */}
                <div className="bg-surface-container-low/50 p-3.5 rounded-xl flex items-start gap-3 border border-outline-variant/20">
                  <input
                    id="pricingCheck"
                    type="checkbox"
                    checked={confirmedFairness}
                    onChange={(e) => setConfirmedFairness(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <label
                    htmlFor="pricingCheck"
                    className="font-body-sm text-on-surface cursor-pointer select-none leading-snug text-xs"
                  >
                    I strictly confirm this clarification <strong className="font-semibold text-on-surface">does not disclose confidential commercial pricing</strong>, vendor margins, or proprietary IP in violation of Media Prima anti-collusion guidelines.
                  </label>
                </div>

                {/* Submit Action Button */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary-container text-white font-label-md font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    <span>Submit Question to Procurement Desk</span>
                  </button>
                  <span className="font-label-sm text-on-surface-variant text-center">
                    Submissions are logged with cryptographic timestamp &amp; audit tracking ID.
                  </span>
                </div>
              </form>
            </div>

            {/* Bidding Fairness Notice Box */}
            <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 p-space-md flex flex-col gap-3">
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-[20px]">policy</span>
                <span className="font-label-md font-bold uppercase tracking-wider">
                  Bidding Fairness Notice
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant leading-relaxed">
                In accordance with Media Prima Berhad Corporate Integrity Guidelines, all approved technical clarifications and SME responses are anonymized and published to all registered bidders as <strong className="font-semibold text-on-surface">Official Tender Addenda &amp; Circular Bulletins</strong>. This guarantees full transparency and prevents unilateral advantage.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-on-surface-variant font-label-sm">
                <span>SME Desk Lead: Digital Engineering Unit</span>
                <button
                  type="button"
                  onClick={() => alert('Corporate Integrity Guidelines: ISO/IEC 20400 Sustainable Procurement & Zero-Tolerance Anti-Bribery Policy.')}
                  className="text-primary hover:underline font-semibold flex items-center gap-0.5"
                >
                  <span>View Governance Code</span>
                  <span className="material-symbols-outlined text-[14px]">north_east</span>
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Clarification Log & Official Circulars (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-space-md">
            {/* Header Controls & Filter Pills */}
            <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 p-space-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-md font-bold text-on-surface">
                    Clarification Log &amp; Circulars
                  </span>
                  <span className="bg-primary/10 text-primary font-code-sm font-semibold px-2.5 py-0.5 rounded-full">
                    {tenderClarifications.length} Items
                  </span>
                </div>
                <span className="font-body-sm text-on-surface-variant">
                  Real-time status of submitted queries and official bulletins.
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-label-sm font-semibold transition-all ${
                    activeFilter === 'all'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All ({tenderClarifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('tech')}
                  className={`px-3 py-1.5 rounded-lg font-label-sm font-semibold transition-all ${
                    activeFilter === 'tech'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Technical Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('boq')}
                  className={`px-3 py-1.5 rounded-lg font-label-sm font-semibold transition-all ${
                    activeFilter === 'boq'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Commercial / BOQ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('gen')}
                  className={`px-3 py-1.5 rounded-lg font-label-sm font-semibold transition-all ${
                    activeFilter === 'gen'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  General
                </button>
              </div>
            </div>

            {/* Clarification Cards List */}
            <div className="flex flex-col gap-space-md">
              {filteredClarifications.map((item) => {
                const isUnderReview = item.status === 'under_review';
                const isDirective = item.status === 'procurement_directive';
                const isAddendum = item.status === 'official_addendum';

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 p-space-lg flex flex-col gap-space-md hover:shadow-sm transition-shadow"
                  >
                    {/* Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-space-sm border-b border-outline-variant/30">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm font-semibold">
                          {item.categoryLabel}
                        </span>
                        <span className="text-outline-variant">•</span>
                        <span className="font-code-sm text-on-surface-variant">
                          Ref: {item.circularRef || item.trackingRef}
                        </span>
                        <span className="text-outline-variant">•</span>
                        <span className="font-body-sm text-on-surface-variant">
                          {item.submittedAt}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm font-semibold">
                        {isUnderReview ? (
                          <span className="bg-error-container/40 text-on-error-container px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                            <span>Under SME Review (Target response within 24h)</span>
                          </span>
                        ) : isDirective ? (
                          <span className="bg-secondary-container/40 text-on-secondary-fixed px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-secondary/20">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Procurement Directive Issued</span>
                          </span>
                        ) : (
                          <span className="bg-secondary-container/40 text-on-secondary-fixed px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-secondary/20">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Official Addendum Published</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Block */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-on-surface">
                        <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-label-sm font-bold text-on-surface shrink-0">
                          Q
                        </span>
                        <h3 className="font-headline-sm font-bold text-on-surface leading-snug">
                          {item.subject}
                        </h3>
                      </div>
                      <p className="font-body-md text-on-surface-variant pl-8 leading-relaxed">
                        {item.details}
                      </p>
                    </div>

                    {/* Official Response Block OR Pending Banner */}
                    {item.officialAnswer ? (
                      <div
                        className={`ml-2 sm:ml-6 pl-4 border-l-2 bg-surface-container-low/60 rounded-r-xl p-4 flex flex-col gap-3 ${
                          isDirective ? 'border-secondary' : 'border-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                                isDirective ? 'bg-secondary' : 'bg-primary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isDirective ? 'account_balance' : 'engineering'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-label-md font-bold text-on-surface">
                                {item.smeResponder?.name}
                              </span>
                              <span className="font-body-sm text-on-surface-variant text-[11px]">
                                {item.smeResponder?.designation}
                              </span>
                            </div>
                          </div>

                          <span className="font-code-sm text-xs px-2 py-0.5 rounded bg-white text-primary font-semibold shadow-xs border border-outline-variant/20">
                            Circular Ref: {item.circularRef}
                          </span>
                        </div>

                        <div className="font-body-md text-on-surface leading-relaxed text-xs sm:text-sm">
                          <strong className={isDirective ? 'text-secondary' : 'text-primary'}>
                            {isDirective ? 'Official Procurement Answer:' : 'Official Response:'}{' '}
                          </strong>
                          {item.officialAnswer}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-body-sm text-xs">
                          <div className="flex items-center gap-1.5 text-secondary font-medium">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            <span>Formally binding for all participating bidders</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`Simulated download of signed official circular PDF ${item.circularRef}.pdf`)}
                            className="text-primary hover:text-primary-container font-label-md font-semibold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            <span>Download Addendum Signed PDF</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="ml-2 sm:ml-6 pl-4 border-l-2 border-outline-variant bg-surface-container-low/40 rounded-r-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[20px] text-tertiary">
                            schedule
                          </span>
                          <div className="flex flex-col">
                            <span className="font-label-md font-semibold text-on-surface">
                              Assigned to Network Infrastructure SME
                            </span>
                            <span className="font-body-sm text-on-surface-variant text-xs">
                              Evaluation in progress. Official bulletin update anticipated by 18:00 MYT today.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert('Subscription logged. You will receive an instant notification when this clarification is officially answered.')}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm font-semibold transition-colors flex items-center gap-1 border border-outline-variant/30 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                          <span>Notify When Answered</span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* Clarification Activity Summary Footer Banner */}
            <div className="bg-white rounded-2xl shadow-xs border border-outline-variant/30 p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">history_edu</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md font-semibold text-on-surface">
                    Need an archival digest of all circulars?
                  </span>
                  <span className="font-body-sm text-on-surface-variant">
                    Download consolidated technical circular log including cryptographic hash digest.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadDigest}
                className="w-full sm:w-auto h-10 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                <span>Download Full Digest (.TXT)</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
