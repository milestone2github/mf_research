import React, { useEffect, useRef, useState } from 'react'
import OTPInput from '../common/OTPInput'
import { useSelector } from 'react-redux'

function Mint() {
  const [ipStatus, setIpStatus] = useState('idle')
  const [ipData, setIpData] = useState({ ip: '', allowed: false })
  const [otp, setOtp] = useState('')
  const [otpStatus, setOtpStatus] = useState('idle')
  const [otpError, setOtpError] = useState(null)

  const getIpAddress = async () => {
    setIpStatus('pending')
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/mint/ip`, {
        credentials: 'include'
      })

      const jsonResponse = await response.json()

      if (!response.ok) {
        throw new Error(jsonResponse.error || response.statusText)
      }
      setIpData(jsonResponse.data)
      setIpStatus('completed')
    } catch (error) {
      console.log('Unable to get IP', error.message)
      setIpStatus('failed')
    }
  }

  const getMintAccess = async ({ ip, otp }) => {
    setOtpStatus('pending');

    const data = {};
    if (ip) { data.ip = ip; }
    if (otp) { data.otp = otp; }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/mint/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        // Try to parse the error response
        const errorData = await response.json().catch(() => {
          return { message: 'An unknown error occurred' };
        });

        throw new Error(errorData.error || response.statusText);
      }

      const jsonResponse = await response.json();

      setOtpStatus('completed');

      if (jsonResponse?.data?.url) {
        window.open(jsonResponse.data.url, '_blank');
      }
    } catch (error) {
      console.log('error verifying otp', error.message);
      setOtpError(error.message || 'An error occurred while verifying OTP');
      setOtpStatus('failed');
    }
  };

  useEffect(() => {
    getIpAddress()
  }, [])

  useEffect(() => {
    if (ipData.allowed) {
      setIpStatus('pending')
      getMintAccess({ ip: ipData.ip }).then(() => setIpStatus('completed'))
    }
  }, [ipData])

  const handleSubmit = (e) => {
    e.preventDefault();
    getMintAccess({ otp: otp })
  }

  const loader = (<div className='loader'></div>)
  const redirectMsg = (<div className='flex flex-col items-center gap-1'>
    <h4 className='text-3xl text-gray-700 font-bold' >You have been redirected to the MINT app</h4>
    <p className='text-sx text-center text-gray-500 max-w-[436px]'>If the app did not open, please check if your browser's pop-up blocker is enabled and allow pop-ups for this site.</p>
  </div>)

  return (
    <main className='flex items-center justify-center h-full'>
      {ipStatus === 'pending' || ipData.allowed && ipStatus === 'pending' ? loader :
        ipData.allowed && ipStatus === 'completed' || otpStatus === 'completed' ?
          redirectMsg :
          <form onSubmit={handleSubmit} className='bg-gray-900 shadow-md shadow-gray-600 rounded-xl w-fit flex flex-col gap-2 p-3 md:p-6'>
            <label htmlFor="opt" className='text-gray-200 mb-2'>Enter 6-digit OTP</label>
            <OTPInput length={6} onChangeOTP={(value) => setOtp(value)} />

            {otpError && <p className='text-red-500 text-sm'>{otpError}</p>}
            <button
              disabled={otp.length < 6 || otpStatus === 'pending'}
              className='mt-6 rounded-full w-full text-gray-100 bg-indigo-800 py-2 text-center border border-transparent enabled:hover:border-indigo-500 disabled:bg-indigo-950'
            >{otpStatus === 'pending' ? 'Submitting...' : 'Submit'}
            </button>
          </form>}
    </main>
  )
}

export default Mint