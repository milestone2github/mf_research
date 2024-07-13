import React from 'react'
import { BiSupport } from 'react-icons/bi'
import { BsApp, BsArrowRight, BsInfoSquare, BsLink } from 'react-icons/bs'
import { MdPermPhoneMsg } from 'react-icons/md'
import { Link } from 'react-router-dom'

const links = [
  {
    header: 'About Us',
    desc: 'Learn more about Milestone Global Moneymart Pvt Ltd.',
    href: 'about_us',
    icon: <BsInfoSquare />
  },
  {
    header: 'Basic Link',
    desc: 'Explore our basic financial resources.',
    href: 'basic_link',
    icon: <BsLink />
  },
  {
    header: 'App Link',
    desc: 'Download the mNivesh App.',
    href: 'app_link',
    icon: <BsApp />
  },
  {
    header: 'Contact Us',
    desc: 'Get in touch with us.',
    href: 'contact_us',
    icon: <MdPermPhoneMsg />
  },
  {
    header: 'Customer Support',
    desc: 'Get your problem resolved here.',
    href: "customer_support",
    icon: <BiSupport />
  },
]

function AllLinks() {
  return (
      <main>
        <div className='mb-2 bg-gray-100 px-2 py-2 rounded-lg'>
          <h3 className='text-3xl font-bold '>Internal Links </h3>
        </div>
        <div className="flex gap-2 justify-around flex-wrap my-6">{
          links.map(linkItem => (
            <Link className="group relative basis-60 bg-white p-5 rounded-lg shadow-md text-center cursor-pointer flex-1 no-underline hover:ring-2 hover:ring-blue-500 hover:bg-blue-50" to={linkItem.href}>
              <span className='text-lg group-hover:text-blue-500'>{linkItem.icon}</span>
              <h2 className="text-3xl font-medium my-2 mt-4 text-gray-800">{linkItem.header}</h2>
              <p className='text-gray-700 mb-3'>{linkItem.desc}</p>
              <span className='absolute bottom-4 right-4'>
                <BsArrowRight className='ms-auto text-blue-600 text-lg mt-4 invisible group-hover:visible' />
              </span>
            </Link>
          ))}

        </div>
      </main>
  )
}

export default AllLinks