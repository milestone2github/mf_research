import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FETCH_CATEGORIES_URL, POST_PERMISSION_URL } from '../../utils/urlConstants';


function AddEditPermission({ editData, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(FETCH_CATEGORIES_URL);
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (editData) {
      setName(editData.name);
      setKey(editData.key);
      setCategory(editData.category?._id || '');
    }
  }, [editData]);

  const handleSubmit = async () => {
    const body = { name, key, category };
    const method = editData ? 'put' : 'post';
    const url = editData ? POST_PERMISSION_URL(editData._id) : POST_PERMISSION_URL('');

    // Hit the PUT/POST API based on input and options
    try {
      await axios({
        method,
        url,
        data: body,
        headers: { 'Content-Type': 'application/json' }
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-slate-700 rounded-md p-6 w-2/3 space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {editData ? 'Edit' : 'Add'} Permission
        </h2>
        <label className="block font-medium">Permission Name</label>
        <input
          className="w-full border rounded text-black p-2"
          placeholder="Permission name"
          value={name}
          onChange={(e) => { const value = e.target.value;
            setName(value);
            // Only auto-generate key if NOT editing existing permission
            if (!editData) {
              const generatedKey = value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s]/g, '')   // Remove non-alphanumeric except space
                .replace(/\s+/g, '_');         // Replace spaces with underscores
              setKey(generatedKey);
            }
          }}/>
        <label className="block font-medium">Permission Key</label>
        <p className="text-sm text-gray-200 my-0 px-0 " style={{ marginTop: '0.2rem' }}>
          Use lowercase letters only. Words must be separated using underscores. E.g. mnivesh_admin</p>
        <input
          className="w-full border p-2 rounded text-black"
          placeholder="Permission key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />

        <label className="block font-medium">Select Category</label>
        <select
          className="w-full border p-2 rounded text-gray-600 hover:text-black"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 hover:text-black"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
          >
            {editData ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddEditPermission;
