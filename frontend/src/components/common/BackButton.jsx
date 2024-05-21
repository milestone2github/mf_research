import React from 'react'
import { GoArrowLeft } from "react-icons/go";

function BackButton({action}) {

  return (
    <button 
      onClick={action}
      className='p-3 rounded-md border bg-gray-100 hover:-translate-x-1 hover:bg-gray-200'>
      <GoArrowLeft />
    </button>
  )
}

export default BackButton