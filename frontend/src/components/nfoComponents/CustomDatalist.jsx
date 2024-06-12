import React, { useEffect, useRef, useState } from 'react'

function CustomDatalist({ label, id, selectedValue, updateKeywords, updateSelectedValue, options, field }) {
  // const [value, setValue] = useState(selectedValue)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const container = useRef(null)

  // Effect to listen click outside of the Dropdown 
  useEffect(() => {
    document.addEventListener('mousedown', handleBlur);

    return () => {
      document.removeEventListener('mousedown', handleBlur);
    }
  }, [])
  
  const handleChange = (e) => {
    updateKeywords(e.target.value)
  }

  const handleSelect = (option) => {
    let selectedValue = option[field] || ''
    updateKeywords(selectedValue)
    updateSelectedValue(option)
    setIsActive(false)
  }

  const handleBlur = (e) => {
    if (!container?.current.contains(e.target)) {
      setIsActive(false);
    }
    if (!options.includes(selectedValue)) {
      setError(true)
      // console.log('not include')
    }
    else {
      // console.log('includes')
      setError(false)
    }
  }

  // method to handle menu using keys 
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        console.log('key: ', event.key)
        setHighlightedIndex((prevIndex) =>
          prevIndex < options.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        console.log('key: ', event.key)
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : 0
        );
        break;
      case 'Enter': console.log('key: ', event.key)
        event.preventDefault();
        if(highlightedIndex >= 0 && highlightedIndex < options.length){
          updateSelectedValue(options[highlightedIndex])
          setIsActive(false);
          event.target.blur();
          setHighlightedIndex(-1)
        }
        break;
      case 'Escape':
        setIsActive(false);
        break;
      case 'Tab':
        if(highlightedIndex >= 0 && highlightedIndex < options.length){
          updateSelectedValue(options[highlightedIndex])
        }
        setIsActive(false);
        event.target.blur();
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className='flex flex-col basis-60 md:basis-80 grow text-left relative'>
      <label htmlFor={id} className='text-gray-800 text-sm font-medium p-0 leading-none mb-2 '>{label}</label>
      <div
        ref={container} 
        onBlur={handleBlur} 
        onKeyDown={handleKeyDown} 
        onFocus={()=> setIsActive(true)}
        >
        <input
          className='px-2 py-2 focus:outline-blue-500 outline-offset-0 outline outline-2 outline-gray-200 text-gray-700 w-full rounded-lg'
          type="search"
          role="combobox"
          aria-controls={`${id}-list`}
          aria-expanded={isActive}
          autoComplete='off'
          name={id}
          id={id}
          value={selectedValue}
          required={true}
          onChange={handleChange}
          // onFocus={() => setIsActive(true)}
        />
        
        {/* {error && <p className='text-red-400'>Invalid name</p>} */}
        {isActive && <ul id={`${id}-list`} className='absolute top-full w-full py-1 flex flex-col mt-1 h-fit max-h-80 overflow-y-auto rounded-md bg-white shadow-xl shadow-gray-200 z-30'>{
          options.map((option, index) => (
            <li key={index} className='w-full m-0 p-0 last:border-b-0 border-b border-gray-100 cursor-pointer'>
              <p
                role="option"
                onClick={() => handleSelect(option)}
                className={`${highlightedIndex === index? 'bg-gray-100': 'bg-transparent'} px-2 py-1 md:text-sm w-full  hover:bg-gray-100 text-left`}
              >
                {`${option.name} / ${option.pan} / ${option.familyHead}`}
              </p>
            </li>
          ))
        }</ul>}

      </div>
    </div>
  )
}

export default CustomDatalist