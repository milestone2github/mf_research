import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CategoryModal from "./CategoryModal";
import {
  FETCH_CATEGORIES_URL,
} from "../../utils/urlConstants";

function ManageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ✅ Fetch categories using FETCH_CATEGORIES_URL
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(FETCH_CATEGORIES_URL, { withCredentials: true });
      if (res.data?.data) {
        setCategories(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Search categories
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFiltered(categories);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const result = categories.filter((c) => c.name?.toLowerCase().includes(lower));
    setFiltered(result);
  };

  // ✅ Modal controls
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleRowClick = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-center relative pb-5">
        <button
          onClick={() => navigate("/assets")}
          className="absolute left-0 flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="text-4xl font-bold text-gray-800 text-center">
          <h2>MANAGE CATEGORIES</h2>
          <div className="mt-2 mx-auto w-64 border-b-2 border-orange-400" />
        </div>
      </div>

      {/* ===== Top Controls ===== */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="Search category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md w-56 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
          >
            Search
          </button>
        </div>

        <button
          onClick={handleAddCategory}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full md:w-auto"
        >
          + Add Category
        </button>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border">S.No.</th>
              <th className="px-4 py-3 border">Name</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="text-center py-5 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((category, i) => (
                <tr
                  key={category._id || i}
                  className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(category)}
                >
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{category.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-5 text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modal ===== */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedCategory={selectedCategory}
        refreshCategories={fetchCategories}
      />
    </div>
  );
}

export default ManageCategories;
