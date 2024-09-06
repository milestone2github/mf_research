import React, { useState } from 'react';
import { FaPhoneAlt } from 'react-icons/fa';
import { HiOutlineAtSymbol } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import templateImg from '../../assets/template.jpeg'
import appStoreBadge from '../../assets/downloadOnTheAppStore.png'
import playStoreBadge from '../../assets/GetItOnGooglePlay.png'
import mNiveshLogo from '../../assets/mNiveshLogo.png'

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl hover:text-gray-200 z-10"
        >
          <IoMdClose />
        </button>
      <div className="relative w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        
        <div className="flex flex-col items-center p-4 overflow-y-auto max-h-screen">
          {/* Image and Content Section */}
          <figure id={`image-1`} className='w-full cursor-pointer text-center'>
            <img src={templateImg} className='w-full' alt="Modal Content" />
            <div className='p-2 bg-white text-center'>
              <p className='text-xs md:text-sm'>Disclaimer: Mutual Fund investments are subject to market risk, read all scheme related documents carefully.</p>
              <p className='text-xs md:text-sm font-medium'>Distributed by AMFI registered Mutual Fund Distributor</p>
              <div className='flex flex-col items-center mt-2'>
                <img src={mNiveshLogo} className='w-[82px] md:w-[100px] mb-2' alt="mNivesh" />
                <div className='flex gap-2'>
                  <img src={playStoreBadge} className='w-[39px] md:w-[48px]' alt="Get it on Google Play" />
                  <img src={appStoreBadge} className='w-[39px] md:w-[48px]' alt="Download on the App Store" />
                </div>
              </div>
              <div className='mt-2 text-xs md:text-sm'>
                <p className="font-bold">Milestone Global Moneymart Pvt. Lmt.</p>
                <p><HiOutlineAtSymbol className="inline" />: feedback@niveshonline.com</p>
                <p><FaPhoneAlt className="inline" />: +91 8269135135</p>
              </div>
            </div>
          </figure>
          <div className='flex gap-x-3 mt-7 justify-end w-full'>
            <button onClick={onClose} type='button' className='border rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
            <button type='submit' className='border rounded-lg py-2 px-6 bg-green-800 hover:bg-green-900 text-white'>Generate</button>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className='fixed inset-0 z-50 w-screen h-screen bg-black/70 flex items-center justify-center'>
      <div className={`w-fit h-fit bg-white rounded-md shadow-md p-6 py-7 md:w-[80vw] flex flex-col gap-y-4`}>
        <p className="text-green-800 text-lg font-medium mb-1">Download this image</p>
        <figure id={`image-1`}  className='w-[70%] cursor-pointer'>
              <img src={templateImg} className='w-[70%]' alt="" sizes='(max-width: 424px) 308px, 420px' />
              <div className='p-1 bg-white'>
                <p className='text-[5px] md:text-[6px]'>Disclaimer: Mutual Fund investments are subject to market risk, read all scheme related documents carefully.</p>
                <p className='text-[5px] md:text-[6px] font-medium'>Distributed by AMFI registered Mutual Fund Distributor</p>
                <div className='flex gap-4 mt-1 justify-center'>
                  <div className='flex flex-col gap-1'>
                    <div>
                      <img src={mNiveshLogo} className='w-[82px] md:w-[100px]' alt="mNivesh" />
                    </div>
                    <div className='flex gap-1'>
                      <img src={playStoreBadge} className='w-[39px] md:w-[48px]' alt="Get it on Google Play" />
                      <img src={appStoreBadge} className='w-[39px] md:w-[48px]' alt="Download on the App Store" />
                    </div>
                  </div>
                  <div className=''>
                    <p className='text-[6px] md:text-[8px] font-bold'>Milestone Global Moneymart Pvt. Lmt.</p>
                    <p className='text-[6px] md:text-[8px]'><HiOutlineAtSymbol className='inline' />: feedback@niveshonline.com</p>
                    <p className='text-[6px] md:text-[8px]'><FaPhoneAlt className='inline' />: +91 8269135135</p>
                  </div>
                </div>
              </div>
            </figure>
        <div className='flex gap-x-3 mt-7 justify-end'>
          <button onClick={onClose} type='button' className='border rounded-lg py-2 px-6 text-gray-800 hover:bg-gray-200'>Cancel</button>
          <button type='submit' className='border rounded-lg py-2 px-6 bg-green-800 hover:bg-green-900 text-white'>Generate</button>
        </div>
      </div>
    </div>
  )
};

export default ImageModal

