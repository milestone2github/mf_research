import React, { useEffect, useRef, useState } from 'react';
import { IoChevronDownOutline } from "react-icons/io5";

const PreFilledSelect = ({ label, id, index, selectedOption, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    onSelect(id, option, index);
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
        onSelect(id, options[selectedIndex], index); //select this option
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = options.indexOf(selectedOption) > 0 ? options.indexOf(selectedOption) - 1 : 0;
        onSelect(id, options[selectedIndex], index); //select this option
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
      <label htmlFor={id} className='text-gray-750 text-sm text-left z-0'>{label}</label>
      <div 
        ref={container} 
        className={`relative mt-1 focus:outline-none border-2 focus:border-light-blue rounded-md ${isOpen && 'border-light-blue'}`} 
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
          <ul className="absolute top-full w-full backdrop-blur-sm bg-light-blue/5 rounded-md mt-1 py-1 list-none shadow-md z-10">
            {options.map((option, index) => (
              <li
                key={index}
                className={`py-1 px-2 cursor-pointer select-none hover:bg-light-blue ${(option === selectedOption) ? 'bg-light-blue text-primary-white' : 'bg-transparent hover:bg-light-gray'}`}
                onClick={(e) => handleOptionClick(option)}
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

export default PreFilledSelect;
