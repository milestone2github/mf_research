const statusEnum = [
  'PENDING', 
  'APPROVED',//new
  'REJECTED',//new
  'REQUESTED', 
  '2FA_VALIDATED', 
  'EXPIRED', 
  '2FA_VALIDATED_PAYMENT_PENDING', 
  'PAYMENT_PROCESSED', 
  'PAYMENT_STATUS_PENDING', 
  'SYSTEM_UPDATE_AWAITING',
  'SEND_TO_RTA',
  'INVALID_TRANSACTION',
  'RTA_PROCESSED',
  'RTA_REJECTED',
  'ALLOTTED',
  'ALLOTMENT_PENDING',
  'RECONCILED',
  'RECONCILIATION_PENDING', // minor issues confirmed
  'RECONCILIATION_PENDING_REQUEST', // minor issues requested
  'RECONCILIATION_HOLD', // major issues confirmed
  'RECONCILIATION_HOLD_REQUEST', // major issues requested
  'RECONCILIATION_FAILED_REQUEST', // rejected request at reconciliation
  'RECONCILIATION_FAILED', // approved rejected at reconciliation
]

const approvalStatusEnum = [
  "",
  "Approved",
  "Link still Pending",
  "KYC not Compliant",
  "Technical Issue",
  "Client Declined",
  "RM Declined",
  "Submitted to RTA",
  "System Update Awaiting",
  "RM Hold the Execution",
  "Folio Creation Awaiting",
  "Onboarding Pending"
]


module.exports = { statusEnum, approvalStatusEnum }