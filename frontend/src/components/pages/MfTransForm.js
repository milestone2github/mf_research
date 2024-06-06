import { useState } from 'react'
import PrimaryButton from '../mfTransaction/common/PrimaryButton';
import Alert from '../mfTransaction/common/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { resetSystematicData } from '../../Reducers/SystematicDataSlice';
import { resetPurchRedempData } from '../../Reducers/PurchRedempDataSlice';
import { resetSwitchData } from '../../Reducers/SwitchDataSlice';
import { resetCommonData } from '../../Reducers/CommonDataSlice';
import { resetAllOptionLists } from '../../Reducers/OptionListsSlice';
// import Modal from '../mfTransaction/common/Modal';
// import { IoMdCheckmarkCircle } from 'react-icons/io';
import TabularTransaction from '../mfTransaction/TabularTransaction';
import FormHeader from '../mfTransaction/FormHeader';
import Header from '../mfTransaction/common/Header';
import { resetTransactions } from '../../Reducers/TransactionSlice';
import { FaCheck } from "react-icons/fa";
import AccessDenied from './AccessDenied';

function MfTransForm() {
  const [alert, setAlert] = useState({
    isOn: false,
    type: 'error',
    header: 'Systematic Form error',
    message: 'Missing field in systematic form'
  })

  const [hasReviewed, setHasReviewed] = useState(false);

  const [didReset, setDidReset] = useState(false);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);

  // get all data states from store 
  const transactions = useSelector(state => state.transactions);
  const commonData = useSelector(state => state.commonData.value);
  const systematicData = useSelector(state => state.systematicData.value);
  const purchRedempData = useSelector(state => state.purchRedempData.value);
  const switchData = useSelector(state => state.switchData.value);

  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  const dispatch = useDispatch();

  // method to update alert 
  const updateAlert = (alert) => {
    setAlert(alert)
  }

  // method to update hasReviewed 
  const updateHasReviewed = (value) => {
    setHasReviewed(value)
  }

  // method to validate and save systematic form data 
  const validateSystematic = (data, number) => {
    // default alert state 
    let alert = {
      isOn: true,
      type: 'error',
      header: 'Validation Error in Systematic Form ' + number,
      message: ''
    }

    if (!data.systematicMfAmcName) {
      alert.message = <span>Select one of the option in <strong className='text-xs'>MF (AMC) Name</strong></span>
      updateAlert(alert);
      return;
    }
    else if (['STP' , 'Capital Appreciation STP', 'SWP', 'Capital Appreciation SWP'].includes(data.systematicTraxType) && !data.systematicSourceScheme) {
      alert.message = <span>Select one of the option in <strong className='text-xs'>Source Scheme</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (['SIP', 'STP' , 'Capital Appreciation STP'].includes(data.systematicTraxType) && !data.systematicSchemeName) {
      alert.message = <span>Select one of the option in <strong className='text-xs'>Scheme Name (Target Scheme)</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (!data.systematicFolio) {
      alert.message = <span>Select a <strong className='text-xs'>Folio</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (!data.systematicSchemeOption) {
      alert.message = <span>Select <strong className='text-xs'>Scheme Option</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (data.systematicTraxFor === 'Pause' && !data.sipPauseMonths) {
      alert.message = <span>Select one of the option in <strong className='text-xs'>SIP Pause Months</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (data.systematicTraxType === 'SIP' && data.systematicTraxFor === 'Registration' && !data.systematicPaymentMode) {
      alert.message = <span>Select one of the option in <strong className='text-xs'>First Installment Payment Mode</strong></span>
      updateAlert(alert);
      return false;
    }

    return true;
  }

  // method to validate and save purchase/redemption form data 
  const validatePurchRedemp = (data, number) => {

    // default alert state 
    let alert = {
      isOn: true,
      type: 'error',
      header: 'Validation Error in Purchase/Redemption Form ' + number,
      message: ''
    }

    if (!data.purch_RedempTraxType) {
      alert.message = <span><strong className='text-xs'>Transaction Type</strong> is required</span>
      updateAlert(alert);
      return false;
    }
    else if (!data.purch_redempMfAmcName) {
      alert.message = <span><strong className='text-xs'>MF (AMC) Name</strong> is required</span>
      updateAlert(alert);
      return false;
    }
    else if (!data.purch_redempFolio) {
      alert.message = <span>Select a <strong className='text-xs'>Folio</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (!data.purch_redempSchemeName) {
      alert.message = <span><strong className='text-xs'>Scheme Name</strong> is required</span>
      updateAlert(alert);
      return false;
    }
    else if (!data.purch_redempSchemeOption) {
      alert.message = <span>Select <strong className='text-xs'>Scheme Option</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (data.purch_RedempTraxType === 'Purchase' && !data.purch_redempPaymentMode) {
      alert.message = <span>Select one of the option in <strong className='text-xs'>Payment Mode</strong></span>
      updateAlert(alert);
      return false;
    }

    return true;
  }

  // method to validate and save Switch form data 
  const validateSwitch = (data, number) => {

    // default alert state
    let alert = {
      isOn: true,
      type: 'error',
      header: 'Validation Error in Switch Form ' + number,
      message: ''
    }

    if (!data.switchMfAmcName) {
      alert.message = <span>Select one of the option in <strong className='text-xs'>MF (AMC) Name</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (!data.switchFolio) {
      alert.message = <span>Select a <strong className='text-xs'>Folio</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (!data.switchFromScheme) {
      alert.message = <span><strong className='text-xs'>From Scheme</strong> is required</span>
      updateAlert(alert);
      return false;
    }
    else if (!data.switchToScheme) {
      alert.message = <span><strong className='text-xs'>To Scheme</strong> is required</span>
      updateAlert(alert);
      return false;
    }
    else if (!data.switchFromSchemeOption) {
      alert.message = <span>Select <strong className='text-xs'>From Scheme Option</strong></span>
      updateAlert(alert);
      return false;
    }
    else if (!data.switchToSchemeOption) {
      alert.message = <span>Select <strong className='text-xs'>To Scheme Option</strong></span>
      updateAlert(alert);
      return false;
    }

    return true;
  }
  
  // method to submit form 
  const submitForm = async (e) => {
    e.preventDefault();

    // set loading state to true 
    setIsLoadingSubmission(true)

    let allTransactions = {
      commonData,
      systematicData: [],
      purchRedempData: [],
      switchData: []
    };

    let validationErrorOccurred = false;

    let alert = {
      isOn: true,
      type: 'error',
      header: 'Submission Error',
      message: ''
    }

    transactions.forEach((type, index) => {
      // Skip remaining iterations if validation error occurred
      if (validationErrorOccurred) return;

      switch (type) {
        case 'systematic':
          if (!validateSystematic(systematicData[index], index + 1)) {
            validationErrorOccurred = true;
            return;
          }
          allTransactions.systematicData.push(systematicData[index]);
          break;

        case 'purchRedemp':
          if (!validatePurchRedemp(purchRedempData[index], index + 1)) {
            validationErrorOccurred = true;
            return;
          }
          allTransactions.purchRedempData.push(purchRedempData[index]);
          break;

        case 'switch':
          if (!validateSwitch(switchData[index], index + 1)) {
            validationErrorOccurred = true;
            return;
          }
          allTransactions.switchData.push(switchData[index]);
          break;

        default:
          console.log('Unknown transaction type:', type);
          break;
      }
    });

    if (validationErrorOccurred) {
      setIsLoadingSubmission(false);
      return;
    }

    // show error alert if no form data has been filled or saved 
    if (!allTransactions.purchRedempData.length && !allTransactions.systematicData.length && !allTransactions.switchData.length) {
      alert.message = <span>Please complete any one transaction before submission</span>;
      updateAlert(alert)
      setIsLoadingSubmission(false);
      return;
    }

    // api call to submit form data 
    const requestOptions = {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData: allTransactions })
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/data`, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        alert.message = data?.message ? <span>{data.message}</span> : <span>Server error! Try again later</span>;
        updateAlert(alert)
        return;
      }

      console.log('submitted')
      updateAlert({
        isOn: true,
        type: 'success',
        header: 'Form submitted',
        message: ''
      })

      // clear the form 
      dispatch(resetTransactions());
      dispatch(resetCommonData());
      dispatch(resetSystematicData());
      dispatch(resetPurchRedempData());
      dispatch(resetSwitchData());
      dispatch(resetAllOptionLists());
      setDidReset(true);
      setHasReviewed(false);
    } catch (error) {
      console.log(error);
      alert.message = <span>Server error! Try again later</span>;
      updateAlert(alert)
    }
    finally {
      setIsLoadingSubmission(false)
    }
  }

  if(!permissions.find(perm => perm === 'MF Transaction')) 
    return (<AccessDenied />)

  return (
    <div>
      <Alert alertState={alert} updateAlert={updateAlert} />

      {/* <Header /> */}

      <form onSubmit={submitForm} className='flex flex-col gap-y-8 m-1 md:mx-8'>
        <FormHeader />

        <div className="flex flex-col gap-16">{
          transactions.map((transaction, idx) => (<TabularTransaction key={idx} idx={idx} transaction={transaction} isAddVisible={transactions.length - 1 === idx} didReset={didReset} hasReviewed={hasReviewed} updateHasReviewed={updateHasReviewed}/>))
        }
        </div>

        <div className="flex items-center">
          <label className="inline-flex relative items-center cursor-pointer space-x-2">
            <input
              type="checkbox"
              checked={hasReviewed}
              onChange={(e) => setHasReviewed(e.target.checked)}
              className={`w-6 h-6 text-dark-blue ${hasReviewed ? 'bg-gray-100' : 'bg-gray-300'} border-gray-300 rounded focus:ring-dark-blue dark:focus:ring-dark-blue dark:ring-offset-gray-800 focus:ring-2 appearance-none`}
              id="custom-checkbox"
            />
            {hasReviewed && (
              <span className="absolute top-1/2 -left-[6px] -translate-y-1/2 text-dark-blue">
                <FaCheck className="w-5 h-5" />
              </span>
            )}
            <span className="text-gray-900">I have reviewed all the forms</span>
          </label>
        </div>

        <div className="flex gap-4">
          <PrimaryButton
            // action={submitForm}
            disable={isLoadingSubmission || !hasReviewed ? true : false}
            text={isLoadingSubmission ? 'Submitting...' : 'Submit'}
            width={'320px'}
          />

        </div>
      </form>
    </div>
  )
}

export default MfTransForm
