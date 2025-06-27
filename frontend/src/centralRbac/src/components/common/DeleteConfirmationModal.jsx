import React from 'react';

function DeleteConfirmationModal({ modalData, onClose, onDeleteConfirm, message }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-700 rounded-md p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-white">Confirm Delete</h2>
        <p>
          Are you sure you want to delete <strong>{modalData.deleteTitle}</strong>?<br />
          {message}
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-200 hover:text-black"
          >
            Cancel
          </button>
          <button 
            onClick={onDeleteConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
