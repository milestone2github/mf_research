import React, { useEffect, useState } from 'react'
import { SiZoho } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import mNiveshlogo from '../../assets/mNiveshLogo.png'
import { loginwithgoogle } from '../../firebase/googleauthenticate';
import { Link, useNavigate } from 'react-router-dom';
import illustration from '../../assets/illustration.png'
import Toast from '../common/Toast';
import { useDispatch } from 'react-redux';
import { updateToast } from '../../reducers/ToastSlice';

const Loginpage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  useEffect(() => {
    let query = window.location.search;
    // Create a test URLSearchParams object
    const searchParams = new URLSearchParams(query);

    // set error to the state
    if(searchParams.get('error'))
      dispatch(updateToast({type: 'error', message: 'Permission Denied'}))
}, [])

  const handleLogin = async () => {
    const frontendRedirectUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/zoho?redirect=${frontendRedirectUrl}`
  }

  const googlelogin = async () => {
    try {
      const data = await loginwithgoogle()
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/google/verify`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          fullname: data.user.displayName,
          email: data.user.email
        })
      })
      const res = await response.json()
      if (res.success) {
        navigate("/", { replace: true })
      }
      else {
        dispatch(updateToast({message: res.msg, type: 'error'}))
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className='bg-primary-white gap-y-8 h-full flex flex-col items-center p-0'>
      <header className='w-full'>
        <nav className='w-full flex'>
          <Link to='/' className='logo ms-auto'>
            <img src={mNiveshlogo} loading='lazy' alt="Niveshonline link Logo" style={{ height: '32px' }} />
          </Link>
        </nav>
      </header>
      <Toast />

      <div className='flex items-center justify-center rounded-md shadow-lg'>
        <section className='w-full flex flex-col items-center h-full px-6 py-6'>
          <h1 className='text-dark-blue text-4xl m-0 my-2'>Welcome to mNivesh</h1>
          <p className='text-base text-gray-500'>Login to continue</p>
          
          <button
            className='mt-12 px-5 py-0 text-dark-blue border-dark-blue hover:shadow-md hover:shadow-blue-200 gap-x-3 rounded-md border flex items-center'
            onClick={handleLogin}
          >
            <span className='text-5xl'><SiZoho /></span>
            <span>Login with Zoho</span>
          </button>
          <button
            className='mt-4 px-5 py-1 text-dark-blue border-dark-blue hover:shadow-md hover:shadow-blue-200 gap-x-3 rounded-md border flex items-center'
            onClick={googlelogin}
          >
            <span className='text-4xl'><FcGoogle className='' /></span>
            <span>Login with Google</span>
          </button>
        </section>

        <section className='hidden w-full md:flex items-center justify-center bg-dark-blue rounded-e-md'>
          <div className=''>
            <img src={illustration} alt="" className='' width='380px'/>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Loginpage