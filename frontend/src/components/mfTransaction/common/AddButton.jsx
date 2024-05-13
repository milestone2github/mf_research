import React from 'react'
import { BsPlusLg } from "react-icons/bs";

function AddButton({action, title}) {
  return (
    <button 
      title={title} 
      onClick={action}
      type='button'
      className='text-base text-dark-blue  p-[6px] md:p-2 rounded-full border-dark-blue border hover:bg-dark-blue hover:text-primary-white'
    ><BsPlusLg />
    </button>
  )
}

export default AddButton