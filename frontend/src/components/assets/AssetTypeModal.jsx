import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  FETCH_CATEGORIES_URL,
  CREATE_TYPE_URL,
  BASE_ASSET,
} from "../../utils/urlConstants";

const AssetTypeModal = ({ isOpen, onClose, selectedType, refreshAssetTypes }) => {
  const isEdit = !!selectedType;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });

  const [categories, setCategories] = useState([]);

  //  Fetch categories for dropdown 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(FETCH_CATEGORIES_URL, { withCredentials: true });
        if (res.data?.data) setCategories(res.data.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  //  Prefill for edit mode
  useEffect(() => {
    if (isEdit && selectedType) {
      setFormData({
        name: selectedType.name || "",
        category: selectedType.category?._id || "",
      });
    } else {
      setFormData({ name: "", category: "" });
    }
  }, [isEdit, selectedType]);

  if (!isOpen) return null;

  // ===== Handlers =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}${BASE_ASSET(`types/${selectedType._id}`)}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(CREATE_TYPE_URL, formData, { withCredentials: true });
      }
      refreshAssetTypes();
      onClose();
    } catch (err) {
      console.error("Error saving asset type:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this asset type?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}${BASE_ASSET(`types/${selectedType._id}`)}`,
        { withCredentials: true }
      );
      refreshAssetTypes();
      onClose();
    } catch (err) {
      console.error("Failed to delete asset type:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {isEdit ? "Update Asset Type" : "Add Asset Type"}
        </h2>

        {/* ===== Form Fields ===== */}
        <div className="space-y-5 mb-6">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===== Buttons ===== */}
        <div className="flex justify-end gap-3">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-5 py-2 rounded-md"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetTypeModal;
