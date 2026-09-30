import React, { useState } from 'react';
import { TenderProvider, useTender } from './context/TenderContext';
import { ToastProvider } from './components/GlobalToast';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginPortal } from './components/LoginPortal';
import { AccessDeniedView } from './components/AccessDeniedView';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { VendorSubmissionView } from './views/VendorSubmissionView';
import { CommercialMatrixView } from './views/CommercialMatrixView';
import { ClarificationDeskView } from './views/ClarificationDeskView';
import { GovernanceAuditView } from './views/GovernanceAuditView';
import { ActiveTendersView } from './views/ActiveTendersView';
import { CreateTenderView } from './views/CreateTenderView';

const MainAppContent: React.FC = () => {
  const { activeNavTab, isAuthenticated, isTabAllowed, currentUser } = useTender();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

  // 1. Mandatory Login Gate: If not authenticated, render LoginPortal
  if (!isAuthenticated) {
    return <LoginPortal />;
  }

  // 2. Role-Restricted View Rendering: Only allowed views for the role
  const renderActiveView = () => {
    if (!isTabAllowed(activeNavTab, currentUser.role)) {
      return <AccessDeniedView attemptedTab={activeNavTab} />;
    }

    switch (activeNavTab) {
      case 'submissions':
        return <VendorSubmissionView onOpenAuditTrail={() => setIsAuditTrailOpen(true)} />;
      case 'procurement-admin':
        return <CommercialMatrixView />;
      case 'clarification-desk':
        return <ClarificationDeskView />;
      case 'governance-audit':
        return <GovernanceAuditView />;
      case 'active-tenders':
        return <ActiveTendersView />;
      case 'create-tender':
        return <CreateTenderView />;
      default:
        return <AccessDeniedView attemptedTab={activeNavTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between selection:bg-primary selection:text-white">
      <Header
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
      />

      <main className="w-full bg-slate-50 min-h-[calc(100vh-10rem)] flex-1 flex flex-col">
        {renderActiveView()}
      </main>

      <Footer />

      {/* Global Modals */}
      <RoleSwitcherModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <AuditTrailModal
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <TenderProvider>
        <MainAppContent />
      </TenderProvider>
    </ToastProvider>
  );
}
