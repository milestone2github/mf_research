import React, { useEffect, useState } from 'react'

function PayoutConfirmModal({isOpen, title, handleCancel, handleProceed, error}) {
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if(!isOpen) {
      setInputValue('')
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleProceed(inputValue)
  }

  if(!isOpen) return null

  return (
    <div className='absolute inset-0 z-[1001] w-screen h-screen bg-black/70 flex items-center justify-center'>
      <form onSubmit={handleSubmit} className={`w-fit h-fit bg-primary-white rounded-md shadow-md p-6 py-8 md:w-[428px] flex flex-col gap-y-4`}>
        <p className="text-gray-800 font-medium">{title}</p>
        <div className="flex flex-col">
        <input 
          type="text" 
          name="ass-name" 
          id="ass-name"
          autoComplete='off' 
          className='rounded-md p-2 w-full border border-gray-500' 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {error && <p className='text-red-400 text-sm text-left mt-1'>{error}</p>}
        </div>
        <div className='flex gap-x-3 mt-4 justify-end'>
          <button onClick={handleCancel} type='button' className='border rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
          <button type='submit' className='border rounded-lg py-2 px-6 bg-blue-600 hover:bg-blue-500 text-white'>Proceed</button>
        </div>
      </form>
    </div>
  )
}

export default PayoutConfirmModal