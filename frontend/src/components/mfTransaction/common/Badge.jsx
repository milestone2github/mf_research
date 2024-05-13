import React from 'react'

function Badge({text, count}) {
  return (
    <p 
      className='text-xs text-nowrap w-max h-max text-black-900 bg-gray-200 rounded-lg px-3 py-1'
    >{text} : 
    {/* <span className='bg-light-blue w-4 h-4 rounded-full text-center'>{count}</span> */}
    <span className='ps-1'>{count}</span>
    </p>
  )
}

export default Badge