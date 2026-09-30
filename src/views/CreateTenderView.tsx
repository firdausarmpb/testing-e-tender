import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { BqItem } from '../types/tender';

export const CreateTenderView: React.FC = () => {
  const { createNewTender, setActiveNavTab } = useTender();

  const [refNo, setRefNo] = useState('MP-DIGITAL-2026-088');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Media Prima Digital / Engineering');
  const [location, setLocation] = useState('Sri Pentas, Bandar Utama, Petaling Jaya');
  const [approvedCapex, setApprovedCapex] = useState<number>(350000);
  const [closingDate, setClosingDate] = useState('2026-04-15');
  const [closingTime, setClosingTime] = useState('12:00');
  const [invitedEmailsStr, setInvitedEmailsStr] = useState(
    'ahmad.syakir@syarikatabc.com.my, kevin.tan@nexusdigital.com, tender@oasiscloud.com.my'
  );

  const [bqItems, setBqItems] = useState<BqItem[]>([
    {
      id: 'bq_init_1',
      itemNumber: 'Item 1',
      description: 'Core Edge Routing Switch Units (24-Port 10G SFP+)',
      detailedSpecs: 'Layer 3 enterprise switch with dual redundant power supplies',
      unit: 'Units',
      quantity: 4,
      estimatedUnitPrice: 25000,
    },
    {
      id: 'bq_init_2',
      itemNumber: 'Item 2',
      description: 'Next-Gen Firewall Appliance with High Availability Pair',
      detailedSpecs: 'Throughput 10Gbps with 3-year threat prevention subscription',
      unit: 'Units',
      quantity: 2,
      estimatedUnitPrice: 45000,
    },
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddBqItem = () => {
    const newItem: BqItem = {
      id: `bq_new_${Date.now()}`,
      itemNumber: `Item ${bqItems.length + 1}`,
      description: 'New Engineering Scope Item',
      detailedSpecs: 'Standard Media Prima technical specifications',
      unit: 'Units',
      quantity: 1,
      estimatedUnitPrice: 10000,
    };
    setBqItems([...bqItems, newItem]);
  };

  const handleUpdateBqItem = (idx: number, field: keyof BqItem, val: any) => {
    const updated = [...bqItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setBqItems(updated);
  };

  const handleRemoveBqItem = (idx: number) => {
    setBqItems(bqItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation (PRD F01)
    if (!title.trim() || !refNo.trim() || !closingDate || !closingTime || bqItems.length === 0) {
      setErrorMessage('Please complete all required tender fields and set a valid closing deadline.');
      return;
    }

    const invitedEmails = invitedEmailsStr
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const deadlineIso = `${closingDate}T${closingTime}:00+08:00`;

    createNewTender({
      referenceNo: refNo.trim(),
      title: title.trim(),
      department,
      location,
      submissionType: 'Two-Envelope Sealed Protocol',
      approvedCapexBudget: approvedCapex,
      currency: 'MYR',
      closingDeadline: deadlineIso,
      qaClosingDeadline: `${closingDate}T17:00:00+08:00`,
      govAuditRef: `GOV-2026-AUD${Math.floor(10 + Math.random() * 90)} Verified ✓`,
      rfpDocuments: [
        {
          id: `doc_${Date.now()}`,
          name: `Tender_RFP_Brief_${refNo}.pdf`,
          version: 'v1.0',
          size: '5.2 MB',
          category: 'Official RFP Brief',
          confidentiality: 'Confidential Tender Dossier',
        },
      ],
      bqItems,
      invitedEmails,
      requiresMofRegistration: true,
      minimumCidbGrade: 'Grade G4 or Above',
      evaluationWeights: {
        technicalWeight: 70,
        commercialWeight: 30,
      },
      ndaTermsText: `Standard Media Prima Non-Disclosure covenant for ${refNo}.`,
    });

    setSuccessMessage('Tender successfully published and invitations issued.');
    setTimeout(() => {
      setActiveNavTab('active-tenders');
    }, 1800);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-margin py-space-lg flex flex-col gap-space-lg max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span className="font-label-sm uppercase font-bold text-primary tracking-wider">
                Procurement Administration
              </span>
            </div>
            <h1 className="font-headline-lg font-bold text-on-surface mt-1">
              Create New Tender Dossier &amp; Issue Invitations
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Configure Two-Envelope bidding parameters, define BQ items, upload RFP specs, and invite qualified suppliers (PRD F01).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveNavTab('active-tenders')}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold"
          >
            Cancel
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-xs text-red-800 font-medium flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-medium flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Tender Master Details */}
          <div className="bg-white rounded-2xl p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <h2 className="font-headline-sm font-bold text-on-surface border-b pb-2">
              1. Project Identification &amp; Baseline Metadata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md font-semibold text-on-surface" htmlFor="refNoInput">
                  Tender Reference Number <span className="text-error">*</span>
                </label>
                <input
                  id="refNoInput"
                  type="text"
                  required
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-mono font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md font-semibold text-on-surface" htmlFor="approvedCapexInput">
                  Approved Capex Budget (MYR) <span className="text-error">*</span>
                </label>
                <input
                  id="approvedCapexInput"
                  type="number"
                  required
                  value={approvedCapex}
                  onChange={(e) => setApprovedCapex(parseFloat(e.target.value) || 0)}
                  className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-mono font-semibold"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="font-label-md font-semibold text-on-surface" htmlFor="tenderTitleInput">
                  Tender Title <span className="text-error">*</span>
                </label>
                <input
                  id="tenderTitleInput"
                  type="text"
                  required
                  placeholder="e.g. Supply and Delivery of IT Equipment for Regional Offices"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md font-semibold text-on-surface" htmlFor="deptInput">
                  Procuring Division / Department
                </label>
                <input
                  id="deptInput"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md font-semibold text-on-surface" htmlFor="locInput">
                  Site / Bureau Location
                </label>
                <input
                  id="locInput"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Strict Closing Timelines (PRD F05) */}
          <div className="bg-white rounded-2xl p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <h2 className="font-headline-sm font-bold text-on-surface border-b pb-2">
              2. Strict Closing Deadline &amp; Automatic Cutoff
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md font-semibold text-on-surface" htmlFor="closingDateInput">
                  Submission Closing Date <span className="text-error">*</span>
                </label>
                <input
                  id="closingDateInput"
                  type="date"
                  required
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md font-semibold text-on-surface" htmlFor="closingTimeInput">
                  Cutoff Time (MYT) <span className="text-error">*</span>
                </label>
                <input
                  id="closingTimeInput"
                  type="time"
                  required
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs"
                />
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Once this closing timestamp is exceeded, the portal automatically closes submission access (0% submission capability after cutoff per PRD Target 2).
            </p>
          </div>

          {/* Section 3: Bill of Quantities (BOQ) Items Builder */}
          <div className="bg-white rounded-2xl p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h2 className="font-headline-sm font-bold text-on-surface">
                  3. Bill of Quantities (BOQ) Item Definitions
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Line items that invited bidders must price in Envelope 2.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddBqItem}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold flex items-center gap-1 text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add BOQ Item</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {bqItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary font-mono">{item.itemNumber}</span>
                    {bqItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBqItem(idx)}
                        className="text-error hover:bg-error-container/40 p-1 rounded"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Item Description"
                        value={item.description}
                        onChange={(e) => handleUpdateBqItem(idx, 'description', e.target.value)}
                        className="w-full h-9 px-2.5 rounded bg-white border border-outline-variant/30 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Unit (e.g. Units, Lot)"
                        value={item.unit}
                        onChange={(e) => handleUpdateBqItem(idx, 'unit', e.target.value)}
                        className="w-full h-9 px-2.5 rounded bg-white border border-outline-variant/30 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => handleUpdateBqItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full h-9 px-2.5 rounded bg-white border border-outline-variant/30 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Detailed Technical Specification / Reference"
                        value={item.detailedSpecs}
                        onChange={(e) => handleUpdateBqItem(idx, 'detailedSpecs', e.target.value)}
                        className="w-full h-9 px-2.5 rounded bg-white border border-outline-variant/30 text-xs text-on-surface-variant"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Invited Bidder Emails (PRD F01 & F02) */}
          <div className="bg-white rounded-2xl p-space-lg shadow-xs border border-outline-variant/30 flex flex-col gap-3">
            <h2 className="font-headline-sm font-bold text-on-surface border-b pb-2">
              4. Invited Supplier Email Whitelist
            </h2>
            <p className="text-xs text-on-surface-variant">
              Separate email addresses by commas. Only registered emails in this whitelist are permitted access to sign NDA and submit bids.
            </p>
            <textarea
              rows={3}
              value={invitedEmailsStr}
              onChange={(e) => setInvitedEmailsStr(e.target.value)}
              className="w-full bg-white rounded-xl p-3 border border-outline-variant/40 text-xs font-mono"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveNavTab('active-tenders')}
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-label-md font-semibold transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>Publish Tender &amp; Issue Invitations</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
