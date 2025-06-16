import React from 'react';
import { MdDelete } from 'react-icons/md';
import { MdEdit } from "react-icons/md";
import { Link } from 'react-router-dom';

function Actions({ deleteHandler, deleteTitle, deleteUrl, editLink, onEdit }) {
  return (
    <div className="flex gap-2 min-w-32 w-full justify-center py-1">
      {/* Delete Button */}
      <button
        onClick={() =>
          deleteHandler({
            show: true,
            deleteTitle,
            deleteUrl,
          })
        }
        className="flex justify-center items-center p-1 border rounded-md hover:bg-red-600 transition w-9 h-9 text-red-500 hover:text-white"
      >
        <MdDelete className='w-5 h-5'/>
      </button>

      {/* Edit Button */}
      {onEdit ? (
        <button
          onClick={onEdit}
          className="flex justify-center items-center border p-1 hover:bg-yellow-600 rounded-md transition w-9 h-9 text-yellow-500 hover:text-white"
        >
          <MdEdit  className='w-5 h-5'/>
        </button>
      ) : (
        <Link
          to={editLink}
          className="flex justify-center items-center border p-1 hover:bg-yellow-600 rounded-md transition w-9 h-9 text-yellow-500 hover:text-white"
        >
          <MdEdit  className='w-5 h-5'/>
        </Link>
      )}
    </div>
  );
}

export default Actions;
