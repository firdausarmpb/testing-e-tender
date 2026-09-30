import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { useToast } from '../components/GlobalToast';

export const ActiveTendersView: React.FC = () => {
  const {
    tenders,
    setCurrentTenderId,
    setActiveNavTab,
    isNdaSignedForCurrentBidder,
    signNda,
  } = useTender();
  const { showToast } = useToast();

  const [showUrgentNotice, setShowUrgentNotice] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Simulated NDA upload state for MP-STR-2026-099
  const [ndaUploading, setNdaUploading] = useState(false);
  const [ndaVerified, setNdaVerified] = useState(false);

  const handleSimulateNda = () => {
    setNdaUploading(true);
    setTimeout(() => {
      setNdaUploading(false);
      setNdaVerified(true);
      signNda('MP-STR-2026-099', 'Ahmad Syakir', '880112-14-5521');
      showToast('Signed NDA verified. Access granted to MP-STR-2026-099!');
    }, 800);
  };

  const handleOpenTender = (tenderId: string) => {
    setCurrentTenderId(tenderId);
    setActiveNavTab('submissions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'IT & Software') {
      return (
        t.department.toLowerCase().includes('it') ||
        t.title.toLowerCase().includes('it') ||
        t.title.toLowerCase().includes('ott')
      );
    }
    if (categoryFilter === 'Engineering & Facility') {
      return (
        t.department.toLowerCase().includes('broadcast') ||
        t.department.toLowerCase().includes('engineering')
      );
    }
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-fade-in">
      {/* Urgent Notice Banner */}
      {showUrgentNotice && (
        <div className="bg-red-50 border-l-4 border-mpRed p-4 rounded-r-lg shadow-xs mb-8 flex items-start sm:items-center justify-between relative group transition-all hover:shadow-md animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="bg-white p-1.5 rounded-full shadow-xs text-mpRed shrink-0 mt-0.5 sm:mt-0">
              <i className="ph-fill ph-warning-circle text-lg"></i>
            </div>
            <div>
              <h3 className="text-red-900 font-bold text-sm">Urgent Notice</h3>
              <p className="text-red-700 text-xs sm:text-sm mt-0.5 pr-8 sm:pr-0">
                Addendum #1 for Tender <strong className="font-bold">MP-ENG-2026-042</strong> (Broadcast Server Maintenance) has been published. Please review updated technical specifications before finalizing your submission.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 absolute top-4 right-4 sm:static">
            <button
              type="button"
              onClick={() => handleOpenTender('MP-ENG-2026-042')}
              className="hidden sm:inline-block text-xs font-bold text-red-700 bg-red-100/60 hover:bg-red-100 px-3 py-1.5 rounded transition-colors border border-red-200 cursor-pointer"
            >
              View Addendum
            </button>
            <button
              type="button"
              onClick={() => setShowUrgentNotice(false)}
              className="text-red-400 hover:text-red-700 transition-colors p-1"
              title="Dismiss Notice"
            >
              <i className="ph ph-x text-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Vendor Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
              Total Active Tenders
            </p>
            <p className="text-2xl font-bold text-slate-900">{tenders.length > 0 ? tenders.length : 12}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner">
            <i className="ph-fill ph-files text-xl"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
              My Active Bids
            </p>
            <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-inner">
            <i className="ph-fill ph-clock-countdown text-xl"></i>
          </div>
        </div>

        {/* Highlighted Pending Action */}
        <div className="bg-white rounded-xl shadow-md border-2 border-mpRed p-5 flex items-center justify-between relative overflow-hidden ring-4 ring-red-50 hover:-translate-y-0.5 transition-transform">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-100 to-transparent -z-10 rounded-bl-full"></div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-red-600 mb-1">
              Pending Action
            </p>
            <p className="text-2xl font-bold text-slate-900">1</p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Incomplete Envelope</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 text-mpRed flex items-center justify-center border border-red-200 shadow-inner animate-pulse">
            <i className="ph-fill ph-warning text-xl"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
              Submitted &amp; Encrypted
            </p>
            <p className="text-2xl font-bold text-emerald-700">5</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
            <i className="ph-fill ph-lock-key text-xl"></i>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Tender ID or Keyword..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-500 hover:bg-slate-100 cursor-pointer"
            >
              <option>All Categories</option>
              <option>IT &amp; Software</option>
              <option>Engineering &amp; Facility</option>
            </select>
            <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-navy-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className="ph-fill ph-squares-four text-lg"></i>
            <span>Grid View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-navy-800 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className="ph ph-list-dashes text-lg"></i>
            <span>Table View</span>
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
        <i className="ph-fill ph-folder-open text-mpRed"></i>
        <span>Current Active Tenders</span>
      </h2>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {/* Card 1: MP-IT-2026-001 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-t-4 border-blue-600">
            <div className="p-5 border-b border-slate-100 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Request for Proposal
                </span>
              </div>
              <h3 className="text-xs text-slate-400 font-bold mb-1 tracking-wide">MP-IT-2026-001</h3>
              <p className="text-[15px] font-bold text-slate-900 leading-snug mb-2">
                Supply and Delivery of IT Equipment for Regional Offices
              </p>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                Provision of laptops, monitors, and networking peripherals for new regional bureau setups across East Malaysia.
              </p>

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                  Downloads &amp; Documentation
                </h4>
                <div className="space-y-1.5">
                  <div
                    onClick={() => showToast('Downloading Tender_RFP_Brief.pdf (1.2 MB)...')}
                    className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-50 border border-slate-100 hover:border-blue-300 group text-slate-700 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <i className="ph-fill ph-file-pdf text-red-500 text-sm"></i> Tender_RFP_Brief.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">1.2 MB</span>
                  </div>
                  <div
                    onClick={() => showToast('Downloading Network_Arch_Drawings.pdf (4.5 MB)...')}
                    className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-50 border border-slate-100 hover:border-purple-300 group text-slate-700 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <i className="ph-fill ph-ruler text-purple-500 text-sm"></i> Network_Arch_Drawings.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">4.5 MB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 mt-auto border-t border-slate-200 flex flex-col xl:flex-row gap-2">
              <button
                type="button"
                onClick={() => showToast('Downloading all official tender documents (ZIP)...')}
                className="w-full xl:w-1/2 px-2 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 text-center whitespace-nowrap transition-colors cursor-pointer"
              >
                <i className="ph-bold ph-download-simple text-sm"></i>
                <span>Download Docs</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenTender('MP-IT-2026-001')}
                className="w-full xl:w-1/2 bg-mpRed hover:bg-red-700 text-white font-bold py-2 px-2 rounded-lg flex items-center justify-center gap-1 text-[11px] text-center shadow-xs transition-colors cursor-pointer"
              >
                <span>Express Interest / Submit Bid</span>
                <i className="ph-bold ph-arrow-right text-sm"></i>
              </button>
            </div>
          </div>

          {/* Card 2: MP-STR-2026-015 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-t-4 border-indigo-600">
            <div className="p-5 border-b border-slate-100 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Strategic Advisory RFP
                </span>
              </div>
              <h3 className="text-xs text-slate-400 font-bold mb-1 tracking-wide">MP-STR-2026-015</h3>
              <p className="text-[15px] font-bold text-slate-900 leading-snug mb-2">
                Strategic Advisory &amp; Valuation for Regional Media Asset Restructuring (Project Titan)
              </p>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                Independent strategic, valuation, and transaction structuring advice for evaluating phased asset integration.
              </p>

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                  Downloads &amp; Documentation
                </h4>
                <div className="space-y-1.5">
                  <div
                    onClick={() => showToast('Downloading Project_Titan_Official_RFP.pdf (1.8 MB)...')}
                    className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-50 border border-slate-100 hover:border-indigo-300 group text-slate-700 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <i className="ph-fill ph-file-pdf text-red-500 text-sm"></i> Project_Titan_Official_RFP.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">1.8 MB</span>
                  </div>
                  <div
                    onClick={() => showToast('Downloading Group_Structure_Overview.pdf (2.4 MB)...')}
                    className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-50 border border-slate-100 hover:border-indigo-300 group text-slate-700 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <i className="ph-fill ph-file-pdf text-red-500 text-sm"></i> Group_Structure_Overview.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">2.4 MB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 mt-auto border-t border-slate-200 flex flex-col xl:flex-row gap-2">
              <button
                type="button"
                onClick={() => showToast('Downloading all Project Titan RFP documents...')}
                className="w-full xl:w-1/2 px-2 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 text-center whitespace-nowrap transition-colors cursor-pointer"
              >
                <i className="ph-bold ph-download-simple text-sm"></i>
                <span>Download Docs</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenTender('MP-STR-2026-015')}
                className="w-full xl:w-1/2 bg-mpRed hover:bg-red-700 text-white font-bold py-2 px-2 rounded-lg flex items-center justify-center gap-1 text-[11px] text-center shadow-xs transition-colors cursor-pointer"
              >
                <span>Express Interest / Submit Bid</span>
                <i className="ph-bold ph-arrow-right text-sm"></i>
              </button>
            </div>
          </div>

          {/* Card 3: MP-MKT-2026-012 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border-t-4 border-navy-700">
            <div className="p-5 border-b border-slate-100 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-navy-50 text-navy-800 border border-navy-200 uppercase tracking-wider">
                  Standard Tender
                </span>
              </div>
              <h3 className="text-xs text-slate-400 font-bold mb-1 tracking-wide">MP-MKT-2026-012</h3>
              <p className="text-[15px] font-bold text-slate-900 leading-snug mb-2">
                Outdoor Billboard Media Buying Agency Appointment
              </p>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                Procurement of media buying services for nationwide strategic outdoor billboard placements.
              </p>

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                  Downloads &amp; Documentation
                </h4>
                <div className="space-y-1.5">
                  <div
                    onClick={() => showToast('Downloading Outdoor_Billboard_RFP.pdf (1.5 MB)...')}
                    className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-50 border border-slate-100 hover:border-navy-300 group text-slate-700 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <i className="ph-fill ph-file-pdf text-red-500 text-sm"></i> Outdoor_Billboard_RFP.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">1.5 MB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 mt-auto border-t border-slate-200 flex flex-col xl:flex-row gap-2">
              <button
                type="button"
                onClick={() => showToast('Downloading Billboard tender documents...')}
                className="w-full xl:w-1/2 px-2 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 text-center whitespace-nowrap transition-colors cursor-pointer"
              >
                <i className="ph-bold ph-download-simple text-sm"></i>
                <span>Download Docs</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenTender('MP-MKT-2026-012')}
                className="w-full xl:w-1/2 bg-mpRed hover:bg-red-700 text-white font-bold py-2 px-2 rounded-lg flex items-center justify-center gap-1 text-[11px] text-center shadow-xs transition-colors cursor-pointer"
              >
                <span>Express Interest / Submit Bid</span>
                <i className="ph-bold ph-arrow-right text-sm"></i>
              </button>
            </div>
          </div>

          {/* Card 4: MP-STR-2026-099 (Restricted Tender) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col transition-all duration-300 border-t-4 border-amber-500 ring-2 ring-amber-100 relative">
            <div className="p-5 border-b border-slate-100 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  <i className="ph-fill ph-lock-key mr-1"></i> Restricted Tender
                </span>
              </div>
              <h3 className="text-xs text-slate-400 font-bold mb-1 tracking-wide">MP-STR-2026-099</h3>
              <p className="text-[15px] font-bold text-slate-900 leading-snug mb-2">
                Next-Gen OTT Streaming Platform Core Architecture
              </p>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                Development and integration of core cloud video streaming architecture for Media Prima's upcoming digital platform.
              </p>

              <p className="text-[10px] font-semibold text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-auto">
                Strict NDA Verification Required before Document Access &amp; Bid Submission.
              </p>
            </div>

            <div className="p-4 bg-slate-50 mt-auto border-t border-slate-200 flex flex-col gap-2">
              <div
                className={`w-full text-center py-1 rounded text-[10px] font-bold mb-1 transition-colors ${
                  ndaVerified || isNdaSignedForCurrentBidder('MP-STR-2026-099')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                Status: {ndaVerified || isNdaSignedForCurrentBidder('MP-STR-2026-099') ? 'NDA Verified ✓ (Access Granted)' : 'NDA Required'}
              </div>

              <button
                type="button"
                onClick={() => showToast('Downloading official statutory NDA undertaking form...')}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>1. Download NDA Form (PDF)</span>
                <i className="ph-fill ph-file-lock text-sm"></i>
              </button>

              <button
                type="button"
                disabled={ndaUploading || ndaVerified}
                onClick={handleSimulateNda}
                className={`w-full px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs border-2 text-center cursor-pointer ${
                  ndaVerified
                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50 bg-white'
                }`}
              >
                {ndaUploading ? (
                  <>
                    <i className="ph-bold ph-spinner-gap animate-spin text-amber-600"></i>
                    <span>Verifying NDA Document...</span>
                  </>
                ) : ndaVerified ? (
                  <>
                    <i className="ph-fill ph-file-pdf text-emerald-600"></i>
                    <span>Signed_NDA_SyarikatABC.pdf (Verified)</span>
                  </>
                ) : (
                  <span>2. Upload Signed &amp; Stamped NDA (Simulated)</span>
                )}
              </button>

              <button
                type="button"
                disabled={!ndaVerified && !isNdaSignedForCurrentBidder('MP-STR-2026-099')}
                onClick={() => handleOpenTender('MP-STR-2026-099')}
                className={`w-full mt-2 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-xs transition-colors ${
                  ndaVerified || isNdaSignedForCurrentBidder('MP-STR-2026-099')
                    ? 'bg-mpRed hover:bg-red-700 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <i className="ph-fill ph-lock-key text-sm"></i>
                <span>Express Interest / Submit Bid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Tender ID &amp; Scope</th>
                <th className="px-4 py-3">Type &amp; Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTenders.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{t.referenceNo}</div>
                    <div className="text-xs text-slate-600">{t.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-medium border border-blue-100 mb-0.5">
                      {t.submissionType}
                    </span>
                    <div className="text-[11px] text-slate-500">{t.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenTender(t.id)}
                      className="px-3 py-1.5 bg-mpRed hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Open Workspace &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
