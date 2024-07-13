import React from 'react'
import BackButton from '../common/BackButton'

function AppLink() {
  return (
    <main>
      <div className='flex items-stretch gap-2 mb-3'>
        <BackButton />
        <div className='bg-gray-100 px-2 py-2 rounded-lg w-full'>
          <h3 className='text-3xl font-bold '>Link of our Apps </h3>
        </div>
      </div>

      <article className='relative flex flex-col md:flex-row gap-8 items-center  p-6 shadow-md rounded-lg min-h-[70vh] overflow-hidden'>
        <h5 className='z-20 text-5xl md:pe-12  leading-[3.8rem] font-semibold max-w-80 text-gray-700'>Download the mNivesh App</h5>
        <div className=''>
        <p className='text-lg'>Get the mNivesh app for easy access to your financial tools:</p>
        <ul className='list-disc list-inside mt-3'>
          <li><a target='_blank' className='hover:underline' href="https://play.google.com/store/apps/details?id=com.milestone.mNivesh&hl=en_IN&gl=US&pli=1">mNivesh App for Android</a></li>
          <li><a target='_blank' className='hover:underline' href="https://apps.apple.com/au/app/mnivesh/id1023746858">mNivesh App for iOS</a></li>
        </ul>
        </div>
      </article>
    </main>
  )
}

export default AppLink