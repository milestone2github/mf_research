import React, { useCallback, useEffect } from 'react'
import RadioInput from './common/RadioInput'
import TextInput from './common/TextInput'
import PreFilledSelect from './common/PreFilledSelect'
import NumberInput from './common/NumberInput'
import { useDispatch, useSelector } from 'react-redux'
import { handleChange, handleSelect } from '../../reducers/SystematicDataSlice'
import { setAmcNameOptions, setSchemeNameOptions } from '../../reducers/OptionListsSlice'
import { fetchAmcNameOptions, fetchFolioOptions, fetchSchemeNameOptions } from '../../Actions/OptionListsAction'
import CustomInputList from './common/CustomInputList'
import debounce from '../../utils/debounce'
import DateInput from './common/DateInput'
import getCurrentDate from '../../utils/getCurrentDate'
import FolioSelectMenu from './common/FolioSelectMenu'

function SystematicForm({ index, updateCollapsed }) {
  // get systematicData item and commonData state from store
  const systematicItem = useSelector(state => state.systematicData.value[index]);
  const commonData = useSelector(state => state.commonData.value);

  // get optionList state from store
  const {
    sysTransactionForOptions,
    sysTransactionForOptionsWithPause,
    amcNameOptions,
    schemeNameOptions,
    schemeOptionOptions,
    sipPauseMonthsOptions,
    transactionTypeOptions,
    folioOptions,
    folioOptionsWithNew,
    sysPaymentModeOptions
  } = useSelector(state => state.optionLists);

  // use useDispatch hook to use reducers 
  const dispatch = useDispatch();

  // Debounced fetch amc names function
  const debouncedFetchAmcNames = useCallback(
    debounce((keywords) => {
      dispatch(fetchAmcNameOptions(keywords))
        .then((action) => {
          console.log("Dispatched fetch Amc names");
        })
        .catch((error) => {
          console.error("Error while fetching Amc names:", error);
        });
    }, 280), // 300ms debounce time
    [dispatch]
  );

  // Debounced fetch scheme names function
  const debouncedFetchSchemeNames = useCallback(
    debounce((amc, keywords) => {
      dispatch(fetchSchemeNameOptions({ amc, keywords }))
        .then((action) => {
          console.log("Dispatched fetch scheme names");
        })
        .catch((error) => {
          console.error("Error while fetching Scheme names:", error);
        });
    }, 280), // 300ms debounce time
    [dispatch]
  );

  // method to handle change in inputs 
  const handleInputChange = (event) => {
    const { name, value, dataset: { index } } = event.target;
    dispatch(handleChange({ name, value, index })); // dispatch the change 
  };

  // method to handle change in amc name
  const handleAmcNameChange = (value, name, index) => {
    dispatch(handleSelect({ name, value, index })); // dispatch the change

    dispatch(setAmcNameOptions([value])) 
    dispatch(setSchemeNameOptions([]))
    dispatch(handleSelect({name: 'systematicSourceScheme', value: '', index}))
    dispatch(handleSelect({name: 'systematicSchemeName', value: '', index}))
    dispatch(handleSelect({name: 'systematicFolio', value: '', index}))
  };

  // method to handle change in scheme name
  const handleSchemeNameChange = (value, name, index) => {
    dispatch(handleSelect({ name, value, index })); // dispatch the change
    dispatch(setSchemeNameOptions([value])) 
  };

  // method to handle change in select menus
  const handleSelectChange = (name, value, index) => {
    dispatch(handleSelect({ name, value, index })); // dispatch the change 
  };

  // effect to fetch folio options on change of amc and pan number 
  useEffect(() => {
    if (commonData.iWellCode) {
      dispatch(fetchFolioOptions({ iWell: commonData.iWellCode, amcName: systematicItem.systematicMfAmcName }))
        .then((action) => {
          console.log("Dispatched fetchFolioOptions");
        })
        .catch((error) => {
          console.error("Error while fetching folios:", error);
        });
    }

  }, [systematicItem.systematicMfAmcName, commonData.iWellCode])

  return (
    <fieldset className={`px-3 py-4 flex flex-wrap -mt-4 gap-x-16 gap-y-4`}>

      <div className='grow shrink basis-72'>
        <PreFilledSelect
          id='systematicTraxType'
          index={index}
          label='Transaction Type'
          options={transactionTypeOptions}
          selectedOption={systematicItem.systematicTraxType}
          onSelect={handleSelectChange}
        />
      </div>
      <div className='grow shrink basis-72'>
        <RadioInput
          index={index}
          label='Transaction For'
          name={`systematicTraxFor-${index}`}
          options={
            systematicItem.systematicTraxType === 'SIP' ?
              sysTransactionForOptionsWithPause :
              sysTransactionForOptions
          }
          selectedOption={systematicItem.systematicTraxFor}
          onChange={handleInputChange}
          updateCollapsed={updateCollapsed}
        />
      </div>
      <div className='grow shrink basis-72'>
        <CustomInputList
          id='systematicMfAmcName'
          index={index}
          label='MF (AMC) Name'
          listName='amc-names'
          required={true}
          value={systematicItem.systematicMfAmcName}
          fetchData={debouncedFetchAmcNames}
          updateSelectedOption={handleAmcNameChange}
          listOptions={amcNameOptions}
          updateCollapsed={updateCollapsed}
          renderOption={(option) => (
            option
          )}
        />
      </div>
      {systematicItem.systematicTraxType !== 'SIP' &&
        <div className='grow shrink basis-72'>
          <CustomInputList
            id='systematicSourceScheme'
            index={index}
            label='Source Scheme'
            listName='systematic-source-schemes'
            required={true}
            value={systematicItem.systematicSourceScheme}
            fetchData={(value) =>
              debouncedFetchSchemeNames(systematicItem.systematicMfAmcName, value)
            }
            updateSelectedOption={handleSchemeNameChange}
            listOptions={schemeNameOptions}
            updateCollapsed={updateCollapsed}
            renderOption={(option) => (
              option
            )}
          />
        </div>}
      {['SIP', 'STP', 'Capital Appreciation STP'].includes(systematicItem.systematicTraxType) &&
        <div className='grow shrink basis-72'>
          <CustomInputList
            id='systematicSchemeName'
            index={index}
            label='Scheme Name (Target Scheme)'
            listName='systematic-scheme-names'
            required={true}
            value={systematicItem.systematicSchemeName}
            fetchData={(value) =>
              debouncedFetchSchemeNames(systematicItem.systematicMfAmcName, value)
            }
            updateSelectedOption={handleSchemeNameChange}
            listOptions={schemeNameOptions}
            updateCollapsed={updateCollapsed}
            renderOption={(option) => (
              option
            )}
          />
        </div>}
      <div className='grow shrink basis-72'>
        <RadioInput
          index={index}
          label='Scheme Option'
          name={`systematicSchemeOption-${index}`}
          options={schemeOptionOptions}
          selectedOption={systematicItem.systematicSchemeOption}
          onChange={handleInputChange}
          updateCollapsed={updateCollapsed}
        />
      </div>
      <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
        <FolioSelectMenu
          id='systematicFolio'
          index={index}
          label='Folio'
          options={systematicItem.systematicTraxFor === 'Registration' ?
            folioOptionsWithNew :
            folioOptions}
          selectedOption={systematicItem.systematicFolio}
          onSelect={handleSelectChange}
        />
      </div>

      <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
        <NumberInput
          id='sip_swp_stpAmount'
          index={index}
          label={`${systematicItem.systematicTraxType === 'SIP' ?
            'SIP' :
            ['SWP', 'Capital Appreciation SWP'].includes(systematicItem.systematicTraxType) ?
              'SWP' : 'STP'
            } Amount`}
          min={1}
          required={true}
          value={systematicItem.sip_swp_stpAmount}
          onChange={handleInputChange}
          updateCollapsed={updateCollapsed}
        />
      </div>

      {(systematicItem.systematicTraxType === 'SIP' && ['Registration', 'Pause'].includes(systematicItem.systematicTraxFor)) ||
        (['SWP', 'Capital Appreciation SWP'].includes(systematicItem.systematicTraxType) && systematicItem.systematicTraxFor === 'Registration') ||
        (['STP', 'Capital Appreciation STP'].includes(systematicItem.systematicTraxType) && systematicItem.systematicTraxFor === 'Registration')
        ?<div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
        <NumberInput
          id='tenureOfSip_swp_stp'
          index={index}
          label={`Tenure of ${systematicItem.systematicTraxType === 'SIP' ?
            'SIP' :
            ['SWP', 'Capital Appreciation SWP'].includes(systematicItem.systematicTraxType) ?
              'SWP' : 'STP'
            }`}
          min={1}
          required={true}
          value={systematicItem.tenureOfSip_swp_stp}
          onChange={handleInputChange}
          updateCollapsed={updateCollapsed}
        />
      </div> : null }

      {systematicItem.systematicTraxFor === 'Pause' &&
        systematicItem.systematicTraxType === 'SIP' &&
        <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
          <PreFilledSelect
            id='sipPauseMonths'
            index={index}
            label='SIP Pause Months'
            options={sipPauseMonthsOptions}
            selectedOption={systematicItem.sipPauseMonths}
            onSelect={handleSelectChange}
          />
        </div>}

      {(systematicItem.systematicTraxType === 'SIP' && systematicItem.systematicTraxFor === 'Registration') ||
        (['SWP', 'Capital Appreciation SWP'].includes(systematicItem.systematicTraxType) && systematicItem.systematicTraxFor === 'Registration') ||
        (['STP', 'Capital Appreciation STP'].includes(systematicItem.systematicTraxType) && systematicItem.systematicTraxFor === 'Registration')
        ? <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
        <DateInput
          id='sip_stp_swpDate'
          index={index}
          label={`${systematicItem.systematicTraxType === 'SIP' ?
            'SIP' :
            ['SWP', 'Capital Appreciation SWP'].includes(systematicItem.systematicTraxType) ?
              'SWP' : 'STP'
            } Date`}
          minDate={getCurrentDate()}
          value={systematicItem.sip_stp_swpDate}
          onChange={handleInputChange}
        />
      </div> 
      : null
      }

      {(systematicItem.systematicTraxType === 'SIP' && systematicItem.systematicTraxFor === 'Registration') ||
        (['SWP', 'Capital Appreciation SWP'].includes(systematicItem.systematicTraxType) && systematicItem.systematicTraxFor === 'Registration') ||
        (['STP', 'Capital Appreciation STP'].includes(systematicItem.systematicTraxType) && systematicItem.systematicTraxFor === 'Cancellation')
        ? <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
          <NumberInput
            id='firstTransactionAmount'
            index={index}
            label='First Transaction Amount'
            min={0}
            required={true}
            value={systematicItem.firstTransactionAmount}
            onChange={handleInputChange}
            updateCollapsed={updateCollapsed}
          />
        </div>
        : null
      }

      {systematicItem.systematicTraxType === 'SIP' &&
        systematicItem.systematicTraxFor === 'Registration' &&
        <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
          <PreFilledSelect
            id='systematicPaymentMode'
            index={index}
            label='First Installment Payment Mode'
            options={sysPaymentModeOptions}
            selectedOption={systematicItem.systematicPaymentMode}
            onSelect={handleSelectChange}
            updateCollapsed={updateCollapsed}
          />
        </div>
      }

      {systematicItem.systematicPaymentMode === 'Cheque' && <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
        <TextInput
          id='systematicChequeNumber'
          index={index}
          label='Cheque Number'
          title='6-digit cheque number'
          value={systematicItem.systematicChequeNumber}
          pattern={'^[0-9]*$'}
          required={true}
          maxLength={6}
          onChange={handleInputChange}
        />
      </div>}
      {/* <div className='shrink w-1/2'>
              <TextAreaInput
                id='systematicRemarksByEntryPerson'
                index={index}
                label='Remarks by Entry Person'
                rows={3}
                cols={5}
                minLength={3}
                maxLength={500}
                required={true}
                value={systematicItem.systematicRemarksByEntryPerson}
                onChange={handleInputChange}
              />
            </div> */}
      {/* <div className='absolute bottom-3 right-3'>
              <PrimaryButton text='Save' />
            </div> */}
    </fieldset>
  )
}

export default SystematicForm