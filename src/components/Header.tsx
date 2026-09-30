import React, { useState } from 'react';
import { useTender, ActiveNavTab } from '../context/TenderContext';
import { getPrimaryRole } from '../types/tender';

interface HeaderProps {
  onOpenLoginModal?: () => void;
  onOpenAuditTrail?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLoginModal,
  onOpenAuditTrail,
}) => {
  const {
    activeNavTab,
    setActiveNavTab,
    currentUser,
    switchUser,
    logout,
    getAllowedTabs,
    firebaseUser,
  } = useTender();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const primaryRole = getPrimaryRole(currentUser.role);
  const allowedTabs = getAllowedTabs(currentUser.role);

  // All master navigation items
  const allNavDefinitions: {
    id: ActiveNavTab;
    label: string;
    icon: string;
    activeClass: string;
    roleTag?: string;
  }[] = [
    {
      id: 'active-tenders',
      label: 'Published Tenders',
      icon: 'ph-newspaper-clipping',
      activeClass: 'bg-white/15 text-white font-bold',
    },
    {
      id: 'submissions',
      label: 'Two-Envelope Bidding',
      icon: 'ph-file-lock',
      activeClass: 'bg-blue-600 text-white font-bold shadow-xs',
      roleTag: 'Vendor',
    },
    {
      id: 'governance-audit',
      label: 'Integrity & Audit Portal',
      icon: 'ph-shield-check',
      activeClass: 'bg-purple-600 text-white font-bold shadow-xs',
      roleTag: 'Audit',
    },
    {
      id: 'procurement-admin',
      label: 'Commercial Matrix (70:30)',
      icon: 'ph-chart-bar',
      activeClass: 'bg-emerald-600 text-white font-bold shadow-xs',
      roleTag: 'Procurement',
    },
    {
      id: 'create-tender',
      label: 'Create New Tender',
      icon: 'ph-plus-circle',
      activeClass: 'bg-amber-600 text-white font-bold shadow-xs',
      roleTag: 'Procurement',
    },
    {
      id: 'clarification-desk',
      label: 'Clarification & Q&A Desk',
      icon: 'ph-chats-circle',
      activeClass: 'bg-white/15 text-white font-bold',
    },
  ];

  // Filter to strictly permitted tabs only
  const visibleNavTabs = allNavDefinitions.filter((item) => allowedTabs.includes(item.id));

  const handleNavClick = (tab: ActiveNavTab) => {
    setActiveNavTab(tab);
    setMobileMenuOpen(false);
  };

  const getRoleBadgeDisplay = () => {
    switch (primaryRole) {
      case 'vendor':
        return {
          title: 'SUPPLIER / VENDOR',
          badgeColor: 'bg-blue-900/80 text-blue-300 border-blue-500/40',
          dotColor: 'bg-blue-400',
        };
      case 'governance':
        return {
          title: 'GOVERNANCE / AUDIT',
          badgeColor: 'bg-purple-900/80 text-purple-300 border-purple-500/40',
          dotColor: 'bg-purple-400',
        };
      case 'procurement':
        return {
          title: 'GROUP PROCUREMENT',
          badgeColor: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',
          dotColor: 'bg-emerald-400',
        };
    }
  };

  const roleBadge = getRoleBadgeDisplay();

  return (
    <>
      <header className="bg-[#0b1c30] border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Media Prima Logo + Brand Identity */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                if (allowedTabs.length > 0) {
                  setActiveNavTab(allowedTabs[0]);
                }
              }}
              className="flex items-stretch h-8 cursor-pointer shadow-xs hover:opacity-95 transition-opacity"
              title="Media Prima Berhad eTender Portal"
            >
              <div className="bg-[#ba1a1a] text-white font-black text-sm px-2.5 flex items-center justify-center tracking-tight uppercase">
                media
              </div>
              <div className="bg-white text-black font-black text-sm px-2.5 flex items-center justify-center tracking-tight uppercase">
                prima
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700 hidden lg:block"></div>
            <div className="hidden lg:flex flex-col">
              <span className="text-white font-bold tracking-wide text-xs leading-none">
                BID NEXT • eTender
              </span>
              <span className="text-slate-400 text-[10px] mt-0.5">Enterprise Procurement Intelligence</span>
            </div>
          </div>

          {/* Center: Main Navigation Tabs (Strictly Filtered by Active Role) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold">
            {visibleNavTabs.map((item) => {
              const isActive = activeNavTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? item.activeClass
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className={`ph-bold ${item.icon} text-sm`}></i>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Role Indicator, User Selector, Audit Trail & Logout */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Active Role Pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${roleBadge.badgeColor}`}
            >
              <span className={`w-2 h-2 rounded-full ${roleBadge.dotColor} animate-pulse`}></span>
              <span>{roleBadge.title}</span>
            </div>

            {/* User Profile & Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="bg-slate-800/80 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <div className={`w-2 h-2 rounded-full ${roleBadge.dotColor}`}></div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">
                    Signed in:
                  </div>
                  <div className="font-semibold text-white leading-tight mt-0.5 truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                </div>
                <i className="ph ph-caret-down text-slate-400 text-xs ml-0.5"></i>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                        Current Session
                      </span>
                      <span className="text-[10px] text-slate-500">{currentUser.companyName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <i className="ph ph-x"></i>
                    </button>
                  </div>

                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Active Role:
                    </div>

                    {/* Vendor Option */}
                    <button
                      type="button"
                      onClick={() => {
                        switchUser('usr_ahmad_syakir');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer ${
                        primaryRole === 'vendor'
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">business</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>1. Supplier / Vendor</span>
                          {primaryRole === 'vendor' && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-normal">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">Syarikat ABC Sdn Bhd</div>
                        <div className="text-[10px] text-blue-600 mt-0.5">Access: Bids &amp; RFP Documents</div>
                      </div>
                    </button>

                    {/* Governance Option */}
                    <button
                      type="button"
                      onClick={() => {
                        switchUser('usr_daniel_wong');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer ${
                        primaryRole === 'governance'
                          ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>2. Governance &amp; Audit</span>
                          {primaryRole === 'governance' && (
                            <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-normal">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">Ir. Daniel Wong (Internal Audit)</div>
                        <div className="text-[10px] text-purple-600 mt-0.5">Access: Crypto Audit &amp; Unsealing</div>
                      </div>
                    </button>

                    {/* Procurement Option */}
                    <button
                      type="button"
                      onClick={() => {
                        switchUser('usr_noraini_ismail');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer ${
                        primaryRole === 'procurement'
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>3. Group Procurement</span>
                          {primaryRole === 'procurement' && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-normal">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">Noraini Ismail (Procurement)</div>
                        <div className="text-[10px] text-emerald-600 mt-0.5">Access: Matrix &amp; Tender Creation</div>
                      </div>
                    </button>

                    {/* Divider & Actions */}
                    <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-1.5">
                      {onOpenLoginModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenLoginModal();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-500">manage_accounts</span>
                          <span>Open Full Role Switcher</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-red-500">logout</span>
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cloud Status Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                firebaseUser
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${firebaseUser ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></div>
              <span>{firebaseUser ? 'Cloud Live' : 'Cloud Ready'}</span>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
                title="System Notifications"
              >
                <i className="ph-bold ph-bell text-lg"></i>
                <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  2
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900">System Notifications</span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <i className="ph ph-x"></i>
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                        <i className="ph-fill ph-info"></i> MP-IT-2026-001 Published
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        IT Equipment Supply tender is now open for sealed bid submissions.
                      </p>
                    </div>
                    <div className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <i className="ph-fill ph-check-circle"></i> Audit Clearance Ready
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Bidding envelope closed and pending independent integrity audit verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Audit Trail Button */}
            {onOpenAuditTrail && (
              <button
                type="button"
                onClick={onOpenAuditTrail}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800 hidden sm:block cursor-pointer"
                title="Cryptographic Audit Trail"
              >
                <i className="ph-bold ph-clock-counter-clockwise text-lg"></i>
              </button>
            )}

            {/* Dedicated Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Sign Out Session"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden xl:inline">Sign Out</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <i className="ph-bold ph-list text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown (Strictly Filtered) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0e1f38] border-t border-slate-800 px-4 py-3 space-y-1 pb-4 animate-fadeIn text-xs">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Role Menu: {roleBadge.title}
            </div>
            {visibleNavTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-3 py-2 rounded-md font-medium transition-colors cursor-pointer ${
                  activeNavTab === item.id
                    ? item.activeClass
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className={`ph-bold ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </div>
                  {item.roleTag && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {item.roleTag}
                    </span>
                  )}
                </div>
              </button>
            ))}

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                {currentUser.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
