import React from 'react';
import { IoMdClose } from 'react-icons/io';
import PrimaryButton from './PrimaryButton';

const Modal = ({ isOpen, onClose, title, body, primaryAction, primaryBtnText }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
      <div className='bg-primary-white p-4 px-6 rounded-md'>
        <button
          title='Close'
          onClick={onClose}
          className='absolute top-4 right-4 text-xl text-gray-200 hover:text-primary-white'
        ><IoMdClose /></button>
        <div>
          <div className="title text-left">
            <h4 className='text-3xl leading-tight'>{title}</h4>
          </div>
          <div className="flex flex-col gap-2 my-6">
            {body}
          </div>
          <div className="footer flex justify-end gap-4 mt-8">
            <button className='rounded-md px-5 py-2 border hover:underline' onClick={onClose}>Cancel</button>
            <PrimaryButton text={primaryBtnText} action={primaryAction} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;