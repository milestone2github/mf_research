import React, { useEffect, useState } from 'react'
import Tabs from './common/Tabs'
import SystematicForm from './SystematicForm';
import PurchRedempForm from './PurchRedempForm';
import SwitchForm from './SwitchForm';
import MinusButton from './common/MinusButton';
import Badge from './common/Badge';
import { handleAdd, handleRemove, handleUpdate as handleTransactionUpdate} from '../../reducers/TransactionSlice'
import { handleAdd as systematicAdd, handleRemove as systematicRemove } from '../../reducers/SystematicDataSlice'
import { handleAdd as purchRedempAdd, handleRemove as purchRedempRemove } from '../../reducers/PurchRedempDataSlice'
import { handleAdd as switchAdd, handleRemove as switchRemove } from '../../reducers/SwitchDataSlice'
import { useDispatch, useSelector } from 'react-redux';

// Tabs for form types 
const tabs = [
  { id: 'systematic', name: 'Systematic' },
  { id: 'purchRedemp', name: 'Purchase/Redemption' },
  { id: 'switch', name: 'Switch' },
]

function TabularTransaction({ idx, isAddVisible, didReset, hasReviewed, updateHasReviewed }) {
  const [activeTab, setActiveTab] = useState('systematic');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [summary, setSummary] = useState({
    count: idx + 1, 
    transactionType: 'SIP',
    amcName: '',
    fromScheme: '',
    toScheme: '',
    amount: null,
    units: null,
  })

  // get systematic, purch/redemp, and switch data from store
  const systematicItem = useSelector(state => state.systematicData.value[idx]);
  const purchRedempItem = useSelector(state => state.purchRedempData.value[idx]);
  const switchItem = useSelector(state => state.switchData.value[idx]);

  // use useDispatch hook to use reducers 
  const dispatch = useDispatch();

  // function to update summary 
  const updateSummary = () => {
    switch (activeTab) {
      case 'systematic':
        setSummary({
          count: idx + 1, 
          transactionType: systematicItem.systematicTraxType,
          amcName: systematicItem.systematicMfAmcName,
          fromScheme: systematicItem.systematicSchemeName,
          toScheme: systematicItem.systematicSourceScheme,
          amount: systematicItem.sip_swp_stpAmount,
          units: null,
        })
        break;

      case 'purchRedemp':
        setSummary({
          count: idx + 1, 
          transactionType: purchRedempItem.purch_RedempTraxType,
          amcName: purchRedempItem.purch_redempMfAmcName,
          fromScheme: purchRedempItem.purch_redempSchemeName,
          toScheme: '',
          amount: purchRedempItem.purch_redempTransactionAmount,
          units: null,
        })
        break;

      case 'switch':
        setSummary({
          count: idx + 1, 
          transactionType: 'Switch',
          amcName: switchItem.switchMfAmcName,
          fromScheme: switchItem.switchFromScheme,
          toScheme: switchItem.switchToScheme,
          amount: switchItem.switchTransactionAmount,
          units: null,
        })
        break;
    
      default:
        break;
    }
  }

  // method to handle tab change 
  const onTabChange = (tab) => {
    setActiveTab(tab)

    // change type in transactions state also 
    dispatch(handleTransactionUpdate({index: idx, type: tab}))

    // make hasReviewed false 
    updateHasReviewed(false);
  }

  const toggleCollapsed = () => {
    setIsCollapsed(prevState => !prevState)
  }

  // method to add new form instance 
  const addFormInstance = () => {
    dispatch(handleAdd());

    // dispatch add handlers of systematic and other states also 
    dispatch(systematicAdd())
    dispatch(purchRedempAdd())
    dispatch(switchAdd())

    // collapse the current transaction form 
    setIsCollapsed(true);

    // make hasReviewed false 
    updateHasReviewed(false);
  }

  // method to delete existing form instance at specified index 
  const removeFormInstance = (index) => {
    dispatch(handleRemove(index));

    // dispatch remove handlers of systematic and other states also 
    dispatch(systematicRemove(index))
    dispatch(purchRedempRemove(index))
    dispatch(switchRemove(index))

    // make hasReviewed false 
    updateHasReviewed(false);
  }

  // update isCollapsed state if invalid input errors 
  const updateCollapsed = (value) => {
    setIsCollapsed(value);
  }

  // side effect to update summary 
  useEffect(() => {
    updateSummary();
  
    return () => {
      setSummary({
        count: idx + 1, 
        transactionType: '', 
        amcName: '', 
        fromScheme: '', 
        toScheme: '', 
        amount: null, 
        units: null
      })
    }
  }, [systematicItem, purchRedempItem, switchItem])

  // side effect to handle reset after submission 
  useEffect(() => {
    if(didReset) {
      setIsCollapsed(false);
      setActiveTab('systematic')
    }
  
  }, [didReset])

  // side effect to collapse after reviewed 
  useEffect(() => {
    if(hasReviewed)
      setIsCollapsed(true);
  
  }, [hasReviewed])

  return (
    <div className='flex flex-col'>
      <Tabs tabs={tabs} onTabChange={onTabChange} activeTab={activeTab} isCollapsed={isCollapsed} toggleCollapsed={toggleCollapsed} isAddVisible={isAddVisible} addFormInstance={addFormInstance} />
      <div className='relative -mt-[5px] border border-gray-400'>

        <table className={`table-auto border-collapse mx-1 md:mx-3 my-2 transition-opacity ease-linear duration-500 ${isCollapsed ? 'opacity-100' : 'collapse opacity-0'}`}>
          <tbody>
            <tr className="">
              <td className="px-2 text-center whitespace-nowrap text-black-900 bg-gray-200 text-xs">{summary.count}</td>
              <td className="px-2 py-1 border-r whitespace-nowrap">{summary.transactionType}</td>
              <td className="px-2 py-1 border-r whitespace-nowrap">{summary.amcName}</td>
              <td className="px-2 py-1 border-r whitespace-nowrap">
                <div>{summary.fromScheme}</div>
                <hr className="my-1" />
                <div>{summary.toScheme}</div>
              </td>
              <td className="px-2 py-1 whitespace-nowrap">
                <div>{summary.amount}</div>
                <hr className="my-1" />
                <div>{summary.units}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <section className={`transition-all ease-in-out duration-300 overflow-visible ${isCollapsed ? "max-h-0 opacity-0 pointer-events-none" : 'max-h-[1280px] md:max-h-[620px] opacity-100'}`}>
          <div className="flex justify-between my-2 mb-4 px-3">
            <Badge text={'Transaction'} count={idx + 1} />
            {idx > 0 && <div className='text-center -my-2'>
              <MinusButton title={'Delete this transaction'} action={() => removeFormInstance(idx)} />
            </div>}
          </div>

          {
            activeTab === 'systematic' ?
              <SystematicForm index={idx} updateCollapsed={updateCollapsed}/> :
              activeTab === 'purchRedemp' ?
                <PurchRedempForm index={idx} updateCollapsed={updateCollapsed}/> :
                <SwitchForm index={idx} updateCollapsed={updateCollapsed}/>
          }</section>
      </div>
    </div>
  )
}

export default TabularTransaction