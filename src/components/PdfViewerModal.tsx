import React from 'react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileTitle?: string;
  category?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileTitle,
  category = 'Official Tender Dossier',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/40">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-error flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-label-md font-bold text-on-surface truncate">
                {fileTitle || fileName}
              </h3>
              <p className="text-xs text-on-surface-variant truncate">
                {category} • SHA-256 Verified Signature
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`Simulated document download started for ${fileName}`)}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* PDF Simulated Sheet Viewer */}
        <div className="p-8 bg-slate-100 overflow-y-auto flex justify-center">
          <div className="bg-white shadow-lg border border-slate-200 rounded-lg p-10 max-w-2xl w-full flex flex-col gap-6 text-slate-800 text-xs min-h-[500px]">
            {/* Sheet Letterhead */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="font-bold text-lg text-primary flex items-center gap-1">
                  <span>MEDIA PRIMA BERHAD</span>
                </div>
                <div className="text-[10px] text-slate-500">e-Procurement &amp; Technical Evaluation Division</div>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <div>DOC-REF: {fileName}</div>
                <div>SEAL: SHA256-AES256</div>
                <div>STATUS: VERIFIED GENUINE</div>
              </div>
            </div>

            {/* Simulated Content */}
            <div className="flex flex-col gap-3">
              <h2 className="font-bold text-base text-slate-900 border-b pb-2">
                {fileName.replace('.pdf', '')}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                This document serves as the official cryptographic tender submission record lodged under the Media Prima eTender Intelligence Vault protocol. All engineering specifications, bill of quantities line items, and SLA undertakings comply with the Digital Signature Act 1997.
              </p>

              <div className="p-4 bg-slate-50 rounded border border-slate-200 flex flex-col gap-2">
                <div className="font-semibold text-slate-900">Digital Document Integrity Checksum</div>
                <div className="font-mono text-[11px] text-slate-600 break-all bg-white p-2 rounded border">
                  SHA-256: 7d49e8a1c920bf842183e9102ca192809112e491c
                </div>
                <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-semibold mt-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Public Key Encryption Match: Verified on Media Prima Vault Root</span>
                </div>
              </div>

              <div className="mt-6 border-t pt-4 flex justify-between items-end text-[11px] text-slate-500">
                <div>
                  Authorized Signatory Seal<br/>
                  <strong>Media Prima Procurement Intelligence Protocol</strong>
                </div>
                <div className="text-right">
                  Page 1 of 1 • Official Copy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
