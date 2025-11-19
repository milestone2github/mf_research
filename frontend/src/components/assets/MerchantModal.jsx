import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "./ConfirmModal";
import { toast } from "react-toastify";

const MerchantModal = ({ isOpen, onClose, selectedMerchant, refreshMerchants }) => {
  const isEdit = !!selectedMerchant;
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    contactPerson: "",
    address: "",
    addedOn: "",
  });

  useEffect(() => {
    if (isEdit && selectedMerchant) {
      setFormData({
        name: selectedMerchant.name || "",
        phone: selectedMerchant.phone || "",
        email: selectedMerchant.email || "",
        contactPerson: selectedMerchant.contactPerson || "",
        address: selectedMerchant.address || "",
        addedOn: selectedMerchant.createdAt
        ? new Date(selectedMerchant.createdAt).toLocaleDateString("en-CA")
        : "",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        contactPerson: "",
        address: "",
        addedOn: "",
      });
    }
  }, [selectedMerchant, isEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/assets/merchants/${selectedMerchant._id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/assets/merchants`,
          formData,
          { withCredentials: true }
        );
      }
      refreshMerchants();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("Merchant already exists");
        return;
      }
      toast.error("Failed to save merchant");
    } finally {
      setSaving(false);
    }
  };

    const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/assets/merchants/${selectedMerchant._id}`,
        { withCredentials: true }
      );
      refreshMerchants();
      onClose();
    } catch (err) {
      console.error("Failed to delete merchant:", err);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
   <div className={`bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative ${isEdit ? 'mt-8 md:mt-12' : ''}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {isEdit ? "Update Merchant" : "Add Merchant"}
        </h2>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 outline-none ${
                errors.phone
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 outline-none ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">Contact Person</label>
            <input
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Address</label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {isEdit && (
      <div className="mb-6">
        <label className="text-sm text-gray-600">Added On</label>
        <input
          name="addedOn"
          type="date"
          value={formData.addedOn}
          readOnly
          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
        />
      </div>
    )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          {isEdit && (
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md"
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
              isEdit ? "Update" : "Save"
            )}
          </button>
        </div>
      </div>
      <ConfirmModal
      isOpen={showConfirm}
      title="Delete Merchant"
      message="Are you sure you want to permanently delete this merchant? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      loading={deleting}
      onCancel={() => setShowConfirm(false)}
      onConfirm={handleDeleteConfirmed}
    />
    </div>
  );
};

export default MerchantModal;
