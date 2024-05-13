import React, { useEffect, useRef, useState } from 'react';
import { IoChevronDownOutline } from "react-icons/io5";

const FolioSelectMenu = ({ label, id, index, selectedOption, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // method to handle click on options 
  const handleOptionClick = (option) => {
    onSelect(id, option.folio, index); // Callback for parent component
    setIsOpen(false);
  };

  // method to handle click outside of the SelectMenu 
  const handleClickOutside = (e) => {
    if (container.current && !container.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  // Effect to listen click outside of the Dropdown 
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [])

  // method to handle menu using keys 
  const handleKeyDown = (event) => {
    let selectedIndex = options.findIndex(option => option.folio === selectedOption);
    let newSelectedIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newSelectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : selectedIndex;
        onSelect(id, options[newSelectedIndex].folio, index); //select this option
        break;
      case 'ArrowUp':
        event.preventDefault();
        newSelectedIndex = selectedIndex > 0 ? selectedIndex - 1 : 0;
        onSelect(id, options[newSelectedIndex].folio, index); //select this option
        break;
      case 'Enter':
        setIsOpen(false);
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className='flex flex-col'>
      <label
        htmlFor={id}
        className='text-gray-750 text-sm text-left z-0'
      >{label}
      </label>
      <div
        ref={container}
        className={`relative mt-1 focus:outline-none focus:border-light-blue border-2 rounded-md ${isOpen && 'border-light-blue'}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id}
      >

        <div className={`flex items-center bg-transparent text-black-900 w-full border-gray-300 py-2 px-2 z-0 `} onClick={toggleDropdown}>
          <span>{selectedOption || 'Select'}</span>
          <span className='ms-auto'><IoChevronDownOutline /></span>

        </div>
        {isOpen && (
          <ul className="absolute top-full w-full max-h-80 overflow-y-auto snap-y scroll-p-1 text-sm bg-primary-white rounded-md mt-1 py-1 list-none shadow-md z-10">
            {options.map((option, index) => (
              <li
                key={index}
                className={`${(!option.folio || option.folio === 'Create New Folio') ? 'py-3' : 'py-1'} px-2 cursor-pointer select-none text-left hover:bg-gray-100 ${option.folio === selectedOption ? 'bg-gray-200' : ''} `}
                onClick={(e) => { handleOptionClick(option) }}
                role="option"
                aria-selected={option.folio === selectedOption}
              >
                <span>{option.folio || 'Select'}</span>

                {option.folio && option.folio != 'Create New Folio' &&
                  <><div className="flex gap-4 justify-between">
                    <span className='text-xs w-20 text-dark-blue'>U : {option.units}</span>
                    <span className='text-xs text-green-600'>A : {option.amount}</span>
                  </div>
                  <div className="flex gap-4 justify-between">
                    <span className='text-xs w-20 '>{option.holding}</span>
                    <span className='text-xs'>{option.bankDetail}</span>
                  </div></>
                }
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FolioSelectMenu;