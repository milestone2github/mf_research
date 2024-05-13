import React from 'react'
import { IoMdClose } from "react-icons/io";

function CloseButton({action, title, additionalClasses}) {
  return (
    <button 
      title={title} 
      onClick={action}
      type='button'
      className={`text-gray-750 border border-transparent rounded hover:text-gray-950 px-1 py-1 hover:border-gray-750 ${additionalClasses}`}
    ><IoMdClose />
    </button>
  )
}

export default CloseButton