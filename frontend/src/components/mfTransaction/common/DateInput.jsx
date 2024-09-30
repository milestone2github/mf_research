import React from 'react'

function DateInput(props) {
  const { id, value, index, onChange, label, placeHolder, minDate, maxDate, required, disable, pattern } = props;

  // Handle date change and reset to blank if invalid date is entered
  const handleDateChange = (event) => {
    const inputDate = new Date(event.target.value);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (inputDate < currentDate) {
      alert("Selected date cannot be in the past!");
      
      // Simulate an event object when resetting the value
      const newEvent = {
        target: {
          name: event.target.name,
          value: '',
          dataset: event.target.dataset,
        }
      };

      onChange(newEvent);
      return;
    }

    onChange(event);
  };

  return (
    <div className='flex flex-col gap-1'>
      <label 
        htmlFor={`${id}-${index}`}
        className='text-gray-750 text-sm text-left'
        >{label}
      </label>

      <input 
        type="date" 
        className='bg-transparent text-black-900 rounded-md border-2 w-full border-inactive-border py-2 px-2 outline-none focus-within:border-light-blue disabled:border-gray-200'
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
        onChange={handleDateChange}/>
    </div>
  )
}

export default DateInput