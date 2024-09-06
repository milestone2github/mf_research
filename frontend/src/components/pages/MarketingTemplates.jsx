import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import html2canvas from 'html2canvas'
import { FaPhoneAlt } from 'react-icons/fa'
import { HiOutlineAtSymbol } from "react-icons/hi";
import templateImg from '../../assets/template.jpeg'
import appStoreBadge from '../../assets/downloadOnTheAppStore.png'
import playStoreBadge from '../../assets/GetItOnGooglePlay.png'
import mNiveshLogo from '../../assets/mNiveshLogo.png'
import { BsArrowDownCircle, BsPencilSquare } from "react-icons/bs";
import { BiLoaderAlt } from "react-icons/bi";
import { IoMdClose } from 'react-icons/io';
import { updateToast } from '../../reducers/ToastSlice';
import Toast from '../common/Toast'
import { createUser, getUser, updateUser } from '../../Actions/MarketingUserAction';

const defaultUser = {
  company: 'Milestone Global Moneymart Pvt. Lmt.',
  email: 'feedback@niveshonline.com',
  phone: '8269135135'
}

function MarketingTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, status, error, fetchStatus } = useSelector(state => state.marketingUser)
  // const [maktUser, setMktUser] = useState({ 
  //   company: 'Milestone Global Moneymart Pvt. Lmt.', 
  //   email: 'feedback@niveshonline.com', 
  //   phone: '8269135135' 
  // })
  const dispatch = useDispatch()
  const images = [1, 2, 3, 4, 5, 6]

  function convertToImage(imageId) {
    console.log('imageId: ', imageId)
    const content = document.getElementById(`image-${imageId}`);
    const topContainer = document.getElementById(`top-container-${imageId}`)
    const brandContainer = document.getElementById(`brand-container-${imageId}`)
    const emailIcon = document.getElementById(`email-icon-${imageId}`)
    const phoneIocn = document.getElementById(`phone-icon-${imageId}`)

    topContainer.style.paddingTop = '0'
    brandContainer.style.marginTop = '-4px'
    emailIcon.style.top = '4px'
    phoneIocn.style.top = '4px'

    html2canvas(content, { scale: 3.4 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      console.log('canvas created.'); // test
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'output.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('image downloaded.'); // test

      topContainer.style.paddingTop = 'auto'
      brandContainer.style.marginTop = '0'
      emailIcon.style.top = '0'
      phoneIocn.style.top = '0'
    });
  }

  const handleEditMarkting = () => {
    setIsModalOpen(true)
  }

  const handleCancelEdit = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    dispatch(getUser())
  }, [])

  useEffect(() => {
    if (fetchStatus === 404) {
      console.log('404')
      dispatch(createUser(defaultUser))
    }
    else if (fetchStatus !== 404 && error) {
      console.log(error)
      dispatch(updateToast({ type: 'error', message: error }))
    }
  }, [fetchStatus, error])

  if (status === 'pending')
    return (<div className=" h-[80vh] flex justify-center items-center">
      <div className="loader"></div>
    </div>)

  return (
    <main className='relative overflow-x-hidden'>
      <div className='mb-2 flex bg-gray-100 px-2 py-2 rounded-lg'>
        <h3 className='text-3xl font-bold '>Marketing Templates</h3>
        <div className='fixed z-10 bottom-6 right-6 p-3 rounded-lg bg-white shadow-slate-200'>
          <button title='Edit branding'
            onClick={handleEditMarkting}
            className='border text-sm flex items-center rounded-md py-3 px-3 bg-blue-500 hover:bg-blue-600 text-white'>
            <BsPencilSquare />
          </button>

        </div>
      </div>
      <section className='flex flex-wrap gap-6 sm:gap-8 justify-center mt-4'>{
        images.map(image => (
          <div key={image} className='relative group w-[316px] sm:w-[395px] overflow-hidden shadow'>
            <figure id={`image-${image}`}>
              <img src={templateImg} className='w-[316px] sm:w-[395px]' alt="" />
              <div id={`top-container-${image}`} style={{ padding: '2px', backgroundColor: 'white' }}>
                <p style={{ marginBottom: '1px' }} className='text-[6px] sm:text-[7.5px] '>Disclaimer: Mutual Fund investments are subject to market risk, read all scheme related documents carefully.</p>
                <p style={{ fontWeight: '600', marginBottom: '4px' }} className='text-[6px] sm:text-[7.5px] '>Distributed by AMFI registered Mutual Fund Distributor</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>
                      <img src={mNiveshLogo} className='w-[80px] sm:w-[98px]' alt="mNivesh" />
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <img src={playStoreBadge} className='39px sm:w-[48px]' alt="Get it on Google Play" />
                      <img src={appStoreBadge} className='39px sm:w-[48px]' alt="Download on the App Store" />
                    </div>
                  </div>
                  <div id={`brand-container-${image}`} className='relative flex flex-col justify-start'>
                    <div style={{ fontWeight: 'bold' }} className='text-[6px] sm:text-[7px] '>{user.company}</div>
                    <div className='flex text-[6px] sm:text-[7px] items-center gap-px absolute top-[10px]'><span id={`email-icon-${image}`} className='relative'><HiOutlineAtSymbol /></span><span>: {user.email}</span></div>
                    <div className='flex text-[6px] sm:text-[7px] items-center gap-px absolute top-5'><span id={`phone-icon-${image}`} className='relative'><FaPhoneAlt /></span><span>: +91 {user.phone}</span></div>
                  </div>
                </div>
              </div>

              <div className='absolute left-0 -bottom-full w-full h-full transition-all duration-300 bg-black/20 flex items-start justify-center group-hover:bottom-0'>
              </div>
              <div className='absolute flex items-center justify-center w-full py-6 px-16 transition-all duration-200 delay-75 -top-full group-hover:top-0  bg-indigo-950'>
                <button
                  onClick={() => convertToImage(image)}
                  className='border text-sm flex items-center gap-1 py-2 px-8 bg-[#307473] hover:bg-[#2A6564] text-white'
                ><BsArrowDownCircle />
                  <span>Download</span>
                </button>

              </div>

            </figure>
          </div>))}
      </section>
      {/* <section className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-8 mt-4'>{
        images.map(image => (
          <div key={image} className='relative group w-[316px] overflow-hidden shadow'>
            <figure id={`image-${image}`}>
              <img src={templateImg} className='w-[316px]' alt="" />
              <div id={`top-container-${image}`} style={{ padding: '2px', backgroundColor: 'white' }}>
                <p style={{ fontSize: '6px', marginBottom: '1px' }}>Disclaimer: Mutual Fund investments are subject to market risk, read all scheme related documents carefully.</p>
                <p style={{ fontSize: '6px', fontWeight: '600', marginBottom: '4px' }}>Distributed by AMFI registered Mutual Fund Distributor</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>
                      <img src={mNiveshLogo} style={{ width: '80px' }} alt="mNivesh" />
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <img src={playStoreBadge} style={{ width: '39px' }} alt="Get it on Google Play" />
                      <img src={appStoreBadge} style={{ width: '39px' }} alt="Download on the App Store" />
                    </div>
                  </div>
                  <div id={`brand-container-${image}`} className='relative flex flex-col justify-start'>
                    <div style={{ fontSize: '6px', fontWeight: 'bold' }}>Milestone Global Moneymart Pvt. Lmt.</div>
                    <div className='flex text-[6px] items-center gap-px absolute top-[10px]'><span id={`email-icon-${image}`} className='relative'><HiOutlineAtSymbol /></span><span>: feedback@niveshonline.com</span></div>
                    <div className='flex text-[6px] items-center gap-px absolute top-5'><span id={`phone-icon-${image}`} className='relative'><FaPhoneAlt /></span><span>: +91 8269135135</span></div>
                  </div>
                </div>
              </div>

              <div className='absolute left-0 -top-full w-full h-full transition-all duration-300 bg-black/20 flex items-start justify-center group-hover:top-0'>
                <div className='relative flex items-center justify-center w-full py-6 px-16 transition-all duration-200 delay-75 -top-full group-hover:top-0  bg-indigo-950'>
                  <button
                    onClick={() => convertToImage(image)}
                    className='border text-sm flex items-center gap-1 py-2 px-8 bg-[#307473] hover:bg-[#2A6564] text-white'
                  ><BsArrowDownCircle />
                    <span>Download</span>
                  </button>

                </div>

              </div>
            </figure>
          </div>))}
      </section> */}

      <UserForm isModalOpen={isModalOpen} handleClose={handleCancelEdit} />
      <Toast />
    </main>
  )
}

