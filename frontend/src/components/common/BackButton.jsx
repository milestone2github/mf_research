import React from 'react'
import { GoArrowLeft } from "react-icons/go";

function BackButton({action = () => window.history.back()}) {

  return (
    <button 
      onClick={action}
      title='Back'
      className='p-3 rounded-md border bg-gray-100 group hover:border-gray-400'>
      <GoArrowLeft className='group-hover:-translate-x-1'/>
    </button>
  )
}

export default BackButton