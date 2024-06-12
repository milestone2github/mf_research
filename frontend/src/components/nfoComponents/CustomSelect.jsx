import React, { useEffect, useRef, useState } from 'react';
import { TbCaretUpDownFilled } from "react-icons/tb";

const CustomSelect = ({ label, id, selectedOption, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  const handleClickOutside = (e) => {
    if (container.current && !container.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (event) => {
    let selectedIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = options.indexOf(selectedOption) < options.length - 1 ? options.indexOf(selectedOption) + 1 : options.indexOf(selectedOption);
        onSelect( options[selectedIndex] ); //select this option
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = options.indexOf(selectedOption) > 0 ? options.indexOf(selectedOption) - 1 : 0;
        onSelect(options[selectedIndex]); //select this option
        break;
      case 'Enter':
        setIsOpen(false);
        break;
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
    <div className='flex flex-col min-w-60 w-full'>
      <label htmlFor={id} className='text-gray-800 font-medium text-sm text-left z-0'>{label}</label>
      <div 
        ref={container} 
        className={`relative bg-white mt-1 outline outline-2 outline-gray-200 focus:outline-indigo-500 rounded-md`} 
        tabIndex={0} 
        onKeyDown={handleKeyDown}
        role="combobox" 
        aria-controls={`${id}-list`}
        aria-haspopup="listbox" 
        aria-expanded={isOpen} 
        aria-labelledby={id}
      >
        <div title={selectedOption} className={`flex items-center text-black-900 w-full border-gray-300 py-2 px-2 z-0 cursor-pointer`} onClick={toggleDropdown}>
          <span className='h-[26px] overflow-y-hidden'>{selectedOption || 'Select'}</span>
          <span className='ms-auto text-gray-600'><TbCaretUpDownFilled /></span>
        </div>
        {isOpen && (
          <ul id={`${id}-list`} className="absolute top-full w-full h-auto max-h-56 overflow-y-auto bg-white rounded-md mt-1 py-1 list-none shadow-md z-10">
            {options.map((option, index) => (
              <li
                key={index}
                className={`py-1 px-2 cursor-pointer select-none border-b border-indigo-50 last:border-none hover:bg-indigo-50 ${(option === selectedOption) ? 'bg-indigo-100' : ''}`}
                onClick={() => handleOptionClick(option)}
                role="option" 
                aria-selected={option === selectedOption} 
              >
                {option || 'Select'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
