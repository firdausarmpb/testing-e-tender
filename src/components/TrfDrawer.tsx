import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { useToast } from './GlobalToast';

interface TrfDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrfDrawer: React.FC<TrfDrawerProps> = ({ isOpen, onClose }) => {
  const { createNewTender } = useTender();
  const { showToast } = useToast();

  const [projectTitle, setProjectTitle] = useState('CORE ERP SYSTEM MODERNIZATION (PROJECT OMEGA)');
  const [budgetCode, setBudgetCode] = useState('MP/CDU/CAPEX/2026/999');
  const [justification, setJustification] = useState(
    'Upgrade of legacy internal operational software to modern cloud microservices architecture to improve processing efficiency and security.'
  );

  const [commercialMode, setCommercialMode] = useState<'boq' | 'rfp'>('boq');
  const [tenderMethod, setTenderMethod] = useState<'open' | 'closed'>('open');

  const [boqRows, setBoqRows] = useState([
    { id: 1, desc: 'High-Performance Laptop i7/16GB RAM', qty: 50 },
    { id: 2, desc: '27-inch 4K Professional Monitor', qty: 50 },
  ]);

  const [rfpPhases, setRfpPhases] = useState([
    { id: 1, name: 'Evaluation of Strategic Options' },
    { id: 2, name: 'Implementation & Advisory Fees' },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddBoqRow = () => {
    setBoqRows([
      ...boqRows,
      { id: Date.now(), desc: '', qty: 1 },
    ]);
  };

  const handleRemoveBoqRow = (id: number) => {
    setBoqRows(boqRows.filter((r) => r.id !== id));
  };

  const handleAddPhase = () => {
    setRfpPhases([
      ...rfpPhases,
      { id: Date.now(), name: '' },
    ]);
  };

  const handleRemovePhase = (id: number) => {
    setRfpPhases(rfpPhases.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create the new tender
    createNewTender({
      referenceNo: `MP-CDU-${Math.floor(1000 + Math.random() * 9000)}`,
      title: projectTitle,
      department: 'Corporate Digital Unit',
      location: 'Sri Pentas, Glenmarie Broadcast Center',
      submissionType: tenderMethod === 'open' ? 'Request for Proposal' : 'Restricted Tender',
      approvedCapexBudget: 450000,
      currency: 'MYR',
      closingDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      qaClosingDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      requiresMofRegistration: true,
      evaluationWeights: {
        technicalWeight: 70,
        commercialWeight: 30,
      },
      rfpDocuments: [
        {
          id: 'doc_trf_1',
          name: 'Project_Official_TRF_Specs.pdf',
          version: 'v1.0',
          size: '2.4 MB',
          category: 'Official Specifications',
          confidentiality: 'Corporate Digital Unit',
        },
      ],
      bqItems: boqRows.map((r, idx) => ({
        id: `bq_new_${idx + 1}`,
        itemNumber: `${idx + 1}.01`,
        description: r.desc || 'Standard Equipment Item',
        detailedSpecs: 'As per approved TRF requirements',
        unit: 'Units',
        quantity: r.qty,
        estimatedUnitPrice: 3000,
      })),
      invitedEmails: ['ahmad.syakir@syarikatabc.com.my', 'john@apextech-sample.com', 'jane@nexusdigital-sample.com'],
      ndaTermsText: 'Standard Media Prima internal corporate non-disclosure undertaking.',
    });

    setShowSuccess(true);
    showToast('TRF Requisition Saved & Published to Active Tenders!');

    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity duration-300 animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#f8fafc] h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <i className="ph-bold ph-file-text text-blue-600 text-xl"></i>
            <span>Tender Request Form (TRF) Requisition</span>
          </h3>
          <div className="flex items-center gap-3">
            <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider border border-blue-200 shadow-sm">
              Internal Requisition
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100"
            >
              <i className="ph ph-x text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          {showSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg shadow-sm flex items-start gap-3 animate-fade-in-down mb-6">
              <i className="ph-fill ph-check-circle text-emerald-600 text-xl mt-0.5 shrink-0"></i>
              <p className="text-sm font-semibold text-emerald-900">
                TRF Requisition Saved &amp; Published to Active Tenders!
              </p>
            </div>
          )}

          {/* Section A */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                A
              </div>
              <span>Requester Particulars &amp; Budget</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Requester Name
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-50 text-slate-700"
                  value="Rizal Hamdan"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Designation &amp; Department
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-50 text-slate-700"
                  value="Head of Digital Solutions | Corporate Digital Unit"
                  readOnly
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Budget No. / Code
                </label>
                <input
                  type="text"
                  value={budgetCode}
                  onChange={(e) => setBudgetCode(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section B */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                B
              </div>
              <span>Justification for Calling Tender</span>
            </h4>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Scope / Rationale
              </label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 outline-none resize-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Section C: BOQ Builder */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                C
              </div>
              <span>Commercial / BOQ Setup for Bidders</span>
            </h4>

            {/* Mode Selector */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="trfCommercialMode"
                  checked={commercialMode === 'boq'}
                  onChange={() => setCommercialMode('boq')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700">
                  Option 1: Standard Itemised BOQ{' '}
                  <span className="text-[10px] text-slate-500 font-normal ml-1 block sm:inline">
                    (Line-by-Line items &amp; quantities)
                  </span>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="trfCommercialMode"
                  checked={commercialMode === 'rfp'}
                  onChange={() => setCommercialMode('rfp')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-700">
                  Option 2: Phased / Lump-Sum RFP{' '}
                  <span className="text-[10px] text-slate-500 font-normal ml-1 block sm:inline">
                    (Advisory or Consulting)
                  </span>
                </span>
              </label>
            </div>

            {/* Option 1: BOQ Table */}
            {commercialMode === 'boq' && (
              <div className="animate-fade-in">
                <p className="text-xs text-slate-500 mb-3">
                  Define line items and quantities. Bidders will fill in Unit Price and Total Amount during submission.
                </p>
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5 w-12 text-center">No.</th>
                        <th className="px-4 py-2.5">Item Description</th>
                        <th className="px-4 py-2.5 w-28 text-center">Quantity</th>
                        <th className="px-4 py-2.5 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {boqRows.map((row, idx) => (
                        <tr key={row.id}>
                          <td className="px-4 py-2.5 text-center font-medium text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={row.desc}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBoqRows(
                                  boqRows.map((r) => (r.id === row.id ? { ...r, desc: val } : r))
                                );
                              }}
                              className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 outline-none focus:border-blue-500 font-medium"
                              placeholder="Enter item description..."
                              required
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <input
                              type="number"
                              value={row.qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setBoqRows(
                                  boqRows.map((r) => (r.id === row.id ? { ...r, qty: val } : r))
                                );
                              }}
                              className="w-20 mx-auto text-center border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 outline-none focus:border-blue-500 font-mono"
                              min={1}
                              required
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBoqRow(row.id)}
                              className="text-slate-400 hover:text-red-500 p-1 rounded"
                            >
                              <i className="ph ph-trash text-sm"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleAddBoqRow}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <i className="ph-bold ph-plus"></i> + Add New Item Row
                </button>
              </div>
            )}

            {/* Option 2: Phased RFP Setup */}
            {commercialMode === 'rfp' && (
              <div className="animate-fade-in space-y-3">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md mb-4 flex items-start gap-2 shadow-sm">
                  <i className="ph-fill ph-info text-blue-500 mt-0.5"></i>
                  <p className="text-xs text-blue-900 font-medium leading-relaxed">
                    <span className="font-bold uppercase tracking-wide">Guidance Note:</span> Bidders will be prompted to quote lump-sum fees for these milestones and upload their official signed Fee Proposal &amp; Assumptions Deck (PDF).
                  </p>
                </div>

                <div className="space-y-3">
                  {rfpPhases.map((phase, idx) => (
                    <div
                      key={phase.id}
                      className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200"
                    >
                      <div className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded text-xs shrink-0">
                        Phase {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRfpPhases(
                            rfpPhases.map((p) => (p.id === phase.id ? { ...p, name: val } : p))
                          );
                        }}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm bg-white text-slate-800 outline-none focus:border-blue-500 font-medium"
                        placeholder="Enter phase or milestone description..."
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(phase.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded shrink-0"
                      >
                        <i className="ph ph-trash text-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddPhase}
                  className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <i className="ph-bold ph-plus"></i> + Add Custom Phase / Milestone
                </button>
              </div>
            )}
          </div>

          {/* Section D: Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                D
              </div>
              <span>Tender Documents &amp; Reference Uploads</span>
            </h4>
            <div
              onClick={() => showToast('Reference document uploaded successfully.')}
              className="border-2 border-dashed border-slate-300 rounded-lg p-5 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 mb-4 transition-colors"
            >
              <div className="h-9 w-9 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 mb-2">
                <i className="ph ph-upload-simple text-lg"></i>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Drag &amp; Drop files here or click to browse
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Max 50MB per file (PDF, DOCX, VSDX, ZIP)</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 truncate">
                  <i className="ph-fill ph-file-pdf text-red-500 text-base"></i>
                  <span className="font-semibold text-slate-800 truncate">
                    Project_Omega_Official_RFP.pdf
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">(2.4 MB)</span>
                </div>
                <button type="button" className="text-slate-400 hover:text-red-500 p-1">
                  <i className="ph ph-x text-sm"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Section E: Method */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                E
              </div>
              <span>Tender Method Selection</span>
            </h4>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="trfMethod"
                  checked={tenderMethod === 'open'}
                  onChange={() => setTenderMethod('open')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">
                  Open Tender <span className="text-[10px] text-slate-400 font-normal ml-1">(Publicly Advertised)</span>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="trfMethod"
                  checked={tenderMethod === 'closed'}
                  onChange={() => setTenderMethod('closed')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">
                  Closed Tender <span className="text-[10px] text-slate-400 font-normal ml-1">(Restricted Invitation)</span>
                </span>
              </label>
            </div>

            {tenderMethod === 'closed' && (
              <div className="space-y-4 border-t border-dashed border-slate-200 pt-4 animate-fade-in-down">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r shadow-sm">
                  <label className="block text-xs font-bold text-amber-900 mb-1.5">
                    Mandatory Justification for Deviation from Standard Open Tender
                  </label>
                  <textarea
                    className="w-full border border-amber-200 rounded p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                    rows={2}
                    defaultValue="Closed tender is required to invite pre-qualified vendors due to specialized proprietary software architectural requirements."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-navy-800 text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <i className="ph-bold ph-rocket-launch"></i>
              <span>Verify &amp; Publish Tender</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
