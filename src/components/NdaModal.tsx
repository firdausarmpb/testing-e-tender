import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';

interface NdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
}

export const NdaModal: React.FC<NdaModalProps> = ({ isOpen, onClose, tenderId }) => {
  const { currentTender, currentUser, signNda } = useTender();
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [idNumber, setIdNumber] = useState('860412-14-5519');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed) {
      setError('You must confirm acceptance of the confidentiality covenants before proceeding.');
      return;
    }
    if (!fullName.trim() || !idNumber.trim()) {
      setError('Please provide your legal full name and NRIC/Passport identification number.');
      return;
    }

    signNda(tenderId, fullName.trim(), idNumber.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/40">
        {/* Modal Header */}
        <div className="p-6 bg-surface-container-low border-b border-outline-variant/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-sm uppercase tracking-wider font-bold bg-primary text-white px-2 py-0.5 rounded">
                  Mandatory Governance Covenant
                </span>
                <span className="font-code-sm text-on-surface-variant font-semibold">
                  Ref: {currentTender.referenceNo}
                </span>
              </div>
              <h2 className="font-headline-sm font-bold text-on-surface mt-1">
                Digital Non-Disclosure Agreement (NDA) Execution
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSign} className="p-6 overflow-y-auto flex flex-col gap-5 text-body-md">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">lock</span>
            <p className="leading-relaxed">
              <strong>Statutory Requirement (PRD Target 1):</strong> In accordance with Media Prima Corporate Integrity guidelines, 100% of invited bidders must execute this digital NDA prior to unlocking confidential RFP drawings and the Digital Bill of Quantities (BOQ).
            </p>
          </div>

          {/* Legal Covenant Text Scrollbox */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md font-semibold text-on-surface">
              Non-Disclosure & Confidentiality Terms
            </label>
            <div className="h-44 overflow-y-auto p-4 rounded-xl bg-surface-container-low text-xs leading-relaxed text-on-surface border border-outline-variant/30 font-mono whitespace-pre-wrap">
              {currentTender.ndaTermsText || `NON-DISCLOSURE AND PROPRIETARY INFORMATION COVENANT
Tender Dossier Reference: ${currentTender.referenceNo}

1. CONFIDENTIALITY UNDERTAKING: In consideration of receiving tender specifications, network architectural schematics, and commercial pricing models from Media Prima Berhad, the Bidder acknowledges that all documentation provided contains proprietary trade secrets.
2. RESTRICTION ON DISCLOSURE: The Bidder agrees to hold the Confidential Information in strict trust and shall not disclose, replicate, reverse-engineer, or transmit any part thereof to unauthorized third parties without prior written consent from Media Prima Group Procurement.
3. ANTI-COLLUSION & INTEGRITY: The Bidder solemnly certifies that neither it nor its affiliates will communicate pricing or tender strategies with competing bidders.
4. GOVERNING LAW & DIGITAL SIGNATURES: This Agreement is governed by the Digital Signature Act 1997 of Malaysia. Digital signatures and affirmative checkbox seals executed herein are legally binding and admissible in courts of law.`}
            </div>
          </div>

          {/* Signatory Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md font-semibold text-on-surface" htmlFor="legalFullName">
                Authorized Signatory Full Name <span className="text-error">*</span>
              </label>
              <input
                id="legalFullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ahmad Syakir bin Mansur"
                className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md font-semibold text-on-surface" htmlFor="legalIdNumber">
                NRIC / Passport Number <span className="text-error">*</span>
              </label>
              <input
                id="legalIdNumber"
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. 860412-14-5519"
                className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="bg-surface-container-low p-3 rounded-lg text-xs text-on-surface-variant flex items-center justify-between">
            <span>Representing Entity: <strong className="text-on-surface">{currentUser.companyName}</strong></span>
            <span>Vendor ID: <strong className="text-on-surface">{currentUser.vendorId || 'V-88219'}</strong></span>
          </div>

          {/* Affirmation Checkbox */}
          <div className="bg-surface-container rounded-xl p-3.5 flex items-start gap-3">
            <input
              id="ndaCheckbox"
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => {
                setHasAgreed(e.target.checked);
                if (e.target.checked) setError(null);
              }}
              className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <label htmlFor="ndaCheckbox" className="text-xs text-on-surface cursor-pointer select-none leading-relaxed">
              I certify that I am legally authorized to sign on behalf of <strong>{currentUser.companyName}</strong>. I have read, understood, and accept all terms of this Non-Disclosure Agreement.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">draw</span>
              <span>Execute &amp; Sign NDA Digitally</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
