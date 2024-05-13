// member list for done by options 
const doneByOptions = [
  'Charu Negi',
  'Ishu Mavar',
  'Manjeet Kumar',
  'Nidhi Sharma',
  'Pramod Bhutani',
  'Sagar Maini',
  'Ved Prakash',
  'Vilakshan Bhutani',
  'Yatin Munjal',
]

// list of transaction preference 
const transactionPrefOptions = [
  'ASAP', 'Date Given in Remarks', 'Most Urgent', 'Next Working Day'
]

// list of transaction types 
const transactionTypeOptions = [
  'Capital Appreciation STP',
  'Capital Appreciation SWP',
  'SIP',
  'STP',
  'SWP'
]

// list of transaction types 
const mfAmcOptions = [
  '',
  'Axis',
  'SBI',
  'PNB',
  'PNB',
  'ICICI',
]

// list of scheme name 
const schemeNameOptions = [
  'ASAP', 'Date Given in Remarks', 'Most Urgent', 'Next Working Day'
]

// list of scheme options 
const schemeOptionOptions = [
  'Growth', 'IDCW / Dividend'
]

// list of folio options 
const folioOptions = [
  'Create New Folio', 'Folio No Given in Remarks', 'Take Existing Folio'
]

// list of systematic transaction type 
const transactionOptions = new Array('Registration', 'Pause', 'Cancellation')

// list of SIP Pause Months 
const sipPauseMonthsOptions = [
  'Not Applicable', '2 Months', '3 Months', 'Maximum Months'
]

// list of transaction types 
const sip_stp_swpDateOptions = [
  "",
  "1 to 10",
  "11 to 20",
  "21 to 30",
  "Call Client and take dates",
  "Preferred date shared in Remarks",
  "STP - SWP - at your confort Level"
]

// list of transaction Units / Amount for purchase/redemptions
const purch_redempTraxUnits_AmountOptions = [
  'Amount Given in next question', 'Long Term Units', 'Redeem All Units', 'Units Mentioned in Remarks', 'Unlocked Units'
]

// list of transaction Units / Amount for switch
const switchTraxUnits_AmountOptions = [
  'Amount Given in next question', 'Long Term Units', 'Switch All Units', 'Units Mentioned in Remarks', 'Unlocked Units'
]

// list of transaction preference 
const purch_redempTraxTypeOptions = [
  'Purchase', 'Redemption'
]

export {
  doneByOptions,
  transactionPrefOptions,
  transactionTypeOptions,
  mfAmcOptions,
  schemeNameOptions,
  schemeOptionOptions,
  folioOptions,
  transactionOptions,
  sipPauseMonthsOptions,
  sip_stp_swpDateOptions,
  purch_redempTraxTypeOptions,
  purch_redempTraxUnits_AmountOptions,
  switchTraxUnits_AmountOptions
};