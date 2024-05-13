import React from 'react'
import { CiCircleMinus } from "react-icons/ci";

function MinusButton({action, title, additionalClasses}) {
  return (
    <button 
      title={title} 
      onClick={action}
      type='button'
      className={`text-gray-450 text-4xl rounded hover:text-red-600 ${additionalClasses}`}
    ><CiCircleMinus />
    </button>
  )
}

export default MinusButton