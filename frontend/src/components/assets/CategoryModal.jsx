import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  CREATE_CATEGORY_URL,
  BASE_ASSET, // for category delete & update
} from "../../utils/urlConstants";
import ConfirmModal from "./ConfirmModal";
import { toast } from "react-toastify";

const CategoryModal = ({ isOpen, onClose, selectedCategory, refreshCategories }) => {
  const isEdit = !!selectedCategory;
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);


  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (isEdit && selectedCategory) {
      setFormData({ name: selectedCategory.name || "" });
    } else {
      setFormData({ name: "" });
    }
  }, [isEdit, selectedCategory]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}${BASE_ASSET(`categories/${selectedCategory._id}`)}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(CREATE_CATEGORY_URL, formData, { withCredentials: true });
      }
      refreshCategories();
      onClose();
    } catch (err) {
        if (err.response?.status === 409) {
          toast.error("Category already exists");
          return;
        }
        toast.error("Failed to save category");
      } finally {
        setSaving(false);
      }
  };

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}${BASE_ASSET(`categories/${selectedCategory._id}`)}`,
        { withCredentials: true }
      );
      refreshCategories();
      onClose();
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
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
          {isEdit ? "Update Category" : "Add Category"}
        </h2>

        {/* Input */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter category name"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          {isEdit && (
            <button
              onClick={() => setShowConfirm(true)}
              className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-5 py-2 rounded-md"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center justify-center"
          >
            {saving ? (
              <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
      <ConfirmModal
      isOpen={showConfirm}
      title="Delete Category"
      message="Are you sure you want to permanently delete this category? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      loading={deleting}
      onCancel={() => setShowConfirm(false)}
      onConfirm={handleDeleteConfirmed}
    />
    </div>
  );
};

export default CategoryModal;
