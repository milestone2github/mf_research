import React, { useEffect, useState } from 'react'
import getCurrentDate from '../../../utils/getCurrentDate';
import getCurrentDateTime from '../../../utils/getCurrentDateTime';

function RadioInputWithDate({ label, name, onChange, selectedValue }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [selectedOption, setSelectedOption] = useState(selectedValue);

  const handleChange = (e) => {
    setSelectedOption(e.target.value);

    if(e.target.value === 'chooseDate') {
      e.target.value = selectedDate;
    }
    else if(e.target.value === 'chooseDateTime') {
      e.target.value = selectedDateTime;
    }
    onChange(e)
  }

  const onDateChange = (e) => {
    setSelectedDate(e.target.value);
    onChange(e)
  }

  const onDateTimeChange = (e) => {
    setSelectedDateTime(e.target.value);
    onChange(e)
  }

  useEffect(() => {
    if(selectedValue === 'ASAP')
      setSelectedOption(selectedValue)
  
  }, [selectedValue])
  

  return (
    <div className='flex flex-col text-nowrap'>
      <label className='text-gray-750 text-sm text-left'>{label}</label>
      <div className='flex flex-col gap-2 mt-3 md:flex-row'>

        <div className='relative text-left py-2 rounded-md outline outline-none focus-within:outline-blue-900'>
          <label
            htmlFor='asap'
            className={`relative rounded-md cursor-pointer px-4 py-2 ring-inset  ${selectedOption === 'ASAP' ? 'ring-light-blue ring-2 bg-light-blue/10 text-light-blue' : 'bg-transparent ring-light-gray ring-1'} before:rounded-md before:absolute before:-inset-0 before:bg-primary-white before:-z-10`}
          >ASAP</label>

          <input
            type="radio"
            checked={selectedOption === "ASAP"}
            name={name}
            id='asap'
            required
            value="ASAP"
            onChange={handleChange}
            className='absolute top-1/2 left-0 -translate-y-1/2 mx-2 -z-20 accent-light-blue'
          />
        </div>

        <div className='relative text-left py-2 rounded-md outline outline-none focus-within:outline-blue-900'>
          <label
            htmlFor='nextWorkingDay'
            className={`relative rounded-md cursor-pointer px-4 py-2 ring-inset  ${selectedOption === 'Next Working Day' ? 'ring-light-blue ring-2 bg-light-blue/10 text-light-blue' : 'bg-transparent ring-light-gray ring-1'} before:rounded-md before:absolute before:-inset-0 before:bg-primary-white before:-z-10`}
          >Next Working Day</label>

          <input
            type="radio"
            checked={selectedOption === "Next Working Day"}
            name={name}
            id='nextWorkingDay'
            required
            value="Next Working Day"
            onChange={handleChange}
            className='absolute top-1/2 left-0 -translate-y-1/2 mx-2 -z-20 accent-light-blue'
          />
        </div>

        {/* Date Option Input */}
        <div className='relative text-left py-2 rounded-md outline outline-none focus-within:outline-blue-900'>
          <label
            htmlFor='chooseDate'
            className={`relative rounded-md cursor-pointer px-4 py-2 ring-inset  ${selectedOption === 'chooseDate' ? 'ring-light-blue ring-2 bg-light-blue/10 text-light-blue' : 'bg-transparent ring-light-gray ring-1'} before:rounded-md before:absolute before:-inset-0 before:bg-primary-white before:-z-10`}
          ><span className='text-gray-750'>Select Date</span> 
          <input
            type="date"
            name={name}
            id='dateOption'
            min={getCurrentDate()}
            required
            onChange={onDateChange}
            disabled={selectedOption !== 'chooseDate'}
            className={`ms-2 -z-20 px-2 rounded accent-light-blue disabled:hidden`}
          />
          </label>

          <input
            type="radio"
            checked={selectedOption === "chooseDate"}
            name={name}
            id='chooseDate'
            required
            value="chooseDate"
            onChange={handleChange}
            className='absolute top-1/2 left-0 -translate-y-1/2 mx-2 -z-20 accent-light-blue'
          />
        </div>

        {/* Date and Time Option Input */ }
        <div className='relative text-left py-2 rounded-md outline outline-none focus-within:outline-blue-900'>
          <label
            htmlFor='chooseDateTime'
            className={`relative rounded-md cursor-pointer px-4 py-2 ring-inset  ${selectedOption === 'chooseDateTime' ? 'ring-light-blue ring-2 bg-light-blue/10 text-light-blue' : 'bg-transparent ring-light-gray ring-1'} before:rounded-md before:absolute before:-inset-0 before:bg-primary-white before:-z-10`}
          ><span className='text-gray-750'>Select Date & Time</span> 
          <input
            type='datetime-local'
            name={name}
            id='dateTimeOption'
            min={getCurrentDateTime()}
            required
            onChange={onDateTimeChange}
            disabled={selectedOption !== 'chooseDateTime'}
            className={`ms-2 -z-20 px-2 rounded accent-light-blue disabled:hidden`}
          />
          </label>

          <input
            type="radio"
            checked={selectedOption === "chooseDateTime"}
            name={name}
            id='chooseDateTime'
            required
            value="chooseDateTime"
            onChange={handleChange}
            className='absolute top-1/2 left-0 -translate-y-1/2 mx-2 -z-20 accent-light-blue'
          />
        </div>

      </div>
    </div>
  )
}

export default RadioInputWithDate