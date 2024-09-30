
const schemeMap = new Map();
schemeMap.set('ppfas', 'parag');


const approvalStatusMap = new Map()
approvalStatusMap.set('Approved', 'APPROVED')
approvalStatusMap.set('Link still Pending', 'PENDING')
approvalStatusMap.set('KYC not Compliant', 'PENDING')
approvalStatusMap.set('Technical Issue', 'PENDING')
approvalStatusMap.set('Client Declined', 'REJECTED')
approvalStatusMap.set('RM Declined', 'REJECTED')
approvalStatusMap.set('Submitted to RTA', 'PENDING')
approvalStatusMap.set('System Update Awaiting', 'PENDING')
approvalStatusMap.set('RM Hold the Execution', 'PENDING')
approvalStatusMap.set('Wrongly / Double Entry', 'PENDING')
approvalStatusMap.set('Onboarding Pending', 'PENDING')
approvalStatusMap.set('Folio Creation Awaiting', 'PENDING')

module.exports = {schemeMap, approvalStatusMap};