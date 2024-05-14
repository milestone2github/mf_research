import React, { useState } from 'react'
import { SiZoho } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import mNiveshlogo from '../../assets/mNiveshLogo.png'
import { loginwithgoogle } from '../../firebase/googleauthenticate';
import { useNavigate } from 'react-router-dom';
import { setLoggedIn, setUser } from '../../Reducers/UserSlice';
import { useDispatch } from 'react-redux';

const Loginpage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogin = async () => {
    window.location.href = `http://localhost:5000/auth/zoho`
  }
  const googlelogin = async () => {
    try {
      const data = await loginwithgoogle()
      const response = await fetch("http://localhost:5000/checkuser", {
        method: "POST",
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
        dispatch(setLoggedIn(res.success))
        dispatch(setUser(res.user));
        navigate("/")
      }
      else {
        window.alert(res.msg)
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className='bg-primary-white gap-y-4 h-full flex flex-col items-center justify-center'>
      <h1 className='text-5xl bg-dark-blue text-primary-white w-full text-center py-2'>Welcome to mNivesh</h1>
      <img src={mNiveshlogo} alt="" width={280} className='mt-6' />
      <button
        className='mt-20 px-3 py-0 text-dark-blue border-dark-blue hover:shadow-md hover:shadow-blue-200 gap-x-3 rounded-md border flex items-center'
        onClick={handleLogin}
      >
        <span className='text-5xl'><SiZoho /></span>
        <span>Login with Zoho</span>
      </button>
      <button
        className='mt-2 px-5 py-1 text-dark-blue border-dark-blue hover:shadow-md hover:shadow-blue-200 gap-x-3 rounded-md border flex items-center'
        onClick={googlelogin}
      >
        <span className='text-4xl'><FcGoogle className='' /></span>
        <span>Login with Google</span>
      </button>
    </div>
  )
}

export default Loginpage