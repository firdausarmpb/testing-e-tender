export type UserRole = 'vendor' | 'requester' | 'governance' | 'admin' | 'procurement' | 'bidder' | 'auditor';

export type PrimaryAppRole = 'vendor' | 'governance' | 'procurement';

export function getPrimaryRole(role: UserRole): PrimaryAppRole {
  if (role === 'governance' || role === 'auditor') return 'governance';
  if (role === 'procurement' || role === 'admin' || role === 'requester') return 'procurement';
  return 'vendor';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  designation: string;
  vendorId?: string;
  cidbGrade?: string;
  ssmNumber?: string;
  isVerifiedVendor?: boolean;
}

export interface BqItem {
  id: string;
  itemNumber: string;
  description: string;
  detailedSpecs: string;
  unit: string;
  quantity: number;
  estimatedUnitPrice?: number;
}

export interface BidderBqEntry {
  itemId: string;
  unitPrice: number;
  totalAmount: number;
}

export interface BidSubmission {
  id: string;
  tenderId: string;
  bidderId: string;
  bidderName: string;
  companyName: string;
  vendorId: string;
  cidbGrade: string;
  ssmRegistration: string;
  submittedAt: string;
  checksumSha256: string;
  technicalProposalFileName: string;
  technicalProposalFileSize: string;
  ssmFileName: string;
  cidbFileName: string;
  complianceDeclared: boolean;
  commercialProposalFileName: string;
  commercialProposalFileSize: string;
  commercialPdfDeclaredTotal?: number;
  isCommercialPdfMatched?: boolean;
  pricingValidityAgreed: boolean;
  bqEntries: BidderBqEntry[];
  subtotal: number;
  sstAmount: number; // 6%
  grandTotal: number;
  // Audit Clearance
  isAuditVerified: boolean;
  auditedBy?: string;
  auditedAt?: string;
  auditRemarks?: string;
  // Technical Evaluation Scores
  techSpecScore?: number; // max 30
  trackRecordScore?: number; // max 20
  slaTermsScore?: number; // max 20
  combinedScore?: number;
  rank?: number;
}

export type TenderStatus = 'Draft' | 'Active' | 'Closed' | 'Audited' | 'Released' | 'Awarded';

export interface TenderRfpDoc {
  id: string;
  name: string;
  version: string;
  size: string;
  category: string;
  confidentiality: string;
  url?: string;
}

export interface ClarificationQuestion {
  id: string;
  tenderId: string;
  category: 'tech' | 'boq' | 'legal' | 'sub' | 'gen';
  categoryLabel: string;
  trackingRef: string;
  circularRef?: string;
  subject: string;
  details: string;
  submittedBy: string;
  submittedByCompany: string;
  submittedAt: string;
  attachmentName?: string;
  status: 'under_review' | 'official_addendum' | 'procurement_directive' | 'closed';
  smeResponder?: {
    name: string;
    designation: string;
    department: string;
  };
  officialAnswer?: string;
  answeredAt?: string;
  bindingAllBidders?: boolean;
  addendumRevision?: string;
}

export interface NdaAgreement {
  tenderId: string;
  bidderId: string;
  signedFullName: string;
  identificationNumber: string;
  signedAt: string;
  ipAddress: string;
}

export interface TenderMaster {
  id: string;
  referenceNo: string;
  title: string;
  department: string;
  location: string;
  submissionType: 'Two-Envelope Sealed Protocol' | 'Single-Stage RFP' | 'Strategic Advisory RFP' | 'Standard Tender' | 'Restricted Tender' | 'Request for Proposal' | string;
  status: TenderStatus;
  approvedCapexBudget: number;
  currency: string;
  createdAt: string;
  closingDeadline: string; // ISO string
  qaClosingDeadline: string; // ISO string
  govAuditRef?: string;
  rfpDocuments: TenderRfpDoc[];
  bqItems: BqItem[];
  invitedEmails: string[];
  requiresMofRegistration: boolean;
  minimumCidbGrade?: string;
  evaluationWeights: {
    technicalWeight: number; // e.g. 70
    commercialWeight: number; // e.g. 30
  };
  ndaTermsText: string;
  awardedBidderId?: string;
  tenderBoardSubmittedAt?: string;
}

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  tenderRef: string;
  hashToken?: string;
}
