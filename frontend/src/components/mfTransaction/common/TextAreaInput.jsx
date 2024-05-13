import React from 'react'

function TextAreaInput({id, rows, cols, label, index, value, onChange, minLength, maxLength, required}) {
  return (
    <div className='flex flex-col gap-1'>
    <label htmlFor={`${id}-${index}`} className='text-sm text-left text-gray-750'>{label}</label>
    <textarea 
      rows={rows} 
      cols={cols} 
      name={id}
      id={`${id}-${index}`}
      data-index={index}
      minLength={minLength}
      maxLength={maxLength}
      required={required}
      value={value}
      onChange={onChange}
      className='bg-transparent text-black-900 rounded-md border-2 w-full border-gray-300 py-2 px-2 outline-none focus-within:border-light-blue disabled:border-gray-200'
      >

    </textarea>
    </div>
  )
}

export default TextAreaInput