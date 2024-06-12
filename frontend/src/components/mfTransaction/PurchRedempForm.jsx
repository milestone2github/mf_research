import React, { useCallback, useEffect } from 'react'
import PreFilledSelect from './common/PreFilledSelect';
import RadioInput from './common/RadioInput';
import NumberInput from './common/NumberInput';
import { useDispatch, useSelector } from 'react-redux';
import { handleChange, handleSelect } from '../../reducers/PurchRedempDataSlice';
import CustomInputList from './common/CustomInputList';
import { fetchAmcNameOptions, fetchFolioOptions, fetchSchemeNameOptions } from '../../Actions/OptionListsAction';
import debounce from '../../utils/debounce';
import TextInput from './common/TextInput';
import FolioSelectMenu from './common/FolioSelectMenu';
import { setAmcNameOptions, setSchemeNameOptions } from '../../reducers/OptionListsSlice';

function PurchRedempForm({ index, updateCollapsed }) {
  // get purchRedempData state from store
  const purchRedempItem = useSelector(state => state.purchRedempData.value[index]);
  const commonData = useSelector(state => state.commonData.value);

  // get optionList state from store
  const {
    purch_redempTraxTypeOptions,
    purchaseTraxUnits_AmountOptions,
    redemptionTraxUnits_AmountOptions,
    amcNameOptions,
    schemeNameOptions,
    schemeOptionOptions,
    folioOptions,
    folioOptionsWithNew,
    purchPaymentModeOptions
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

  // method to handle change in amc name
  const handleAmcNameChange = (value, name, index) => {
    dispatch(handleSelect({ name, value, index })); // dispatch the change

    dispatch(setAmcNameOptions([value])) 
    dispatch(setSchemeNameOptions([]))
    dispatch(handleSelect({name: 'purch_redempSchemeName', value: '', index}))
    dispatch(handleSelect({name: 'purch_redempFolio', value: '', index}))
  };

  // method to handle change in scheme name
  const handleSchemeNameChange = (value, name, index) => {
    dispatch(handleSelect({ name, value, index })); // dispatch the change
    dispatch(setSchemeNameOptions([value])) 
  };

  // method to handle change in inputs 
  const handleInputChange = (event) => {
    const { name, value, dataset: { index } } = event.target;
    dispatch(handleChange({ name, value, index }));
  };

  // method to handle change in select menus
  const handleSelectChange = (name, value, index) => {
    dispatch(handleSelect({ name, value, index }));
  };

  // effect to fetch folio options on change of amc and pan number 
  useEffect(() => {
    if (commonData.iWellCode) {
      dispatch(fetchFolioOptions({ iWell: commonData.iWellCode, amcName: purchRedempItem.purch_redempMfAmcName }))
        .then((action) => {
          console.log("Dispatched fetchFolioOptions");
        })
        .catch((error) => {
          console.error("Error while fetching folios:", error);
        });
    }

  }, [purchRedempItem.purch_redempMfAmcName, commonData.iWellCode])

  return (
    <fieldset className='px-3 py-4 flex flex-wrap -mt-4 gap-x-16 gap-y-4'>

      <div className='grow shrink basis-72'>
        <RadioInput
          index={index}
          label='Transaction Type'
          name={`purch_RedempTraxType-${index}`}
          options={purch_redempTraxTypeOptions}
          selectedOption={purchRedempItem.purch_RedempTraxType}
          onChange={handleInputChange}
          updateCollapsed={updateCollapsed}
        />
      </div>
      <div className='grow shrink basis-72'>
        <CustomInputList
          id='purch_redempMfAmcName'
          index={index}
          label='MF (AMC) Name'
          listName='amc-names'
          required={true}
          value={purchRedempItem.purch_redempMfAmcName}
          fetchData={debouncedFetchAmcNames}
          updateSelectedOption={handleAmcNameChange}
          listOptions={amcNameOptions}
          updateCollapsed={updateCollapsed}
          renderOption={(option) => (
            option
          )}
        />
      </div>
      <div className='grow shrink basis-72'>
        <CustomInputList
          id='purch_redempSchemeName'
          index={index}
          label='Scheme Name'
          listName='purch_redemp-scheme-names'
          required={true}
          value={purchRedempItem.purch_redempSchemeName}
          fetchData={(value) =>
            debouncedFetchSchemeNames(purchRedempItem.purch_redempMfAmcName, value)
          }
          updateSelectedOption={handleSchemeNameChange}
          listOptions={schemeNameOptions}
          updateCollapsed={updateCollapsed}
          renderOption={(option) => (
            option
          )}
        />
      </div>
      <div className='grow shrink basis-72'>
        <RadioInput
          index={index}
          label='Scheme Option'
          name={`purch_redempSchemeOption-${index}`}
          options={schemeOptionOptions}
          selectedOption={purchRedempItem.purch_redempSchemeOption}
          onChange={handleInputChange}
          updateCollapsed={updateCollapsed}
        />
      </div>
      <div className='grow shrink basis-72'>
        <FolioSelectMenu
          id='purch_redempFolio'
          index={index}
          label='Folio'
          options={
            purchRedempItem.purch_RedempTraxType === 'Purchase' ?
              folioOptionsWithNew :
              folioOptions
          }
          selectedOption={purchRedempItem.purch_redempFolio}
          onSelect={handleSelectChange}
        />
      </div>
      <div className='grow shrink basis-72'>
        <PreFilledSelect
          id='purch_redempTransactionUnits_Amount'
          index={index}
          label='Transaction Units / Amount'
          options={purchRedempItem.purch_RedempTraxType === 'Purchase' ? purchaseTraxUnits_AmountOptions : redemptionTraxUnits_AmountOptions}
          selectedOption={purchRedempItem.purch_redempTransactionUnits_Amount}
          onSelect={handleSelectChange}
        />
      </div>
      <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
        <NumberInput
          id='purch_redempTransactionAmount'
          index={index}
          label='Amount / Units'
          min={1}
          step={0.001}
          required={true}
          value={purchRedempItem.purch_redempTransactionAmount}
          onChange={handleInputChange}
          updateCollapsed={updateCollapsed}
        />
      </div>
      {purchRedempItem.purch_RedempTraxType === 'Purchase' &&
        <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
          <PreFilledSelect
            id='purch_redempPaymentMode'
            index={index}
            label='Payment Mode'
            options={purchPaymentModeOptions}
            selectedOption={purchRedempItem.purch_redempPaymentMode}
            onSelect={handleSelectChange}
          />
        </div>}

      {purchRedempItem.purch_redempPaymentMode === 'Cheque' && <div className='grow shrink basis-72 max-w-full md:max-w-[calc(50%-32px)] lg:max-w-[calc(33%-39.6px)]'>
        <TextInput
          id='purchaseChequeNumber'
          index={index}
          label='Cheque Number'
          title='6-digit cheque number'
          value={purchRedempItem.purchaseChequeNumber}
          pattern={'^[0-9]*$'}
          required={true}
          maxLength={6}
          onChange={handleInputChange}
        />
      </div>}
      {/* <div className="w-full">
            <div className='w-1/2'>
              <TextAreaInput
                id='purch_redempRemarksByEntryPerson'
                index={index} 
                label='Remarks by Entry Person'
                rows={3}
                cols={5}
                minLength={3}
                maxLength={500}
                required={true}
                value={purchRedempItem.purch_redempRemarksByEntryPerson}
                onChange={handleInputChange}
              />
            </div>
          </div> */}
      {/* <div className='absolute bottom-3 right-3'>
        <PrimaryButton text='Save' />
      </div> */}
    </fieldset>
  )
}

export default PurchRedempForm