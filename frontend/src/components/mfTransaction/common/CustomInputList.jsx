import React, { useEffect, useRef, useState } from 'react'

function CustomInputList({
  id,
  index,
  value,
  listName,
  listOptions,
  label,
  required,
  disable,
  renderOption,
  fetchData,
  updateSelectedOption,
  updateCollapsed
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const container = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    setInputValue(value); // Update state when the `value` prop changes
  }, [value]);

  // Effect to listen click outside of the Dropdown 
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputValue(value)

    if(fetchData)
      fetchData(value, name);
  }

  // method to handle click outside of the SelectMeu 
  const handleClickOutside = (e) => {
    if (!container?.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const handleInvalidInput = (e) => {
    if(updateCollapsed)
      updateCollapsed(false);
  }

  // method to handle menu using keys 
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        console.log('key: ', event.key)
        setHighlightedIndex((prevIndex) =>
          prevIndex < listOptions.length - 1 ? prevIndex + 1 : prevIndex
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
        if(highlightedIndex >= 0 && highlightedIndex < listOptions.length){
          updateSelectedOption(listOptions[highlightedIndex], id, index)
          setIsOpen(false);
          event.target.blur();
          setHighlightedIndex(-1)
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        if(highlightedIndex >= 0 && highlightedIndex < listOptions.length)
          updateSelectedOption(listOptions[highlightedIndex], id, index);
        else if(value.length)
          setInputValue(value)
        else
          setInputValue('')
        setIsOpen(false);
        event.target.blur();
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className='flex flex-col gap-1'>
      <label
        htmlFor={id}
        className='text-gray-750 text-sm text-left'
      >{label}
      </label>

      <div
        ref={container} 
        className={`relative mt-1 focus:outline-none focus-within:border-light-blue border-2 rounded-md ${isOpen && 'border-light-blue'}`} 
        onKeyDown={handleKeyDown}
        onBlur={handleClickOutside} 
        onFocus={() => toggleDropdown}
      >

      <input
        className='bg-transparent text-black-900 rounded-md w-full border-gray-300 py-2 px-2 outline-none focus-within:border-none disabled:border-gray-200'
        name={id}
        id={id}
        list={listName}
        required={required}
        disabled={disable}
        value={inputValue}
        onChange={handleChange}
        autoComplete='off'
        onFocus={() => {if(!isOpen) setIsOpen(true)}}
        onInvalid={handleInvalidInput}
      />

      {isOpen && !!listOptions.length && <ul className="absolute top-full w-full max-h-[328px] overflow-y-auto snap-y scroll-p-1 text-sm rounded-md mt-1 py-1 bg-primary-white list-none shadow-md z-10 border">
        {listOptions.map((option, idx) => (
          <li 
          key={idx} 
          className={`py-2 px-2 cursor-pointer snap-start text-left hover:bg-gray-200 focus:bg-gray-200 ${idx === highlightedIndex ? 'bg-gray-200' : ''}`}
          onClick={() => {
            updateSelectedOption(option, id, index);
            setIsOpen(false);
          }}
          >{renderOption(option)}
            {/* <span className='font-medium'>{option.name}</span> / <span className='text-gray-900'>{option.pan}</span> / <span>{option.familyHead}</span> */}
          </li>
        ))}
      </ul>}
      </div>
    </div>
  )
}

export default CustomInputList