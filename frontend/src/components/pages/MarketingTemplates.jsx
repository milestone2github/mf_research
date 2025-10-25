import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import html2canvas from 'html2canvas'
import { BsArrowDownCircle, BsPencilSquare } from "react-icons/bs";
import { BiLoaderAlt } from "react-icons/bi";
import { IoMdClose } from 'react-icons/io';
import { updateToast } from '../../reducers/ToastSlice';
import Toast from '../common/Toast'
import { createUser, getUser, updateUser } from '../../Actions/MarketingUserAction';
import axios from 'axios';


function MarketingTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasCreatedMarketingUser, setHasCreatedMarketingUser] = useState(false);
  const { userData } = useSelector((state) => state.user)
  const { user, status, error, fetchStatus } = useSelector(state => state.marketingUser)
  

  const dispatch = useDispatch()
  const [templates, setTemplates] = useState([]);

  function convertToImage(templateId) {
    // console.log('imageId: ', imageId)
    const content = document.getElementById(`image-${templateId}`);
    const topContainer = document.getElementById(`top-container-${templateId}`)
    const brandContainer = document.getElementById(`brand-container-${templateId}`)
   // safeguard in case elements are missing
    if (!content || !topContainer || !brandContainer) return;

    // adjust layout before capture
    topContainer.style.paddingTop = '0'
    brandContainer.style.marginTop = '-4px'

    html2canvas(content, {
      scale: window.devicePixelRatio * 2, useCORS: true,
      allowTaint: true,
      logging: true,
      letterRendering: true,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      // console.log('canvas created.'); // test
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'output.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // console.log('image downloaded.'); // test
      // revert layout after capture
      topContainer.style.paddingTop = 'auto'
      brandContainer.style.marginTop = '0'
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
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/marketing-template/`);
        if (res.data.success) {
          setTemplates(res.data.data); // store templates from backend
        } else {
          console.error('Failed to fetch templates:', res.data.message);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      }
    };

    fetchTemplates();
  }, []);



  useEffect(() => {
    if (fetchStatus === 404 && !hasCreatedMarketingUser) {
      const marketingUserPayload = {
        name: userData.name,
        email: userData.email,
        phone: user?.phone || userData?.phone || user?.user?.onboarding?.hrFilledInfo?.phone || ''
      };
      dispatch(createUser(marketingUserPayload))
      setHasCreatedMarketingUser(true)
    }
    else if (fetchStatus !== 404 && error) {
      console.error(error)
      dispatch(updateToast({ type: 'error', message: error }))
    }
  }, [fetchStatus, error, hasCreatedMarketingUser])

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
        templates.map((tpl) => (
          <div key={tpl._doc._id } className='relative group w-[316px] sm:w-[395px] overflow-hidden shadow'>
            <figure id={`image-${tpl._doc._id }`}>
              <img
                src={tpl.proxyImageUrl}
                className='w-[316px] sm:w-[395px]' alt={tpl._doc.title }
              />
      
              {/* footer  */}

              <div
                id={`top-container-${tpl._doc._id}`}
                className="relative w-full text-white"
              >
                <img
                  src={require('../../assets/FooterMarketingTemplate.png')}
                  alt="footer"
                  style={{
                    width: '100%',
                    height: '72px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Overlay text */}
                <div
                  id={`brand-container-${tpl._doc._id}`}
                  className="absolute left-[56%] top-[40%] flex flex-col text-[6px] sm:text-[7px] font-bold leading-tight text-gray-600"
                >

                  <div className="flex items-center mt-[.5px]">{user?.name}</div>
                  <div className="flex items-center mt-[5px]">{user?.email}</div>
                  <div className="flex items-center mt-[5px]">+91 {user?.phone}</div>

                </div>
              </div>

              {/* Download button */}
              <div className='absolute left-0 -bottom-full w-full h-full transition-all duration-300 bg-black/20 flex items-start justify-center group-hover:bottom-0'>
              </div>
              <div className='absolute flex items-center justify-center w-full py-6 px-16 transition-all duration-200 delay-75 -top-full group-hover:top-0  bg-indigo-950'>
                <button
                  onClick={() => {
                    convertToImage(tpl._doc._id)}}
                  className='border text-sm flex items-center gap-1 py-2 px-8 bg-[#307473] hover:bg-[#2A6564] text-white'
                ><BsArrowDownCircle />
                  <span>Download</span>
                </button>

              </div>

            </figure>
          </div>))}
      </section>

      <UserForm isModalOpen={isModalOpen} handleClose={handleCancelEdit} />
      <Toast />
    </main>
  )
}

export default MarketingTemplates

const UserForm = ({ isModalOpen, handleClose }) => {
  const { user, updateStatus, error } = useSelector(state => state.marketingUser)
  const { userData } = useSelector((state) => state.user)

  const [marketingUser, setMarketingUser] = useState({
    _id: user?._id,
    name: user?.name || userData?.name || '',
    email: user?.email || userData?.email || '',
    phone: user?.user?.onboarding?.hrFilledInfo?.phone || user?.phone || ''
  })

  const dispatch = useDispatch()

  useEffect(() => {
    // When marketingUser changes in store, sync local form
    setMarketingUser({
      _id: user?._id,
      name: user?.name || userData?.name || '',
      email: user?.email || userData?.email || '',
      phone: user?.phone || userData?.phone || user?.user?.onboarding?.hrFilledInfo?.phone || ''
    })
  }, [user, userData])


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
     setMarketingUser({
      _id: user?._id,
      name: user?.name || userData?.name || '',
      email: user?.email || userData?.email || '',
      phone: user?.user?.onboarding?.hrFilledInfo?.phone || user?.phone || marketingUser.phone || ''
    })
    handleClose()
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
            <label htmlFor="name" className='text-sm text-gray-600'>Name</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              autoComplete='off'
              className='rounded-md p-2 w-full border border-gray-500 focus:outline-2 focus:outline-blue-500'
              value={marketingUser.name}
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
              value={marketingUser?.email}
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
              placeholder='Enter your Phone Number'
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
