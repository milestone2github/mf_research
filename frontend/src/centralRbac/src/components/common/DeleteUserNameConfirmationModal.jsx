import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

function DeleteUserNameConfirmationModal({ userName, onCancel, onConfirm }) {
  const [inputValue, setInputValue] = useState('');

  const normalized = (str) => str.toLowerCase().replace(/\s+/g, '').trim();

  const isMatch = normalized(inputValue) === normalized(userName);

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full sm:align-middle">
          <div className="bg-gray-900 px-6 pt-6 pb-4">
            <span className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-white">Confirm Delete</h2>
              <FaTrash />
            </span>
            <p className="mt-4 text-gray-200">
              To confirm deletion of&nbsp;&nbsp; <strong className="text-white italic">" {userName} "</strong>&nbsp;,&nbsp;please type the name below:
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPaste={(e) => e.preventDefault()} // 🚫 Disallow paste
              placeholder="Type name to confirm"
              className="w-full mt-3 p-2 border border-gray-600 rounded bg-gray-800 text-white"
            />
            <p className="text-xs text-gray-400 mt-1 italic">
              Paste 🚫 Not allowed . Please type the name manually.
            </p>
          </div>
          <div className="bg-gray-900 px-6 py-4 flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-200 hover:text-black"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              disabled={!isMatch}
              className={`px-4 py-2 text-white rounded ${
                isMatch ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 cursor-not-allowed'
              }`}
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserNameConfirmationModal;
