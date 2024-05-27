import React from 'react'
import { Link } from 'react-router-dom'
import accessDeniedSvg from '../../assets/accessDenied.svg'

function AccessDenied() {
  return (
    <section className="flex gap-8 items-center justify-center h-full px-4">
      <article className='flex flex-col justify-center gap-3 w-full px-8 py-2 md:ps-16 md:w-1/2 md:justify-start'>
        <h3 className='text-8xl text-gray-800 font-bold'>4o3</h3>
        <p className='m-0 text-xl text-gray-400'>Access forbidden</p>
        <p className='m-0 text-base text-gray-400'>You've tried access a page you did not have prior authorization for.</p>
        <Link to={'/'} className='rounded-full mt-1 w-max bg-[#2D3748] text-slate-100 py-2 px-6 no-underline'>
          Go to Homepage
        </Link>
      </article>
      <figure className='w-1/2 px-8 py-2 hidden md:flex'>
        <img src={accessDeniedSvg} alt="" loading='lazy' className='w-80' />
      </figure>
    </section>
  )
}

export default AccessDenied