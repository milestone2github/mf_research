import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const AdminIndex = () => {
  return (
    <section>
      <h1>Niveshonline Admin Panel</h1>
      <ul className='flex flex-wrap gap-4'>
        <Link to="blogs" className="border px-6 py-8 rounded text-2xl basis-64 grow shrink">
          Manage Blogs
        </Link>
        <Link to="fixed-deposits" className="border px-6 py-8 rounded text-2xl basis-64 grow shrink">
        Manage FD Rates
        </Link>
        <Link to="ipos" className="border px-6 py-8 rounded text-2xl basis-64 grow shrink">
          Manage IPOs
        </Link>
        <Outlet />
      </ul>
    </section>
  )
}

export default AdminIndex