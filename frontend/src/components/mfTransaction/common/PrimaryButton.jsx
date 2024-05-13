import React from 'react'

function PrimaryButton({text, action, width, disable }) {

  return (
    <button 
      type='submit'
      disabled={disable}
      style={{width: width}}
      className='bg-light-blue text-primary-white min-w-[120px] text-center rounded-md px-5 py-2 enabled:hover:bg-dark-blue disabled:opacity-70'
      onClick={action}
      >{text}
    </button>
  )
}

export default PrimaryButton