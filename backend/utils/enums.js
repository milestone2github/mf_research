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

const reconcileStatus = [
  'RECONCILED',
  'RECONCILED_WITH_MINOR',
  'RECONCILED_WITH_MAJOR',
  'RECONCILED_WITH_MAJOR_REQUESTED',
  'RECONCILIATION_REJECTED',
  'RECONCILIATION_REJECTED_REQUEST'
]

module.exports = { statusEnum, approvalStatusEnum, reconcileStatus }