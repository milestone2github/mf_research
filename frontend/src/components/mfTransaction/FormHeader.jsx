import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { handleChange } from '../../reducers/CommonDataSlice'
import { resetAllOptionLists, setInvestorNameOptions } from '../../reducers/OptionListsSlice'
import { fetchInvestorData } from '../../Actions/OptionListsAction'
import debounce from '../../utils/debounce'
import CustomInputList from './common/CustomInputList'
import InputListWithFilter from './common/InputListWithFilter'
import RadioInputWithDate from './common/RadioInputWithDate'
import { resetSystematicData } from '../../reducers/SystematicDataSlice'
import { resetPurchRedempData } from '../../reducers/PurchRedempDataSlice'
import { resetSwitchData } from '../../reducers/SwitchDataSlice'

function FormHeader() {
  // get common data state from store
  const commonData = useSelector(state => state.commonData.value);

  // state to store filter value of search investors from all RMs 
  const [searchAllInvestor, setSearchAllInvestor] = useState(false)

  // get optionLists state from store 
  const {
    investorNameOptions,
    transactionPrefOptions
  } = useSelector(state => state.optionLists);

  // use useDispatch hook to use reducers 
  const dispatch = useDispatch();

  // method to update search all 
  const updateSearchAll = (value) => {
    setSearchAllInvestor(value);
  }

  // Debounced dispatch function
  const debouncedFetchInvestorData = useCallback(
    debounce((nextValue, name) => {
      dispatch(fetchInvestorData({ [name]: nextValue, searchAll: searchAllInvestor }))
        .then((action) => {
          console.log("Dispatched fetchInvestorData");
        })
        .catch((error) => {
          console.error("Error while fetching investor data:", error);
        });
    }, 280), // 300ms debounce time
    [dispatch, searchAllInvestor]
  );

  const handleNameChange = (option) => {
    dispatch(handleChange({ name: 'investorName', value: option.name }))
    dispatch(handleChange({ name: 'panNumber', value: option.pan || '' }))
    dispatch(handleChange({ name: 'familyHead', value: option.familyHead || '' }))
    dispatch(handleChange({ name: 'iWellCode', value: option.iWellCode || '' }))

    // reset other option lists 
    dispatch(resetAllOptionLists())

    // add selected option to investor list 
    dispatch(setInvestorNameOptions([option]))

    // reset all filled data
    dispatch(resetSystematicData())
    dispatch(resetPurchRedempData())
    dispatch(resetSwitchData())
  }

  // method to handle change in inputs 
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    dispatch(handleChange({ name, value }));
  }

  return (
    <fieldset className='flex flex-wrap gap-6 gap-y-8 mt-5'>
      {/* <legend></legend> */}

      <div className='grow shrink basis-full'>
        <RadioInputWithDate
          label='Transaction Preference'
          name='transactionPreference'
          // options={transactionPrefOptions}
          selectedValue={commonData.transactionPreference}
          onChange={handleInputChange}
        />
      </div>

      {/* <fieldset className='flex grow shrink gap-3 mt-3'> */}
      {/* <legend className='text-gray-800 text-sm text-left'>Investor Name</legend> */}
      <div className="w-80 grow shrink basis-72">
        <InputListWithFilter
          filterId='searchAll'
          filterLabel='Search All'
          filterValue={searchAllInvestor}
          onChangeFilter={updateSearchAll}
          id='investorName'
          label='Investor name'
          listName='investor-names'
          required={true}
          value={commonData.investorName}
          fetchData={debouncedFetchInvestorData}
          updateSelectedOption={handleNameChange}
          listOptions={investorNameOptions}
          renderOption={(option) =>
            (<><span className='font-medium'>{option.name}</span> / <span className='text-gray-900'>{option.pan}</span> / <span>{option.familyHead}</span> / <span>{option.email}</span></>)
          }
        />
      </div>
      {/* </fieldset> */}

      <div className='grow shrink basis-72 w-80'>
        <CustomInputList
          id='panNumber'
          label='PAN Number'
          listName='pan-numbers'
          placeHolder='XXXXXXXXXX'
          required={false}
          value={commonData.panNumber}
          fetchData={debouncedFetchInvestorData}
          updateSelectedOption={handleNameChange}
          listOptions={investorNameOptions}
          renderOption={(option) =>
            (<><span className=''>{option.name}</span> / <span className='font-medium'>{option.pan}</span> / <span>{option.familyHead}</span> / <span>{option.email}</span></>)
          }
        />
      </div>
      <div className='grow shrink basis-72 w-80'>
        <CustomInputList
          id='familyHead'
          label='Family Head'
          listName='pan-numbers'
          required={true}
          value={commonData.familyHead}
          fetchData={debouncedFetchInvestorData}
          updateSelectedOption={handleNameChange}
          listOptions={investorNameOptions}
          renderOption={(option) =>
            (<><span>{option.name}</span> / <span>{option.pan}</span> / <span className='font-medium'>{option.familyHead}</span> / <span>{option.email}</span></>)
          }
        />
        {/* <TextInput
            id='familyHead'
            label='Family Head'
            required={true}
            disable={true}
            value={commonData.familyHead}
            onChange={handleInputChange}
          /> */}
      </div>

    </fieldset>
  )
}

export default FormHeader