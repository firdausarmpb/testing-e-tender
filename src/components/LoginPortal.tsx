import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { PrimaryAppRole, UserProfile } from '../types/tender';
import { INITIAL_USERS } from '../data/mockData';

export const LoginPortal: React.FC = () => {
  const { loginAsUser, loginAsRole, signInWithGoogle, isFirebaseConnected } = useTender();
  const [activeRoleTab, setActiveRoleTab] = useState<PrimaryAppRole>('vendor');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Filter users by role
  const vendorUsers = INITIAL_USERS.filter((u) => u.role === 'vendor' || u.role === 'bidder');
  const governanceUsers = INITIAL_USERS.filter((u) => u.role === 'governance' || u.role === 'auditor');
  const procurementUsers = INITIAL_USERS.filter((u) => u.role === 'procurement' || u.role === 'admin');

  const handleQuickLogin = (user: UserProfile) => {
    setErrorMsg(null);
    loginAsUser(user);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    loginAsRole(activeRoleTab, {
      email: customEmail.trim(),
      name: customName.trim() || customEmail.split('@')[0].toUpperCase(),
      companyName:
        customCompany.trim() ||
        (activeRoleTab === 'vendor'
          ? 'Registered Vendor Company'
          : activeRoleTab === 'governance'
          ? 'Media Prima Group Internal Audit'
          : 'Media Prima Group Procurement'),
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
      loginAsRole(activeRoleTab);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google.';
      setErrorMsg(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-[#0037b0] selection:text-white relative overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-emerald-600 rounded-full blur-[130px]"></div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="bg-[#ba1a1a] text-white font-extrabold px-2 py-0.5 text-xs rounded-l tracking-wider uppercase">
              media
            </span>
            <span className="bg-slate-800 text-white font-extrabold px-2 py-0.5 text-xs rounded-r tracking-wider uppercase border border-slate-700">
              prima
            </span>
          </div>
          <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>
          <span className="text-white font-bold text-xs tracking-wide hidden sm:inline">
            BID NEXT • eTender Access Control Gateway
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isFirebaseConnected ? 'Firebase Cloud Active' : 'ISO 27001 Secure Protocol'}</span>
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
          {/* Hero Banner inside card */}
          <div className="bg-gradient-to-r from-[#0b1c30] via-[#102a4d] to-[#0037b0] p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20 mb-2">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                <span>ROLE-BASED ACCESS CONTROL (RBAC) GATEWAY</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                eTender System Login
              </h1>
              <p className="text-slate-300 text-xs mt-1 max-w-md">
                Please select your role category to initiate your session. Each role is strictly granted access only to its designated views.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[30px] text-blue-300">verified_user</span>
            </div>
          </div>

          {/* Three Role Tabs Selector */}
          <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200">
            {/* Vendor Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('vendor');
                setErrorMsg(null);
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeRoleTab === 'vendor'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">business</span>
                <span className="hidden sm:inline">1. Supplier /</span>
                <span>Vendor</span>
              </div>
              <span className={`text-[10px] font-normal hidden sm:block ${activeRoleTab === 'vendor' ? 'text-blue-600' : 'text-slate-500'}`}>
                Bids &amp; RFP Documents
              </span>
            </button>

            {/* Governance Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('governance');
                setErrorMsg(null);
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeRoleTab === 'governance'
                  ? 'bg-white text-purple-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span className="hidden sm:inline">2. Governance /</span>
                <span>Audit</span>
              </div>
              <span className={`text-[10px] font-normal hidden sm:block ${activeRoleTab === 'governance' ? 'text-purple-600' : 'text-slate-500'}`}>
                Audit &amp; Crypto Unsealing
              </span>
            </button>

            {/* Procurement Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveRoleTab('procurement');
                setErrorMsg(null);
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeRoleTab === 'procurement'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <span className="hidden sm:inline">3. Procurement /</span>
                <span>Division</span>
              </div>
              <span className={`text-[10px] font-normal hidden sm:block ${activeRoleTab === 'procurement' ? 'text-emerald-600' : 'text-slate-500'}`}>
                Matrix &amp; Management
              </span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 flex flex-col gap-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Role Category Description Banner */}
            {activeRoleTab === 'vendor' && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex flex-col gap-1.5">
                <div className="font-bold flex items-center gap-1.5 text-blue-800 text-sm">
                  <span className="material-symbols-outlined text-[18px]">store</span>
                  <span>Supplier &amp; Bidding Contractor Category</span>
                </div>
                <p className="text-blue-700 leading-relaxed text-[11px]">
                  <strong>Authorized Access:</strong> Browse Active Tenders, download RFP packages upon executing digital NDA, submit Dual-Envelope proposals (Envelope A Technical &amp; Envelope B Commercial BOQ), and submit clarification inquiries.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-blue-600 font-semibold pt-1 border-t border-blue-100">
                  <span className="material-symbols-outlined text-[14px]">block</span>
                  <span>Access to Internal Audit &amp; Commercial Evaluation Matrix is strictly prohibited.</span>
                </div>
              </div>
            )}

            {activeRoleTab === 'governance' && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 flex flex-col gap-1.5">
                <div className="font-bold flex items-center gap-1.5 text-purple-800 text-sm">
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  <span>Governance &amp; Group Internal Audit Category</span>
                </div>
                <p className="text-purple-700 leading-relaxed text-[11px]">
                  <strong>Authorized Access:</strong> Independent bid integrity auditing, SHA-256 cryptographic checksum verification, Envelope A statutory review, and granting official clearance to unseal Commercial Bids.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-purple-600 font-semibold pt-1 border-t border-purple-100">
                  <span className="material-symbols-outlined text-[14px]">block</span>
                  <span>Access to vendor bid draft submissions is strictly prohibited.</span>
                </div>
              </div>
            )}

            {activeRoleTab === 'procurement' && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex flex-col gap-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800 text-sm">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  <span>Group Procurement Division Category</span>
                </div>
                <p className="text-emerald-700 leading-relaxed text-[11px]">
                  <strong>Authorized Access:</strong> Automated Commercial Evaluation Matrix, BOQ price comparison &amp; Capex variance analytics, 70:30 weighted composite scoring, Tender Board award recommendation, creating new tenders, and issuing pre-bid addendums.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-semibold pt-1 border-t border-emerald-100">
                  <span className="material-symbols-outlined text-[14px]">block</span>
                  <span>Direct cryptographic unsealing authorization is restricted to Independent Audit (Blind Technical Protocol).</span>
                </div>
              </div>
            )}

            {/* Quick 1-Click Login Profiles Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  SELECT OFFICIAL LOGIN PROFILE
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isCustomMode ? 'groups' : 'edit_note'}
                  </span>
                  <span>{isCustomMode ? 'Use Quick Profiles' : 'Manual Email Sign-In'}</span>
                </button>
              </div>

              {!isCustomMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeRoleTab === 'vendor' &&
                    vendorUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickLogin(user)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[20px]">apartment</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700 truncate">
                            {user.companyName}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {user.cidbGrade || 'Vendor CIDB G7'} • {user.vendorId || 'V-Verified'}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                          arrow_forward
                        </span>
                      </button>
                    ))}

                  {activeRoleTab === 'governance' &&
                    governanceUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickLogin(user)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[20px]">security</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 text-xs group-hover:text-purple-700 truncate">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">{user.designation}</div>
                          <div className="text-[10px] text-purple-600 font-medium mt-0.5 truncate">
                            {user.companyName}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all">
                          arrow_forward
                        </span>
                      </button>
                    ))}

                  {activeRoleTab === 'procurement' &&
                    procurementUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickLogin(user)}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[20px]">badge</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 truncate">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">{user.designation}</div>
                          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate">
                            {user.companyName}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">
                          arrow_forward
                        </span>
                      </button>
                    ))}
                </div>
              ) : (
                /* Custom Email Login Form */
                <form onSubmit={handleCustomSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Official Email Address ({activeRoleTab.toUpperCase()})
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder={
                        activeRoleTab === 'vendor'
                          ? 'officer@supplier.com'
                          : activeRoleTab === 'governance'
                          ? 'auditor@audit.mediaprima.com.my'
                          : 'officer@mediaprima.com.my'
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name of Representative / Officer
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Daniel Wong"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {activeRoleTab === 'vendor' ? 'Company Name & SSM Reg' : 'Department / Division'}
                      </label>
                      <input
                        type="text"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        placeholder={
                          activeRoleTab === 'vendor' ? 'e.g. Apex Infra Systems Sdn Bhd' : 'Group Operations'
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Password / Security PIN
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      activeRoleTab === 'vendor'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : activeRoleTab === 'governance'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">login</span>
                    <span>Sign In as {activeRoleTab === 'vendor' ? 'Supplier / Vendor' : activeRoleTab === 'governance' ? 'Governance & Audit' : 'Procurement Division'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Google Firebase Authentication Option */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Cloud Authentication Option:
              </span>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Connecting...' : `Sign in with Google (${activeRoleTab.toUpperCase()})`}</span>
              </button>
            </div>
          </div>

          {/* Footer Security Strip inside card */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">lock</span>
              <span>TLS 1.3 Encryption &amp; Dual-Envelope Sealed Protocol • Media Prima Berhad</span>
            </div>
            <span>System Version 2.4 (Audit Ready)</span>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-slate-400 text-xs border-t border-slate-800 bg-slate-950/80">
        <p className="max-w-xl mx-auto px-4">
          © {new Date().getFullYear()} Media Prima Berhad (Co. Reg. No. 200001026048 / 531655-U). All rights reserved. Unauthorized access is strictly prohibited and subject to legal prosecution.
        </p>
      </footer>
    </div>
  );
};
