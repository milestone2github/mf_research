import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import {
  FETCH_TYPES_URL,
  FETCH_CATEGORIES_URL,
  CREATE_TYPE_URL,
  CREATE_CATEGORY_URL,
  CREATE_ASSET_URL,
  FETCH_SINGLE_ASSET_URL,
  UPDATE_ASSET_URL
} from '../../utils/urlConstants';

const AddEditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const typesFromState = location.state?.types || [];
  const categoriesFromState = location.state?.categories || [];

  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  const [types, setTypes] = useState(typesFromState);
  const [categories, setCategories] = useState(categoriesFromState);

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);

  const [newTypeName, setNewTypeName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // For Editing the Asset Data
  useEffect(() => {
    // console.log("ASSET ID ==> ", id);
    if (id) {
      axios.get(FETCH_SINGLE_ASSET_URL(id))
        .then(res => {
          const asset = res.data;
          // console.log("FETCHED SINGLE ASSET DATA ====> ", asset);
          setName(asset.data.name || '');
          setSerialNumber(asset.data.serialNumber || '');
          setRemarks(asset.data.remarks || '');
          setSelectedType(asset.data.type || null);
        })
        .catch(err => console.error('Failed to fetch asset:', err));
    }
  }, [id]);

  useEffect(() => {
    if (!types.length) fetchTypes();
    if (!categories.length) fetchCategories();
  }, []);

  const fetchTypes = async () => {
    const res = await axios.get(FETCH_TYPES_URL);
    setTypes(res.data.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get(FETCH_CATEGORIES_URL);
    setCategories(res.data.data);
  };

  const handleAddAsset = async () => {
    if (!name || !serialNumber || !selectedType) return;
    
    const payload = {
      name,
      serialNumber,
      type: selectedType._id,
      remarks
    };

    if (id) {
      await axios.put(UPDATE_ASSET_URL(id), payload, { withCredentials: true });
    } else {
      await axios.post(CREATE_ASSET_URL, payload, { withCredentials: true });
    }
    navigate('/assets');
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const res = await axios.post(CREATE_CATEGORY_URL, { name: newCategoryName });
    setCategories(prev => [...prev, res.data.data]);
    setSelectedCategoryId(res.data.data._id);
    setShowAddCategoryInput(false);
    setNewCategoryName('');
  };

  const handleAddType = async () => {
    if (!newTypeName.trim() || !selectedCategoryId) return;

    try {
      await axios.post(CREATE_TYPE_URL, {
        name: newTypeName,
        category: selectedCategoryId
      });

      const res = await axios.get(FETCH_TYPES_URL);
      setTypes(res.data.data);

      const added = res.data.data.find(t => t.name === newTypeName);
      if (added) setSelectedType(added);

      setShowAddTypeModal(false);
      setNewTypeName('');
      setSelectedCategoryId('');
    } catch (err) {
      console.error('Error creating type:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add / Update Asset</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Name<span className="text-red-500">*</span></label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Serial Number<span className="text-red-500">*</span></label>
        <input
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4 relative">
        <label className="block mb-1 font-medium text-green-600">Type<span className="text-red-500">*</span></label>
        <button
          onClick={() => setTypeDropdownOpen(prev => !prev)}
          className="w-full border px-3 py-2 rounded text-left"
        >
          {selectedType?.name || 'Select Type'}
        </button>
        {typeDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border shadow rounded max-h-60 overflow-y-auto">
            <div
              onClick={() => {
                setShowAddTypeModal(true);
                setTypeDropdownOpen(false);
              }}
              className="px-4 py-2 text-green-600 font-semibold hover:bg-gray-100 cursor-pointer border-b"
            >
              + Add New Type
            </div>
            {types.map((type) => (
              <div
                key={type._id}
                onClick={() => {
                  setSelectedType(type);
                  setTypeDropdownOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {type.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-600">Remarks (optional)</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/assets')}
          className="px-4 py-2 border rounded"
        >
          Close
        </button>
        <button
          onClick={handleAddAsset}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {id ? 'Update' : 'Add'}
        </button>
      </div>

      {showAddTypeModal && (
        <Modal onClose={() => setShowAddTypeModal(false)} title="Add New Type">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Type Name</label>
              <input
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="relative">
              <label className="block mb-1 font-medium">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                {!showAddCategoryInput ? (
                  <button
                    onClick={() => setShowAddCategoryInput(true)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    + Add New Category
                  </button>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="border px-3 py-2 rounded w-full"
                      placeholder="New Category Name"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="bg-green-600 text-white px-3 py-2 rounded"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
              <button
                onClick={handleAddType}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddEditAsset;
