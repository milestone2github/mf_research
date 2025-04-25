import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchModal from '../common/SearchModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { Link } from 'react-router-dom';
import AssetList from './AssetList';
import { ASSET_DELETE_MESSAGE } from '../../utils/stringConstants';
import {
  FETCH_ASSET_BASED_ON_TYPE,
  FETCH_ASSETS_URL,
  FETCH_CATEGORIES_URL,
  FETCH_TYPES_BASED_ON_CAT_URL,
  FETCH_TYPES_URL
} from '../../utils/urlConstants';

function AssetIndex() {
  const [assets, setAssets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [modalData, setModalData] = useState({ show: false, deleteTitle: '', deleteUrl: '' });
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [status, setStatus] = useState(['available', 'allocated', 'repair', 'removed']);

  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    type: '',
    status: ''
  });

  const fetchAssets = async (filters = {}) => {
    try {
      const { type } = filters;
      const url = type ? FETCH_ASSET_BASED_ON_TYPE(type) : FETCH_ASSETS_URL;
      const res = await axios.get(url);
      const data = res.data.data;
      setAssets(data);
      setFiltered(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const res = await axios.get(FETCH_CATEGORIES_URL);
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTypes = async (category = '') => {
    try {
      const url = category ? FETCH_TYPES_BASED_ON_CAT_URL(category) : FETCH_TYPES_URL;
      const res = await axios.get(url);
      setTypes(res.data.data || []);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchTypes();
  }, []);

  useEffect(() => {
    if (selectedFilters.category) {
      fetchTypes(selectedFilters.category);
    }
  }, [selectedFilters.category]);

  const applyFilters = () => {
    let temp = [...assets];
    const { category, type, status } = selectedFilters;

    if (category) temp = temp.filter(a => a.type?.category._id === category);
    if (type) temp = temp.filter(a => a.type?._id === type);
    if (status) temp = temp.filter(a => a.status === status);

    setFiltered(temp);
  };

  const handleFilterChange = async (key, value) => {
    const updated = { ...selectedFilters, [key]: value };
    if (key === 'category') updated.type = '';
  
    setSelectedFilters(updated);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedFilters]);

  const handleSearch = (searchQuery) => {
    if (!searchQuery) return applyFilters();
    const lower = searchQuery.toLowerCase();
    const filteredBySearch = filtered.filter(a =>
      a.name.toLowerCase().includes(lower) ||
      a.serialNumber.toLowerCase().includes(lower)
    );
    setFiltered(filteredBySearch);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(modalData.deleteUrl);
      setModalData({ show: false, deleteTitle: '', deleteUrl: '' });
      fetchAssets({ type: selectedFilters.type });
    } catch (error) {
      console.error('Error removing asset:', error);
    }
  };

  return (
    <div className="p-4">
      <div className='text-4xl font-bold text-white pb-5 text-center'>
        <h2>ASSETS MANAGEMENT</h2>
        <div className="mt-2 mx-auto w-72 border-b-2 border-orange-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <SearchModal onSearch={handleSearch} />

          {/* Category Filter */}
          <select
            className="border px-3 py-2 rounded-md w-36"
            value={selectedFilters.category}
            onChange={e => handleFilterChange('category', e.target.value)}
          >
            <option value="">Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            className="border px-3 py-2 rounded-md w-36"
            value={selectedFilters.type}
            onChange={e => handleFilterChange('type', e.target.value)}
            disabled={!selectedFilters.category}
          >
            <option value="">Type</option>
            {types.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="border px-3 py-2 rounded-md w-36"
            value={selectedFilters.status}
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <option value="">Status</option>
            {status.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Link
          to="/assets/add"
          state={{ types, categories }}
          className="w-full md:w-auto"
        >
          <button className="bg-green-600 text-white px-5 py-2 rounded-md w-full md:w-auto">
            + Add Assets
          </button>
        </Link>
      </div>

      <AssetList 
        assets={filtered} 
        setModalData={setModalData}
        fetchAssets={fetchAssets}
        selectedFilters={selectedFilters}
      />

      {modalData.show && (
        <DeleteConfirmationModal
          modalData={modalData}
          onClose={() => setModalData({ show: false, deleteTitle: '', deleteUrl: '' })}
          onDeleteConfirm={handleDeleteConfirm}
          message={ASSET_DELETE_MESSAGE}
        />
      )}
    </div>
  );
}

export default AssetIndex;
