import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TenderMaster,
  UserProfile,
  BidSubmission,
  ClarificationQuestion,
  NdaAgreement,
  AuditLogEvent,
  UserRole,
  PrimaryAppRole,
  getPrimaryRole,
} from '../types/tender';
import {
  INITIAL_USERS,
  INITIAL_TENDERS,
  INITIAL_BIDS_MP_ENG_042,
  INITIAL_BIDS_MP_IT_001,
  INITIAL_BIDS_MP_BC_008,
  INITIAL_BIDS_MP_STR_015,
  COMPETING_BIDS_MP_IT_001,
  SYARIKAT_ABC_BID_MP_IT_001,
  INITIAL_CLARIFICATIONS,
  INITIAL_NDA_AGREEMENTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../firebase';

export type ActiveNavTab =
  | 'active-tenders'
  | 'submissions'
  | 'governance-audit'
  | 'procurement-admin'
  | 'clarification-desk'
  | 'create-tender'
  | 'requester-view';

export function getAllowedTabsForRole(role: UserRole): ActiveNavTab[] {
  const primary = getPrimaryRole(role);
  if (primary === 'governance') {
    return ['governance-audit'];
  }
  if (primary === 'procurement') {
    return ['procurement-admin', 'active-tenders', 'create-tender', 'clarification-desk'];
  }
  // Vendor / Bidder / default
  return ['active-tenders', 'submissions', 'clarification-desk'];
}

export function getDefaultTabForRole(role: UserRole): ActiveNavTab {
  const primary = getPrimaryRole(role);
  if (primary === 'governance') return 'governance-audit';
  if (primary === 'procurement') return 'procurement-admin';
  return 'active-tenders';
}

interface TenderContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  activeNavTab: ActiveNavTab;
  setActiveNavTab: (tab: ActiveNavTab) => void;
  currentTenderId: string;
  setCurrentTenderId: (id: string) => void;
  currentTender: TenderMaster;
  tenders: TenderMaster[];
  bids: Record<string, BidSubmission[]>; // tenderId -> bids
  ndaAgreements: NdaAgreement[];
  clarifications: ClarificationQuestion[];
  auditLogs: AuditLogEvent[];

  // Role Gatekeeping & Auth
  isAuthenticated: boolean;
  loginAsUser: (user: UserProfile) => void;
  loginAsRole: (role: PrimaryAppRole, customDetails?: { name?: string; email?: string; companyName?: string }) => void;
  logout: () => void;
  getAllowedTabs: (role?: UserRole) => ActiveNavTab[];
  isTabAllowed: (tab: ActiveNavTab, role?: UserRole) => boolean;

  // Firebase Auth & Cloud Sync
  firebaseUser: User | null;
  isFirebaseConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutFirebase: () => Promise<void>;
  syncWithCloud: () => Promise<void>;

  // Role & Login
  switchUser: (userId: string) => void;
  switchRole: (role: 'vendor' | 'requester' | 'governance' | 'admin') => void;
  loginWithEmail: (email: string, role: UserRole) => { success: boolean; error?: string };
  isEmailInvited: (tenderId: string, email: string) => boolean;

  // Deadline Cutoff Simulation
  isSimulatedDeadlineExpired: boolean;
  toggleSimulatedDeadlineExpired: () => void;
  isTenderDeadlinePassed: (tenderId: string) => boolean;

  // NDA Workflow (PRD F03)
  isNdaSignedForCurrentBidder: (tenderId: string) => boolean;
  signNda: (tenderId: string, fullName: string, idNumber: string) => Promise<void> | void;

  // Bid Submission Workflow (PRD F04 & Screen 1)
  submitBid: (bidData: Omit<BidSubmission, 'id' | 'submittedAt' | 'checksumSha256' | 'isAuditVerified'>) => {
    success: boolean;
    error?: string;
    token?: string;
  };

  // Audit Verification Workflow (PRD F06)
  verifyBid: (bidId: string, verified: boolean, remarks?: string) => Promise<void> | void;
  verifyAllBids: (tenderId: string) => Promise<void> | void;
  releaseTenderToProcurement: (tenderId: string) => { success: boolean; error?: string };

  // Guided Tender Workflow Transitions
  startTenderWorkflowStage: (stage: 'submit' | 'audit' | 'matrix', tenderId?: string) => void;
  resetITEquipmentTenderProcess: () => void;
  fastForwardITEquipmentTender: () => void;

  // Procurement Management (PRD F01, F07)
  createNewTender: (tender: Omit<TenderMaster, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
  submitToTenderBoard: (tenderId: string) => Promise<void> | void;

  // Clarification Q&A (Screen 3)
  submitClarification: (q: {
    tenderId: string;
    category: ClarificationQuestion['category'];
    categoryLabel: string;
    subject: string;
    details: string;
    attachmentName?: string;
  }) => Promise<void> | void;
  answerClarification: (id: string, answer: string, circularRef?: string) => Promise<void> | void;

  // Reset Demo
  resetDemoData: () => void;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'mediaprima_bidnext_v1_';

export const TenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Authentication state (Mandatory login: defaults to false if not previously logged in)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}is_authenticated`);
    return saved === 'true';
  });

  // Load state from localStorage or initial mock data
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return INITIAL_USERS[0]; // Ahmad Syakir (Bidder) by default
  });

  const [tenders, setTenders] = useState<TenderMaster[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tenders`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return INITIAL_TENDERS;
  });

  const [currentTenderId, setCurrentTenderId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_tender_id`);
    return saved || 'MP-IT-2026-001';
  });

  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab>('submissions');

  const [bids, setBids] = useState<Record<string, BidSubmission[]>>(() => {
    const defaults = {
      'MP-IT-2026-001': INITIAL_BIDS_MP_IT_001,
      'MP-ENG-2026-042': INITIAL_BIDS_MP_ENG_042,
      'MP-BC-2026-008': INITIAL_BIDS_MP_BC_008,
      'MP-STR-2026-015': INITIAL_BIDS_MP_STR_015,
    };
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bids`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        /* ignore */
      }
    }
    return defaults;
  });

  const [ndaAgreements, setNdaAgreements] = useState<NdaAgreement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}nda_agreements`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return INITIAL_NDA_AGREEMENTS;
  });

  const [clarifications, setClarifications] = useState<ClarificationQuestion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}clarifications`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return INITIAL_CLARIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [isSimulatedDeadlineExpired, setIsSimulatedDeadlineExpired] = useState<boolean>(false);

  // Sync initial seed data to Firestore if collection is empty
  const syncInitialDataToFirestore = async () => {
    try {
      const snap = await getDocs(collection(db, 'tenders'));
      if (snap.empty) {
        for (const t of INITIAL_TENDERS) {
          await setDoc(doc(db, 'tenders', t.id), t);
        }
      }
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Initial Firestore seed check notice:', err);
    }
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsFirebaseConnected(true);
        // If logged in as specific admin or general Google user
        const isAdmin = user.email === 'firdausabd88@gmail.com' || user.email?.includes('admin');
        const updatedUser: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Authenticated User',
          email: user.email || 'user@mediaprima.com.my',
          role: isAdmin ? 'admin' : 'bidder',
          companyName: isAdmin
            ? 'Media Prima Berhad (Group Procurement & Admin)'
            : 'Verified Supplier Sdn Bhd',
          designation: isAdmin ? 'Lead Procurement Administrator' : 'Authorized Tender Signatory',
          isVerifiedVendor: true,
          cidbGrade: 'G7',
          vendorId: `VND-${user.uid.slice(0, 5).toUpperCase()}`,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(updatedUser));
        await syncInitialDataToFirestore();
      } else {
        setIsFirebaseConnected(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Listeners when authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubTenders = onSnapshot(
      collection(db, 'tenders'),
      (snap) => {
        if (!snap.empty) {
          const remoteTenders: TenderMaster[] = [];
          snap.forEach((d) => remoteTenders.push(d.data() as TenderMaster));
          if (remoteTenders.length > 0) {
            setTenders(remoteTenders);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'tenders');
      }
    );

    const unsubClarifications = onSnapshot(
      collection(db, 'clarifications'),
      (snap) => {
        if (!snap.empty) {
          const remoteQs: ClarificationQuestion[] = [];
          snap.forEach((d) => remoteQs.push(d.data() as ClarificationQuestion));
          if (remoteQs.length > 0) {
            setClarifications(remoteQs);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'clarifications');
      }
    );

    return () => {
      unsubTenders();
      unsubClarifications();
    };
  }, [firebaseUser]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tenders`, JSON.stringify(tenders));
  }, [tenders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_tender_id`, currentTenderId);
  }, [currentTenderId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bids`, JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}nda_agreements`, JSON.stringify(ndaAgreements));
  }, [ndaAgreements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}clarifications`, JSON.stringify(clarifications));
  }, [clarifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Derived current tender
  const currentTender = tenders.find((t) => t.id === currentTenderId) || tenders[0];

  // Helper: check if deadline is passed
  const isTenderDeadlinePassed = (tenderId: string): boolean => {
    if (isSimulatedDeadlineExpired) return true;
    const target = tenders.find((t) => t.id === tenderId);
    if (!target) return false;
    return new Date() > new Date(target.closingDeadline);
  };

  const toggleSimulatedDeadlineExpired = () => {
    setIsSimulatedDeadlineExpired((prev) => !prev);
  };

  // Helper: check if email is invited
  const isEmailInvited = (tenderId: string, email: string): boolean => {
    const target = tenders.find((t) => t.id === tenderId);
    if (!target) return false;
    return target.invitedEmails.some((e) => e.toLowerCase() === email.toLowerCase());
  };

  // Helper: check if current bidder has signed NDA
  const isNdaSignedForCurrentBidder = (tenderId: string): boolean => {
    if (currentUser.role !== 'bidder') return true;
    return ndaAgreements.some(
      (nda) => nda.tenderId === tenderId && (nda.bidderId === currentUser.id || nda.bidderId === currentUser.email)
    );
  };

  // User Switcher, Auth & RBAC Gatekeeper
  const getAllowedTabs = (role?: UserRole): ActiveNavTab[] => {
    return getAllowedTabsForRole(role || currentUser.role);
  };

  const isTabAllowed = (tab: ActiveNavTab, role?: UserRole): boolean => {
    const allowed = getAllowedTabsForRole(role || currentUser.role);
    return allowed.includes(tab);
  };

  const loginAsUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}is_authenticated`, 'true');
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(user));
    const targetTab = getDefaultTabForRole(user.role);
    setActiveNavTab(targetTab);

    // Audit log
    const newLog: AuditLogEvent = {
      id: `log_login_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      details: `User successfully authenticated: ${user.name} (${user.companyName}) [Role: ${user.role}]`,
      tenderRef: 'SYSTEM_AUTH',
      hashToken: `auth_sha256_${Math.random().toString(36).substring(2, 10)}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const loginAsRole = (
    role: PrimaryAppRole,
    customDetails?: { name?: string; email?: string; companyName?: string }
  ) => {
    let targetUser: UserProfile;
    if (role === 'governance') {
      targetUser = INITIAL_USERS.find((u) => u.id === 'usr_daniel_wong') || INITIAL_USERS[2];
    } else if (role === 'procurement') {
      targetUser = INITIAL_USERS.find((u) => u.id === 'usr_noraini_ismail') || INITIAL_USERS[3];
    } else {
      targetUser = INITIAL_USERS.find((u) => u.id === 'usr_ahmad_syakir') || INITIAL_USERS[0];
    }

    if (customDetails && (customDetails.name || customDetails.email)) {
      targetUser = {
        ...targetUser,
        id: `usr_${Date.now()}`,
        name: customDetails.name || targetUser.name,
        email: customDetails.email || targetUser.email,
        companyName: customDetails.companyName || targetUser.companyName,
      };
    }

    loginAsUser(targetUser);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}is_authenticated`);
    if (firebaseUser) {
      signOutFirebase();
    }
  };

  const switchUser = (userId: string) => {
    const user = INITIAL_USERS.find((u) => u.id === userId);
    if (user) {
      loginAsUser(user);
    }
  };

  const switchRole = (role: 'vendor' | 'requester' | 'governance' | 'admin') => {
    let u = INITIAL_USERS[0];
    if (role === 'vendor') {
      u = INITIAL_USERS.find((usr) => usr.id === 'usr_ahmad_syakir') || INITIAL_USERS[0];
    } else if (role === 'governance') {
      u = INITIAL_USERS.find((usr) => usr.id === 'usr_daniel_wong') || INITIAL_USERS[2];
    } else if (role === 'admin' || role === 'requester') {
      u = INITIAL_USERS.find((usr) => usr.id === 'usr_noraini_ismail') || INITIAL_USERS[3];
    }
    loginAsUser(u);
  };

  const loginWithEmail = (email: string, role: UserRole) => {
    if (role === 'bidder') {
      const isInvited = tenders.some((t) =>
        t.invitedEmails.some((e) => e.toLowerCase() === email.toLowerCase())
      );
      if (!isInvited) {
        return {
          success: false,
          error: 'Akses terhad. Sila gunakan alamat emel yang dijemput atau semak kata laluan anda.',
        };
      }
    }

    const matchedUser = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (matchedUser) {
      loginAsUser(matchedUser);
    } else {
      const customUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email,
        role,
        companyName: role === 'bidder' ? 'Custom Invited Vendor Sdn Bhd' : 'Media Prima Berhad',
        designation: role === 'bidder' ? 'Authorized Vendor' : 'Officer',
        vendorId: role === 'bidder' ? `VND-2026-${Math.floor(100 + Math.random() * 900)}` : undefined,
        cidbGrade: role === 'bidder' ? 'G7' : undefined,
        ssmNumber: role === 'bidder' ? '202601009876 (123456-M)' : undefined,
        isVerifiedVendor: true,
      };
      loginAsUser(customUser);
    }

    return { success: true };
  };

  // Sign NDA (PRD F03)
  const signNda = async (tenderId: string, fullName: string, idNumber: string) => {
    const agreement: NdaAgreement = {
      tenderId,
      bidderId: currentUser.id,
      signedFullName: fullName,
      identificationNumber: idNumber,
      signedAt: new Date().toISOString(),
      ipAddress: '210.187.89.42 (Kuala Lumpur, MY)',
    };

    setNdaAgreements((prev) => [
      ...prev.filter((n) => !(n.tenderId === tenderId && n.bidderId === currentUser.id)),
      agreement,
    ]);

    const newLog: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'bidder',
      action: 'NDA_EXECUTED',
      details: `Digitally executed statutory NDA covenant for ${fullName} (${currentUser.companyName})`,
      tenderRef: tenderId,
      hashToken: `SHA256: ${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Persist to Firestore if authenticated
    if (auth.currentUser) {
      try {
        const ndaDocId = `${tenderId}_${currentUser.id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(db, 'ndaAgreements', ndaDocId), agreement);
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `ndaAgreements/${tenderId}`);
      }
    }
  };

  // Submit Bid (PRD F04 & F05)
  const submitBid = (
    bidData: Omit<BidSubmission, 'id' | 'submittedAt' | 'checksumSha256' | 'isAuditVerified'>
  ) => {
    if (isTenderDeadlinePassed(bidData.tenderId)) {
      return {
        success: false,
        error: 'Submission failed: Closing time exceeded.',
      };
    }

    if (!bidData.commercialProposalFileName || bidData.bqEntries.length === 0) {
      return {
        success: false,
        error: 'Both digital BQ prices and an attached PDF quotation are required to submit.',
      };
    }

    const hasInvalidPrice = bidData.bqEntries.some((e) => !e.unitPrice || e.unitPrice <= 0);
    if (hasInvalidPrice) {
      return {
        success: false,
        error: 'All price fields in the BQ form are strictly mandatory. Please fill in valid positive unit prices.',
      };
    }

    const token = `MP-2026-VND-${Math.floor(10000 + Math.random() * 90000)}-OK`;
    const isABC = currentUser.id === 'usr_ahmad_syakir' || currentUser.email === 'ahmad.syakir@syarikatabc.com.my';

    const newBid: BidSubmission = {
      ...bidData,
      id: `bid_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      checksumSha256: '7d49e...a91c',
      isAuditVerified: false,
      techSpecScore: isABC ? 28.5 : 28.0,
      trackRecordScore: isABC ? 18.7 : 18.0,
      slaTermsScore: isABC ? 18.8 : 18.2,
      combinedScore: isABC ? 94.68 : 93.0,
      rank: isABC ? 3 : 4,
    };

    setBids((prev) => {
      const existingTenderBids = prev[bidData.tenderId] || [];
      const updated = existingTenderBids.filter((b) => b.bidderId !== currentUser.id);
      return {
        ...prev,
        [bidData.tenderId]: [...updated, newBid],
      };
    });

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'bidder',
      action: 'BID_SEALED_SUBMISSION',
      details: `Two-Envelope encrypted bid submitted by ${currentUser.companyName}. Grand Total: RM ${bidData.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`,
      tenderRef: bidData.tenderId,
      hashToken: token,
    };
    setAuditLogs((prev) => [log, ...prev]);

    // Persist to Firestore if authenticated
    if (auth.currentUser) {
      setDoc(doc(db, 'bids', newBid.id), newBid).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `bids/${newBid.id}`);
      });
      setDoc(doc(db, 'auditLogs', log.id), log).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `auditLogs/${log.id}`);
      });
    }

    return { success: true, token };
  };

  // Verify Bid by Audit (PRD F06)
  const verifyBid = async (bidId: string, verified: boolean, remarks?: string) => {
    setBids((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((tenderId) => {
        next[tenderId] = next[tenderId].map((b) => {
          if (b.id === bidId) {
            return {
              ...b,
              isAuditVerified: verified,
              auditedBy: currentUser.name,
              auditedAt: new Date().toISOString(),
              auditRemarks: remarks || 'Verified by Group Internal Audit officer',
            };
          }
          return b;
        });
      });
      return next;
    });

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'auditor',
      action: verified ? 'AUDIT_VERIFIED' : 'AUDIT_FLAGGED',
      details: `Audit officer ${currentUser.name} updated verification status for bid ${bidId}.`,
      tenderRef: currentTenderId,
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'bids', bidId), {
          isAuditVerified: verified,
          auditedBy: currentUser.name,
          auditedAt: new Date().toISOString(),
          auditRemarks: remarks || 'Verified by Group Internal Audit officer',
        });
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `bids/${bidId}`);
      }
    }
  };

  // Master Release to Procurement (PRD F06)
  const verifyAllBids = async (tenderId: string) => {
    setBids((prev) => {
      const existing = prev[tenderId] || [];
      return {
        ...prev,
        [tenderId]: existing.map((b) => ({
          ...b,
          isAuditVerified: true,
          auditedBy: currentUser.name || 'Ir. Daniel Wong',
          auditedAt: new Date().toISOString(),
          auditRemarks: 'Verified 100% compliant with Technical & MOF parameters by Internal Audit.',
        })),
      };
    });

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'auditor',
      action: 'BATCH_AUDIT_VERIFIED',
      details: `Audit officer ${currentUser.name} verified all submitted bids for ${tenderId}.`,
      tenderRef: tenderId,
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `auditLogs/${log.id}`);
      }
    }
  };

  const startTenderWorkflowStage = (stage: 'submit' | 'audit' | 'matrix', tenderId: string = 'MP-IT-2026-001') => {
    setCurrentTenderId(tenderId);
    if (stage === 'submit') {
      switchUser('usr_ahmad_syakir');
      setActiveNavTab('submissions');
    } else if (stage === 'audit') {
      switchUser('usr_daniel_wong');
      setActiveNavTab('governance-audit');
    } else if (stage === 'matrix') {
      switchUser('usr_noraini_ismail');
      setActiveNavTab('procurement-admin');
    }
  };

  const resetITEquipmentTenderProcess = () => {
    const tenderId = 'MP-IT-2026-001';
    setCurrentTenderId(tenderId);

    setTenders((prev) =>
      prev.map((t) => (t.id === tenderId ? { ...t, status: 'Active' } : t))
    );

    setBids((prev) => ({
      ...prev,
      [tenderId]: COMPETING_BIDS_MP_IT_001.map((b) => ({
        ...b,
        isAuditVerified: false,
        auditedBy: undefined,
        auditedAt: undefined,
        auditRemarks: undefined,
      })),
    }));

    const ahmad = INITIAL_USERS.find((u) => u.id === 'usr_ahmad_syakir') || INITIAL_USERS[0];
    setCurrentUser(ahmad);
    setActiveNavTab('submissions');
    setIsSimulatedDeadlineExpired(false);

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: ahmad.id,
      userName: ahmad.name,
      role: 'bidder',
      action: 'WORKFLOW_RESET',
      details: `Interactive tender process for "${tenderId}" reset to Step 1 (Bidder Submission stage).`,
      tenderRef: tenderId,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const fastForwardITEquipmentTender = () => {
    const tenderId = 'MP-IT-2026-001';
    setCurrentTenderId(tenderId);

    setTenders((prev) =>
      prev.map((t) => (t.id === tenderId ? { ...t, status: 'Released' } : t))
    );

    const all5Bids: BidSubmission[] = [
      ...COMPETING_BIDS_MP_IT_001,
      SYARIKAT_ABC_BID_MP_IT_001,
    ].map((b) => ({
      ...b,
      isAuditVerified: true,
      auditedBy: 'Ir. Daniel Wong',
      auditedAt: '2026-03-12T16:45:00+08:00',
      auditRemarks: 'Verified 100% compliant with Technical & MOF parameters by Internal Audit.',
    }));

    setBids((prev) => ({
      ...prev,
      [tenderId]: all5Bids,
    }));

    const noraini = INITIAL_USERS.find((u) => u.id === 'usr_noraini_ismail') || INITIAL_USERS[2];
    setCurrentUser(noraini);
    setActiveNavTab('procurement-admin');

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: noraini.id,
      userName: noraini.name,
      role: 'procurement',
      action: 'WORKFLOW_FAST_FORWARD',
      details: `Fast-forwarded "${tenderId}" lifecycle to Step 3: Total Summary of Submissions & Commercial Matrix unlocked.`,
      tenderRef: tenderId,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const releaseTenderToProcurement = (tenderId: string) => {
    const tenderBids = bids[tenderId] || [];

    if (tenderBids.length === 0) {
      return {
        success: false,
        error: 'No bids have been submitted for this tender yet.',
      };
    }

    const unverifiedCount = tenderBids.filter((b) => !b.isAuditVerified).length;
    if (unverifiedCount > 0) {
      return {
        success: false,
        error: 'Please verify all vendor submissions before releasing.',
      };
    }

    setTenders((prev) =>
      prev.map((t) => (t.id === tenderId ? { ...t, status: 'Released' } : t))
    );

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'auditor',
      action: 'RELEASE_TO_PROCUREMENT',
      details: `Envelope 2 cryptographic vaults formally unlocked and released to Procurement Committee following 100% audit verification.`,
      tenderRef: tenderId,
      hashToken: `REL-${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
    };
    setAuditLogs((prev) => [log, ...prev]);

    return { success: true };
  };

  // Procurement: Create Tender (PRD F01)
  const createNewTender = async (tender: Omit<TenderMaster, 'id' | 'createdAt' | 'status'>) => {
    const id = `MP-${tender.referenceNo.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'NEW-2026'}`;
    const newTender: TenderMaster = {
      ...tender,
      id,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    setTenders((prev) => [newTender, ...prev]);
    setCurrentTenderId(id);

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'procurement',
      action: 'TENDER_CREATED',
      details: `Created new tender "${tender.title}" with closing deadline ${tender.closingDeadline}`,
      tenderRef: id,
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'tenders', newTender.id), newTender);
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `tenders/${newTender.id}`);
      }
    }
  };

  // Procurement: Submit to Tender Board (Screen 2)
  const submitToTenderBoard = async (tenderId: string) => {
    setTenders((prev) =>
      prev.map((t) =>
        t.id === tenderId
          ? {
              ...t,
              status: 'Awarded',
              tenderBoardSubmittedAt: new Date().toISOString(),
              awardedBidderId: 'usr_nexus_digital',
            }
          : t
      )
    );

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: 'procurement',
      action: 'SUBMITTED_TO_TENDER_BOARD',
      details: `Commercial Evaluation Matrix formally presented to Jawatankuasa Tender (Tender Board). Award recommended to Rank 1 lowest compliant bidder.`,
      tenderRef: tenderId,
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'tenders', tenderId), {
          status: 'Awarded',
          tenderBoardSubmittedAt: new Date().toISOString(),
          awardedBidderId: 'usr_nexus_digital',
        });
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `tenders/${tenderId}`);
      }
    }
  };

  // Clarification Q&A (Screen 3)
  const submitClarification = async (q: {
    tenderId: string;
    category: ClarificationQuestion['category'];
    categoryLabel: string;
    subject: string;
    details: string;
    attachmentName?: string;
  }) => {
    const newQ: ClarificationQuestion = {
      id: `clr_${Date.now()}`,
      tenderId: q.tenderId,
      category: q.category,
      categoryLabel: q.categoryLabel,
      trackingRef: `CLR-2026-${Math.floor(100 + Math.random() * 900)}`,
      subject: q.subject,
      details: q.details,
      submittedBy: currentUser.name,
      submittedByCompany: currentUser.companyName,
      submittedAt: 'Just now (Pending Review)',
      attachmentName: q.attachmentName,
      status: 'under_review',
    };

    setClarifications((prev) => [newQ, ...prev]);

    const log: AuditLogEvent = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-MY', { timeZoneName: 'short' }),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action: 'CLARIFICATION_SUBMITTED',
      details: `Clarification tracking ${newQ.trackingRef} logged under category: ${q.categoryLabel}`,
      tenderRef: q.tenderId,
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'clarifications', newQ.id), newQ);
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `clarifications/${newQ.id}`);
      }
    }
  };

  const answerClarification = async (id: string, answer: string, circularRef?: string) => {
    const cRef = circularRef || `CIR-MP-${Math.floor(100 + Math.random() * 900)}`;
    setClarifications((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            status: 'official_addendum',
            circularRef: cRef,
            officialAnswer: answer,
            smeResponder: {
              name: currentUser.name,
              designation: currentUser.designation,
              department: currentUser.companyName,
            },
            answeredAt: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }) + ' MYT',
            bindingAllBidders: true,
            addendumRevision: 'Rev 1.3',
          };
        }
        return c;
      })
    );

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'clarifications', id), {
          status: 'official_addendum',
          circularRef: cRef,
          officialAnswer: answer,
          answeredAt: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }) + ' MYT',
          bindingAllBidders: true,
          addendumRevision: 'Rev 1.3',
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `clarifications/${id}`);
      }
    }
  };

  // Sign in with Google via Firebase
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncInitialDataToFirestore();
      }
    } catch (error) {
      console.error('Firebase Google Sign-In error:', error);
      throw error;
    }
  };

  // Sign out of Firebase
  const signOutFirebase = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setIsFirebaseConnected(false);
      setCurrentUser(INITIAL_USERS[0]);
    } catch (error) {
      console.error('Firebase Sign-Out error:', error);
    }
  };

  // Manual trigger to sync cloud data
  const syncWithCloud = async () => {
    await syncInitialDataToFirestore();
  };

  // Reset Demo
  const resetDemoData = () => {
    localStorage.clear();
    setCurrentUser(INITIAL_USERS[0]);
    setTenders(INITIAL_TENDERS);
    setCurrentTenderId('MP-IT-2026-001');
    setBids({
      'MP-ENG-2026-042': INITIAL_BIDS_MP_ENG_042,
      'MP-IT-2026-001': INITIAL_BIDS_MP_IT_001,
    });
    setNdaAgreements(INITIAL_NDA_AGREEMENTS);
    setClarifications(INITIAL_CLARIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIsSimulatedDeadlineExpired(false);
    setActiveNavTab('submissions');
  };

  return (
    <TenderContext.Provider
      value={{
        currentUser,
        allUsers: INITIAL_USERS,
        activeNavTab,
        setActiveNavTab,
        currentTenderId,
        setCurrentTenderId,
        currentTender,
        tenders,
        bids,
        ndaAgreements,
        clarifications,
        auditLogs,
        isAuthenticated,
        loginAsUser,
        loginAsRole,
        logout,
        getAllowedTabs,
        isTabAllowed,
        firebaseUser,
        isFirebaseConnected,
        signInWithGoogle,
        signOutFirebase,
        syncWithCloud,
        switchUser,
        switchRole,
        loginWithEmail,
        isEmailInvited,
        isSimulatedDeadlineExpired,
        toggleSimulatedDeadlineExpired,
        isTenderDeadlinePassed,
        isNdaSignedForCurrentBidder,
        signNda,
        submitBid,
        verifyBid,
        verifyAllBids,
        releaseTenderToProcurement,
        startTenderWorkflowStage,
        resetITEquipmentTenderProcess,
        fastForwardITEquipmentTender,
        createNewTender,
        submitToTenderBoard,
        submitClarification,
        answerClarification,
        resetDemoData,
      }}
    >
      {children}
    </TenderContext.Provider>
  );
};

export const useTender = () => {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error('useTender must be used within a TenderProvider');
  }
  return context;
};
