import React, { useState } from 'react';
import { useToast } from './GlobalToast';

interface ReqQaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAnswerPublished?: () => void;
}

export const ReqQaDrawer: React.FC<ReqQaDrawerProps> = ({
  isOpen,
  onClose,
  onAnswerPublished,
}) => {
  const { showToast } = useToast();
  const [answerText, setAnswerText] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setIsAnswered(true);
    setShowSuccess(true);
    showToast('Technical answer published as official circular!');
    if (onAnswerPublished) onAnswerPublished();
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity duration-300 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-50 h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-blue-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <i className="ph-fill ph-chats-circle text-blue-300 text-xl"></i>
              <span>Technical Q&amp;A &amp; Clarifications</span>
            </h3>
            <p className="text-[10px] text-blue-200 mt-0.5 font-medium uppercase tracking-widest">
              Subject Matter Expert Workspace
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-800 border border-blue-700 text-white text-[10px] px-2 py-1 rounded font-bold tracking-wider shadow-inner">
              Role: Requester / SME
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-colors p-1 rounded hover:bg-blue-800"
            >
              <i className="ph ph-x text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {/* Question Card */}
          <div
            className={`bg-white border-l-4 rounded-lg p-5 shadow-sm transition-all duration-300 ${
              isAnswered ? 'border-emerald-500' : 'border-amber-500'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Technical Specifications • MP-CDU-2026-888
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-1 rounded border flex items-center gap-1 shadow-sm ${
                  isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {isAnswered ? (
                  <>
                    <i className="ph-bold ph-check text-xs"></i> Answered &amp; Published
                  </>
                ) : (
                  <>
                    <i className="ph-fill ph-clock text-xs"></i> Awaiting SME Answer
                  </>
                )}
              </span>
            </div>
            <p className="text-sm text-slate-800 font-medium mb-3 leading-relaxed">
              Regarding BOQ Item 1 (High-Performance Laptop), please clarify if we can offer an equivalent processor with higher core count but slightly different clock speed?
            </p>
            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <i className="ph-fill ph-user text-xs"></i> Submitted by: Anonymous Bidder (ID: V-8890) • 14 Aug 2026
            </p>

            {/* Answer Display */}
            {isAnswered && (
              <div className="mt-5 bg-blue-50 border border-blue-100 rounded-md p-4 relative animate-slide-up shadow-inner">
                <div className="absolute -top-1.5 left-5 w-3 h-3 bg-blue-50 border-t border-l border-blue-100 rotate-45"></div>
                <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                  <i className="ph-fill ph-check-circle text-base text-blue-600"></i> Official SME Clarification:
                </p>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  {answerText ||
                    'Yes, equivalent or higher benchmarked processors are acceptable provided benchmark proof is attached in Envelope 1.'}
                </p>
                <p className="text-[9px] text-blue-500 mt-2 font-bold text-right uppercase tracking-wider">
                  Answered by Rizal Hamdan (Requester / SME) - Just Now
                </p>
              </div>
            )}
          </div>

          {showSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-xs font-semibold flex items-start gap-3 shadow-sm animate-fade-in-down">
              <i className="ph-fill ph-check-circle text-emerald-600 text-xl shrink-0"></i>
              <p>Technical response published successfully! Updated in Q&amp;A Circulars for all bidders.</p>
            </div>
          )}

          {/* Form */}
          {!isAnswered && (
            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-fade-in space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2 flex items-center gap-2">
                <i className="ph-fill ph-pencil-simple text-blue-600"></i> Official Technical Response
              </h4>
              <div>
                <textarea
                  rows={4}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-shadow"
                  placeholder="Type official technical clarification here... E.g., Yes, equivalent processors are accepted provided benchmark results are attached."
                  required
                />
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium leading-snug">
                  Publish as Official Technical Circular / Addendum to All Bidders
                </span>
              </label>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Publish Technical Answer</span>
                <i className="ph-bold ph-paper-plane-right text-sm"></i>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
