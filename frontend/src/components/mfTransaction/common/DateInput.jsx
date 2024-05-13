import React from 'react'

function DateInput(props) {
  const { id, value, index, onChange, label, placeHolder, minDate, maxDate, required, disable, pattern } = props;

  return (
    <div className='flex flex-col gap-1'>
      <label 
        htmlFor={`${id}-${index}`}
        className='text-gray-750 text-sm text-left'
        >{label}
      </label>

      <input 
        type="date" 
        className='bg-transparent text-black-900 rounded-md border-2 w-full border-gray-300 py-2 px-2 outline-none focus-within:border-light-blue disabled:border-gray-200'
        name={id} 
        id={`${id}-${index}`} 
        data-index={index}
        required={required}
        disabled={disable}
        max={maxDate}
        min={minDate}
        placeholder={placeHolder}
        pattern={pattern}
        value={value}
        onChange={onChange}/>
    </div>
  )
}

export default DateInput