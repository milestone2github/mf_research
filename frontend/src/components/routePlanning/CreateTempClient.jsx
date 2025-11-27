import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CreateTemporaryClient = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address1: "",
    address2: "",
    city: "",
    pin: "",
  });

  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Numeric restriction for mobile and pin
    if (name === "mobile") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }
    if (name === "pin") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 6) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email");
      return false;
    }

    if (!formData.mobile.trim() || formData.mobile.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return false;
    }

    if (!formData.address1.trim()) {
      toast.error("Address Line 1 is required");
      return false;
    }

    if (!formData.address2.trim()) {
      toast.error("Address Line 2 is required");
      return false;
    }

    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }

    if (!/^\d{6}$/.test(formData.pin)) {
      toast.error("PIN code must be exactly 6 digits");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/api/route-plan/clients/create`, formData);

      toast.success(res.data.message || "Temporary Client Created!", {
        position: "top-right",
        autoClose: 2500,
      });

      setFormData({
        name: "",
        email: "",
        mobile: "",
        address1: "",
        address2: "",
        city: "",
        pin: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create client", {
        position: "top-right",
        autoClose: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-2 border border-gray-200 p-4 bg-white shadow-lg rounded-xl relative">

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200
                   text-gray-700 text-sm shadow-sm"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">
        Create Temporary Client
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* NAME */}
        <div>
          <label className="block font-medium mb-1">Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />
        </div>

        {/* EMAIL + MOBILE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Mobile *</label>
            <input
              type="text"
              name="mobile"
              maxLength={10}
              required
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block font-medium mb-1">Address Line 1 *</label>
          <input
            type="text"
            name="address1"
            required
            value={formData.address1}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Address Line 2 *</label>
          <input
            type="text"
            name="address2"
            required
            value={formData.address2}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          />
        </div>

        {/* CITY + PIN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">City *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">PIN Code *</label>
            <input
              type="text"
              name="pin"
              required
              maxLength={6}
              value={formData.pin}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700
                     transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Temporary Client"}
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};