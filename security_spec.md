# Security Specification: BID NEXT Media Prima eTender Platform

## 1. Data Invariants
1. **Tender Integrity**: Tenders can only be created or modified by authorized Procurement Administrators (`admin` or `procurement`).
2. **Two-Envelope Sealed Protocol**: Bid documents and pricing must not be altered after submission.
3. **Audit Clearance Integrity**: Only authorized Governance & Audit personnel can set `isAuditVerified: true` and add audit remarks.
4. **NDA Non-Repudiation**: An NDA agreement cannot be altered or forged with someone else's ID or forged signature.
5. **Audit Trail Immutability**: Audit log events are append-only; update and delete operations are strictly denied.
6. **Statutory Integrity**: Vendors cannot spoof or inject arbitrary unverified data into other bidders' submissions.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Tender Modification**: Anonymous user attempts to update tender capex budget or deadline.
2. **Bidder Tampering with Competing Bid**: Bidder A attempts to update or overwrite Bidder B's commercial total.
3. **Premature Commercial Disclosure / Seal Bypass**: Unverified user attempts to set `isAuditVerified: true` without auditor credentials.
4. **Audit Log Rewrite / Erasure**: Any user attempts to delete or update an existing audit log entry.
5. **NDA Identity Forgery**: User A attempts to record an NDA signed on behalf of User B.
6. **Denial of Wallet via Massive Payload**: Injecting an oversized 10MB payload into tender description or clarification details.
7. **Negative or Malformed Capex Budget**: Submitting a negative `approvedCapexBudget` or non-numeric grandTotal.
8. **Shadow Field Injection**: Injecting unauthorized `isAdmin: true` or `bypassAudit: true` into a bid submission.
9. **Clarification Spoofing**: Modifying an official addendum answer posted by procurement.
10. **Tender Deletion Attack**: General vendor attempting to delete an active tender record.
11. **Orphaned Bid Submission**: Creating a bid that targets a non-existent tender ID.
12. **Post-Deadline Submission Injection**: Attempting to backdate or inject bids past the closing deadline.

## 3. Test Runner Coverage
The security rules enforce:
- Default deny catch-all `/{document=**} { allow read, write: if false; }`
- Role and identity boundaries for tenders, bids, clarifications, NDAs, and audit logs.
- Validation of string sizes, numbers, and allowed status enums.
