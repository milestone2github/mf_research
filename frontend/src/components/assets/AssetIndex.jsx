import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchModal from '../common/SearchModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { Link, useNavigate } from 'react-router-dom';
import AssetList from './AssetList';
import { ASSET_DELETE_MESSAGE } from '../../utils/stringConstants';
import {
  FETCH_ASSETS_URL,
  FETCH_CATEGORIES_URL,
  FETCH_TYPES_BASED_ON_CAT_URL,
  FETCH_TYPES_URL
} from '../../utils/urlConstants';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function AssetIndex() {
  const [assets, setAssets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({ show: false, deleteTitle: '', deleteUrl: '' });
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const status = ['available', 'allocated', 'repair', 'removed'];
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 12;


  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    type: '',
    status: ''
  });

  const fetchAssets = async (filters = {}, page = 1) => {
  try {
    setLoading(true);
    const res = await axios.get(FETCH_ASSETS_URL, {
      params: { ...filters, page, limit: ITEMS_PER_PAGE },
    });

    const { data, pagination } = res.data;
    setAssets(data || []);
    setFiltered(data || []);
    if (pagination) {
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
    } else {
      setCurrentPage(1);
      setTotalPages(1);
    }
  } catch (error) {
    console.error('Error fetching assets:', error);
    setAssets([]);
    setFiltered([]);
    setCurrentPage(1);
    setTotalPages(1);
  } finally {
    setLoading(false);  
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


  const handleFilterChange = async (key, value) => {
    const updated = { ...selectedFilters, [key]: value };
    if (key === 'category') updated.type = '';
  
    setSelectedFilters(updated);
    fetchAssets(updated, 1);
  };


  const handleSearch = async (searchQuery) => {
  // optional: for backend search
  fetchAssets({ ...selectedFilters, q: searchQuery }, 1);
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
			<div className="flex items-center justify-center relative pb-5">
              <button
                onClick={() => navigate("/assets")}
                className="absolute left-0 flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
      {/* Title */}
      <div className="text-4xl font-bold text-white text-center">
        <h2>ASSETS MANAGEMENT</h2>
        <div className="mt-2 mx-auto w-72 border-b-2 border-orange-400" />
      </div>
    </div>

			{/* Filters */}
			<div className="flex flex-wrap gap-4 justify-between items-center mb-6">
				<div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
					<SearchModal onSearch={handleSearch} />

					{/* Category Filter */}
					<select
						className="border px-3 py-2 rounded-md w-36"
						value={selectedFilters.category}
						onChange={(e) => handleFilterChange("category", e.target.value)}
					>
						<option value="">Category</option>
						{categories.map((cat) => (
							<option key={cat._id} value={cat._id}>
								{cat.name}
							</option>
						))}
					</select>

					{/* Type Filter */}
					<select
						className="border px-3 py-2 rounded-md w-36"
						value={selectedFilters.type}
						onChange={(e) => handleFilterChange("type", e.target.value)}
						disabled={!selectedFilters.category}
					>
						<option value="">Type</option>
						{types.map((t) => (
							<option key={t._id} value={t._id}>
								{t.name}
							</option>
						))}
					</select>

					{/* Status Filter */}
					<select
						className="border px-3 py-2 rounded-md w-36"
						value={selectedFilters.status}
						onChange={(e) => handleFilterChange("status", e.target.value)}
					>
						<option value="">Status</option>
						{status.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
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

				{/* Switches to User Assigned Asset View Page */}
				<Link to="/assets/assigned" className="w-full md:w-auto">
					<button className="px-5 py-2 bg-slate-600 hover:bg-slate-300 text-white hover:text-slate-700 rounded-md">
						User View
					</button>
				</Link>
			</div>

			<AssetList
				assets={filtered}
				setModalData={setModalData}
				fetchAssets={fetchAssets}
				selectedFilters={selectedFilters}
				loading={loading}
        currentPage={currentPage}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
			/>

			{modalData.show && (
				<DeleteConfirmationModal
					modalData={modalData}
					onClose={() =>
						setModalData({ show: false, deleteTitle: "", deleteUrl: "" })
					}
					onDeleteConfirm={handleDeleteConfirm}
					message={ASSET_DELETE_MESSAGE}
				/>
			)}
          {/* Pagination */}
    <div className="flex items-center justify-center mt-6 gap-4">
      <button
        onClick={() => currentPage > 1 && fetchAssets(selectedFilters, currentPage - 1)}
        disabled={currentPage === 1 || assets.length === 0}
        className={`px-4 py-2 border rounded-md text-gray-700 flex items-center gap-1 ${
          currentPage === 1 || assets.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100'
        }`}
      >
        ← Prev
      </button>

      <span className="px-4 py-2 bg-blue-500 text-white rounded-full">
        {currentPage}
      </span>

      <button
        onClick={() => currentPage < totalPages && fetchAssets(selectedFilters, currentPage + 1)}
        disabled={currentPage === totalPages || assets.length === 0}
        className={`px-4 py-2 border rounded-md text-gray-700 flex items-center gap-1 ${
          currentPage === totalPages || assets.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100'
        }`}
      >
        Next →
      </button>
    </div>

		</div>
	);
}

export default AssetIndex;
