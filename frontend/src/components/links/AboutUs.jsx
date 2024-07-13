import React from 'react'
import BackButton from '../common/BackButton'

function AboutUs() {
  return (
    <main>
      <div className='flex items-stretch gap-2 mb-3'>
        <BackButton />
        <div className='bg-gray-100 px-2 py-2 rounded-lg w-full'>
          <h3 className='text-3xl font-bold '>About Our Company </h3>
        </div>
      </div>

      <article className='relative flex flex-col md:flex-row gap-8 items-center  p-6 shadow-md rounded-lg min-h-[70vh] overflow-hidden'>
        <h5 className='z-20 text-5xl leading-[3.8rem] font-semibold min-w-80 text-gray-700'>Leading Mutual Fund Distribution</h5>
        <p className=''>Milestone Global Moneymart (P) Ltd, established in March 2006 under the name Milestone Portfolio Consultants (P) Ltd, proudly offers a comprehensive suite of saving, investment, and insurance products across various asset classes. We provide income and wealth creation opportunities to our large retail customer base of 5.5K live accounts. Our strengths lie in delivering simple and accessible investment products for the average household. Client satisfaction has always been, and will always be, the driving force behind providing you with the best services we have to offer.</p>
      </article>
    </main>
  )
}

export default AboutUs