import React, { useEffect, useState } from 'react';
import { FETCH_ALL_USERS_URL } from '../../utils/urlConstants';
import axios from 'axios';

const AllocateAssetModal = ({ show, onClose, asset, onAllocate }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (show) {
      axios.get(FETCH_ALL_USERS_URL)
        .then(res => setUsers(res.data))
        .catch(err => console.error('Failed to fetch users', err));
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-5 rounded w-[400px]">
        <h2 className="text-lg font-semibold mb-3">Allocate Asset</h2>

        <div className="mb-2">
          <strong>Name:</strong> {asset.name}
        </div>
        <div className="mb-2">
          <strong>Type:</strong> {asset.type?.name}
        </div>
        <div className="mb-2">
          <strong>Category:</strong> {asset.category?.name}
        </div>

        <label className="block mb-2">
          <span className="block text-sm font-medium">Select User</span>
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select User --</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.email}</option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium">Remarks</span>
          <input
            type="text"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 rounded bg-gray-300">Cancel</button>
          <button
            onClick={() => onAllocate(selectedUser, remarks)}
            className="px-4 py-1 rounded bg-green-500 text-white"
            disabled={!selectedUser}
          >
            Allocate
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocateAssetModal;
