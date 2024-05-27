import React, { useEffect, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaCircleInfo } from "react-icons/fa6";

function Alert({ alertState, updateAlert }) {
  const { isOn, type, header, message } = alertState;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOn) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isOn]);

  const colorStyle = {
    text: type === 'error' ? 'text-red-800' : type === 'success' ? 'text-green-800' : 'text-blue-800',
    border: type === 'error' ? 'border-red-300' : type === 'success' ? 'border-green-300' : 'border-blue-300',
    bg: type === 'error' ? 'bg-red-50' : type === 'success' ? 'bg-green-50' : 'bg-blue-50',
    hover: type === 'error' ? 'hover:bg-red-200' : type === 'success' ? 'hover:bg-green-200' : 'hover:bg-blue-200',
  };

  const dismissAlert = () => {
    setVisible(false);
    setTimeout(() => {
      updateAlert({
        isOn: false,
        type: '',
        header: '',
        message: ''
      });
    }, 300);
  };

  useEffect(() => {
    if (isOn && type === 'success') {
      const timer = setTimeout(dismissAlert, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOn, type]);

  if (!visible && !isOn) return null;

  return (
    <div
      id="alert-1"
      className={`absolute top-12 shadow-md left-1/2 -translate-x-1/2 z-[1001] flex items-center p-4 mb-4 ${colorStyle.text} rounded-lg border ${colorStyle.border} ${colorStyle.bg} transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
    >
      <FaCircleInfo />
      <span className="sr-only">Info</span>
      <div className="ms-3 text-sm font-medium">
        {header && <strong className="">{header} :</strong>} {message}.
      </div>
      <button
        type="button"
        onClick={dismissAlert}
        className={`ms-auto text-xl -mx-1.5 -my-1.5 ${colorStyle.bg} ${colorStyle.text} rounded-lg focus:ring-2 p-1.5 ${colorStyle.hover} inline-flex items-center justify-center h-8 w-8`}
        data-dismiss-target="#alert-1"
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <IoMdClose />
      </button>
    </div>
  );
}

export default Alert;
