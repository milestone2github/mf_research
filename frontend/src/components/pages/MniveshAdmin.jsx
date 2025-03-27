import React from 'react'

function MniveshAdmin() {
  return (
    <section>
      <h1>MniveshAdmin</h1>
      <ul className='flex flex-wrap gap-4'>
        <li ><a className='border px-6 py-8 rounded text-2xl basis-64 grow shrink' href="blogs">Manage Blogs</a></li>
        <li ><a className='border px-6 py-8 rounded text-2xl basis-64 grow shrink' href="fixed-deposits">Manage FD Rates</a></li>
        <li ><a className='border px-6 py-8 rounded text-2xl basis-64 grow shrink' href="ipos">Manage IPOs</a></li>
      </ul>
    </section>
  )
}

export default MniveshAdmin