import React from 'react'
import { IoIosArrowUp } from 'react-icons/io'
import AddButton from './AddButton'

function Tabs({ tabs, onTabChange, activeTab, isCollapsed, toggleCollapsed, isAddVisible, addFormInstance }) {

  return (
    <nav className='flex'>
      <ul className="flex">{
        tabs.map((tab) => (
          <li className="text-sm md:text-base py-1" key={tab.id}>
            <button type='button' disabled={isCollapsed} onClick={() => onTabChange(tab.id)} className={`relative px-1 md:px-3 py-1 border border-b-px z-[3] ${activeTab === tab.id ? 'border-gray-400 border-b-primary-white text-light-blue' : 'border-transparent text-gray-400'}`} >{tab.name}</button>
          </li>

        ))
      }</ul>

      <span className='ms-auto pb-1'>
      {isAddVisible && <AddButton title={'Add transaction'} action={addFormInstance} />}
      </span>

      <button type='button' className={`text-2xl text-light-blue hover:text-dark-blue px-3 transition-transform duration-300 ${isCollapsed && 'rotate-180'}`} onClick={toggleCollapsed}>
        <IoIosArrowUp />
      </button>
    </nav>
  )
}

export default Tabs 