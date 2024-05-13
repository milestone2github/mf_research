import React from 'react'
import { SiZoho } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import mNiveshlogo from '../../assets/mNiveshLogo.png'

const Loginpage = () => {
    const handleLogin = async () => {
        window.location.href = `http://localhost:5000/auth/zoho`
      }
  return (
    <div className='bg-primary-white gap-y-4 h-full flex flex-col items-center justify-center'>
      <h1 className='text-5xl bg-dark-blue text-primary-white w-full text-center py-2'>Welcome to mNivesh</h1>
      <img src={mNiveshlogo} alt="" width={280} className='mt-6'/>
      <button 
        className='mt-20 px-3 py-0 text-dark-blue border-dark-blue hover:shadow-md hover:shadow-blue-200 gap-x-3 rounded-md border flex items-center'
        onClick={handleLogin}
        >
        <span className='text-5xl'><SiZoho /></span> 
        <span>Login with Zoho</span>
      </button>
      
    </div>
  )
}

export default Loginpage