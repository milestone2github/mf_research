import React from 'react'

function RadioInput({ options, index, selectedOption, label, name, onChange, updateCollapsed }) {
  // const [selectedOption, setSelectedOption] = useState('')

  const handleChange = (e) => {
    onChange(e)
  }  

  const handleInvalidRadio = (e) => {
    if(updateCollapsed)
      updateCollapsed(false);
  }  

  return (
    <div className='flex flex-col text-nowrap'>
      <label className='text-gray-750 text-sm text-left'>{label}</label>
      <div className='flex flex-col gap-2 mt-3 md:flex-row'>{
        options.map((option, idx) => (
          <div key={option} className='relative text-left py-2 rounded-md outline outline-none focus-within:outline-blue-900'>
            <label
              htmlFor={`${name}-${option}-${index}`}
              className={`relative rounded-md cursor-pointer px-4 py-2 ring-inset  ${selectedOption === option ? 'ring-light-blue ring-2 bg-light-blue/10 text-light-blue' : 'bg-transparent ring-inactive-border ring-1'} before:rounded-md before:absolute before:-inset-0 before:bg-primary-white before:-z-10`}
            >{option}</label>

            <input
              type="radio"
              checked={selectedOption === option}
              name={name}
              id={`${name}-${option}-${index}`}
              data-index={index}
              required={idx === 0}
              value={option}
              onChange={handleChange}
              onInvalid={idx === 0 ? handleInvalidRadio : undefined}
              className='absolute top-1/2 left-0 -translate-y-1/2 mx-2 -z-20 accent-light-blue'
            />
          </div>

        ))
      }
      </div>
    </div>
  )
}

export default RadioInput