export default MarketingTemplates

const UserForm = ({ isModalOpen, handleClose }) => {
  const { user, updateStatus, error } = useSelector(state => state.marketingUser)
  const [marketingUser, setMarketingUser] = useState({
    company: 'Milestone Global Moneymart Pvt. Lmt.',
    email: 'feedback@niveshonline.com',
    phone: '8269135135'
  })
  const dispatch = useDispatch()

  useEffect(() => {
    setMarketingUser(user)
  }, [user])

  useEffect(() => {
    if (updateStatus === 'completed') {
      handleClose()
    }
  }, [updateStatus])

  const handleBrandingChange = (e) => {
    const { name, value } = e.target
    setMarketingUser(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    dispatch(updateUser(marketingUser))
  }

  const handleCancel = (e) => {
    handleClose()
    setMarketingUser(user)
  }

  return (
    <section className={`fixed z-[1000] top-0 bottom-0 bg-slate-100 p-3 md:p-6 ${isModalOpen ? 'right-0' : '-right-full'} w-full h-screen md:w-[460px] transition-all border`}>
      <button
        onClick={handleCancel}
        className="absolute right-full rounded-md bg-gray-200 top-0 p-2 text-gray-700 text-xl hover:text-gray-900 z-10"
      >
        <IoMdClose />
      </button>
      <form onSubmit={handleUpdate} className='flex flex-col gap-y-6 h-full justify-center'>
        <p className='text-gray-800 text-2xl font-bold'>Edit branding details</p>
        <div className='flex flex-col gap-y-4'>
          <div className="flex flex-col gap-y-px">
            <label htmlFor="company" className='text-sm text-gray-600'>Company</label>
            <input
              type="text"
              name="company"
              id="company"
              required
              autoComplete='off'
              className='rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-blue-500'
              value={marketingUser.company}
              onChange={handleBrandingChange}
            />
          </div>
          <div className="flex flex-col gap-y-px">
            <label htmlFor="email" className='text-sm text-gray-600'>Email</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete='off'
              className='rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-blue-500'
              value={marketingUser.email}
              onChange={handleBrandingChange}
            />
          </div>
          <div className="flex flex-col gap-y-px">
            <label htmlFor="phone" className='text-sm text-gray-600'>Phone</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              autoComplete='off'
              className='rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-blue-500'
              value={marketingUser.phone}
              onChange={handleBrandingChange}
            />
          </div>
        </div>
        <div className='flex gap-x-3 mt-2 justify-end'>
          <button onClick={handleCancel} type='button' className='border rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
          <button type='submit' disabled={updateStatus === 'pending'} className='border w-28 flex items-center justify-center rounded-lg py-2 px-6 bg-blue-500 enabled:hover:bg-blue-600 disabled:bg-blue-400 text-white'>
            {updateStatus === 'pending' ? <BiLoaderAlt className='animate-spin text-xl' /> : 'Update'}
          </button>
        </div>
      </form>
    </section>
  )
}
