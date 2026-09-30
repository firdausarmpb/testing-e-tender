import React, { useState } from 'react';
import { useTender } from '../context/TenderContext';
import { UserRole, getPrimaryRole } from '../types/tender';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { 
    allUsers, 
    currentUser, 
    switchUser, 
    loginWithEmail,
    firebaseUser,
    signInWithGoogle,
    signOutFirebase,
    logout,
  } = useTender();
  const [selectedRole] = useState<UserRole>('bidder');
  const [customEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const primaryRole = getPrimaryRole(currentUser.role);

  const handleSelectQuickUser = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  const handleGoogleAuth = async () => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setErrorMessage(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Group users into 3 requested categories
  const vendorUsers = allUsers.filter((u) => u.role === 'vendor' || u.role === 'bidder');
  const governanceUsers = allUsers.filter((u) => u.role === 'governance' || u.role === 'auditor');
  const procurementUsers = allUsers.filter((u) => u.role === 'procurement' || u.role === 'admin' || u.role === 'requester');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                eTender Role &amp; Session Management
              </h2>
              <p className="text-xs text-slate-500">
                Select between 3 Role Categories: Supplier, Governance, or Procurement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Current Active Persona Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0037b0] text-white flex items-center justify-center font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase">
                    {primaryRole.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{currentUser.companyName}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>

          {/* 3 Categories Section */}
          <div className="space-y-4">
            {/* Category 1: Vendor */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="font-bold text-xs text-blue-900 uppercase tracking-wide">
                  1. Supplier / Vendor Category
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Designated: Published Tenders &amp; Two-Envelope Sealed Bidding)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vendorUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectQuickUser(u.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                        <span>{u.name}</span>
                        {isCurrent && <span className="text-[9px] text-blue-700 bg-blue-100 px-1.5 rounded">Active</span>}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">{u.companyName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.cidbGrade || 'CIDB G7'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 2: Governance */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span className="font-bold text-xs text-purple-900 uppercase tracking-wide">
                  2. Governance &amp; Internal Audit Category
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Designated: Cryptographic Integrity Auditing &amp; Commercial Unsealing)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {governanceUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectQuickUser(u.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                        <span>{u.name}</span>
                        {isCurrent && <span className="text-[9px] text-purple-700 bg-purple-100 px-1.5 rounded">Active</span>}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">{u.designation}</div>
                      <div className="text-[10px] text-purple-600 font-medium mt-0.5">{u.companyName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 3: Procurement */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="font-bold text-xs text-emerald-900 uppercase tracking-wide">
                  3. Group Procurement Division Category
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Designated: Commercial Comparison Matrix &amp; Tender Publishing)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {procurementUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectQuickUser(u.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                        <span>{u.name}</span>
                        {isCurrent && <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 rounded">Active</span>}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">{u.designation}</div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{u.companyName}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200"></div>

          {/* Firebase Authentication & Google Sign-In */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${firebaseUser ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                  Firebase Cloud Synchronization
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-semibold">
                asia-southeast1
              </span>
            </div>

            {firebaseUser ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {firebaseUser.displayName?.charAt(0) || firebaseUser.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {firebaseUser.displayName || 'Google Account'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{firebaseUser.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOutFirebase}
                  className="px-2.5 py-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSigningIn}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Connect Google Account (Firebase)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
