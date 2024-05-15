import React from 'react'

function TextInput(props) {
  const { id, value, index, onChange, label, placeHolder, minLength, maxLength, required, disable, pattern, title } = props;

  return (
    <div className='flex flex-col gap-1'>
      <label 
        htmlFor={`${id}-${index}`}
        className='text-gray-750 text-sm text-left'
        >{label}
      </label>

      <input 
        type="text" 
        className='bg-transparent text-black-900 rounded-md border-2 w-full border-inactive-border py-2 px-2 outline-none focus-within:border-light-blue disabled:border-gray-200'
        name={id} 
        id={`${id}-${index}`}
        title={title} 
        data-index={index}
        required={required}
        disabled={disable}
        maxLength={maxLength}
        minLength={minLength}
        placeholder={placeHolder}
        pattern={pattern}
        value={value}
        onChange={onChange}/>
    </div>
  )
}

export default TextInput