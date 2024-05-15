import React from 'react'

function NumberInput(props) {
  const { id, value, onChange, label, index, title, min, max, required, disable, step, updateCollapsed } = props;

  const handleInvalidInput = (e) => {
    if(updateCollapsed)
      updateCollapsed(false);
  } 

  return (
    <div className='flex flex-col gap-1'>
      <label 
        htmlFor={`${id}-${index}`}
        className='text-gray-750 text-sm text-left'
        >{label}
      </label>

      <input 
        type="number" 
        className='bg-transparent text-black-900 rounded-md border-2 w-full border-inactive-border py-2 px-2 outline-none focus-within:border-light-blue disabled:border-gray-200'
        name={id} 
        id={`${id}-${index}`}
        data-index={index}
        required={required}
        disabled={disable}
        min={min}
        max={max}
        step={step? step: 1}
        title={title}
        value={value}
        onInvalid={handleInvalidInput}
        onChange={onChange}/>
    </div>
  )
}

export default NumberInput