import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { useToast } from './GlobalToast';

interface QaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QaDrawer: React.FC<QaDrawerProps> = ({ isOpen, onClose }) => {
  const { currentTender, submitClarification } = useTender();
  const { showToast } = useToast();

  const [category, setCategory] = useState<string>('Technical Specifications');
  const [questionText, setQuestionText] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [submittedList, setSubmittedList] = useState<Array<{
    id: string;
    category: string;
    date: string;
    text: string;
    status: 'Answered' | 'Under Review';
    response?: string;
    responseDate?: string;
  }>>([
    {
      id: 'qa_default_1',
      category: 'Technical Specs',
      date: '10 Aug 2026',
      text: 'Can we propose an equivalent processor model for BOQ Item 1?',
      status: 'Answered',
      response: 'Yes, equivalent or higher benchmarked processors are acceptable provided benchmark proof is attached in Envelope 1.',
      responseDate: '11 Aug 2026',
    },
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newQ = {
      id: `qa_${Date.now()}`,
      category,
      date: todayStr,
      text: questionText,
      status: 'Under Review' as const,
    };

    setSubmittedList([newQ, ...submittedList]);

    // Also sync to global clarifications
    submitClarification({
      tenderId: currentTender.id,
      category: category.includes('Technical') ? 'tech' : category.includes('BOQ') ? 'boq' : 'gen',
      categoryLabel: category,
      subject: questionText.substring(0, 50) + '...',
      details: questionText,
    });

    setQuestionText('');
    setShowSuccessBanner(true);
    showToast('Question submitted to Procurement Team.');
    setTimeout(() => setShowSuccessBanner(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity duration-300 animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-up">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-navy-900 text-white flex justify-between items-center shrink-0">
          <h3 className="text-base font-bold flex items-center gap-2">
            <i className="ph-fill ph-chats-circle text-mpRed text-xl"></i>
            <span>Tender Clarification &amp; Q&amp;A</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors p-1"
            aria-label="Close Q&A Drawer"
          >
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-grow overflow-y-auto p-5 bg-slate-50 space-y-6">
          {/* Submit New Clarification Form */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Submit New Clarification
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Question Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-mpRed"
                >
                  <option>Technical Specifications</option>
                  <option>BOQ &amp; Financial</option>
                  <option>Legal &amp; Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Your Question / Ambiguity Details
                </label>
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 outline-none focus:border-mpRed resize-none"
                  placeholder="E.g. Please clarify if the laptop RAM requirement in BOQ Item 1 allows DDR5 32GB equivalent..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Attach Supporting Document (Optional)
                </label>
                <div
                  onClick={() => showToast('Attachment uploaded successfully.')}
                  className="border border-dashed border-slate-300 rounded-md p-2 text-center hover:bg-slate-50 cursor-pointer bg-white transition-colors"
                >
                  <span className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
                    <i className="ph ph-upload-simple"></i> Upload Screenshot / Spec Sheet (Max 5MB)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-mpRed text-white font-bold py-2 rounded-md hover:bg-red-700 text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Submit Question to Procurement</span>
                <i className="ph-bold ph-paper-plane-right"></i>
              </button>
            </form>
          </div>

          {/* Success Banner */}
          {showSuccessBanner && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-start gap-2 shadow-sm animate-fade-in-down">
              <i className="ph-fill ph-check-circle text-emerald-500 text-base mt-0.5"></i>
              <span>Your question has been submitted successfully to the Media Prima Procurement Team.</span>
            </div>
          )}

          {/* Submitted Questions History */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex justify-between items-center">
              <span>My Submitted Questions</span>
              <span className="text-[10px] text-slate-400 font-normal">({submittedList.length} Total)</span>
            </h4>
            <div className="space-y-4">
              {submittedList.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm relative overflow-hidden animate-slide-up"
                >
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${
                      q.status === 'Answered' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  ></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {q.category} • {q.date}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                        q.status === 'Answered'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {q.status === 'Answered' && <i className="ph-bold ph-check mr-0.5"></i>}
                      {q.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium pl-2 mb-3 leading-relaxed">
                    {q.text}
                  </p>

                  {q.response && (
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 ml-2 relative">
                      <div className="absolute -top-1.5 left-4 w-3 h-3 bg-blue-50 border-t border-l border-blue-100 rotate-45"></div>
                      <p className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1">
                        <i className="ph-fill ph-headset text-sm"></i> Procurement Team Response:
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed font-medium">
                        {q.response}
                      </p>
                      <p className="text-[9px] text-blue-500 mt-1.5 font-medium text-right">
                        Answered on {q.responseDate || '11 Aug 2026'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
