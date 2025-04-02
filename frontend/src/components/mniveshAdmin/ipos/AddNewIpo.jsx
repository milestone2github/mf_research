import React, { useState } from "react";
import axios from "axios";

const AddNewIpo = () => {
  const [formData, setFormData] = useState({
    company: "",
    open_date: "",
    close_date: "",
    lot_size: "",
    price: "",
    type: "",
    face_value: "",
    market_lot: "",
    minimum_order_quantity: "",
    listing_at: "",
    issue_size: "",
    allotment_date: "",
    initiation_refund: "",
    demat_account: "",
    listing_date: "",
    min_lot: "",
    max_lot: "",
    min_share: "",
    max_share: "",
    min_amount: "",
    max_amount: ""
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/admin/ipos/store", formData);
      // Handle successful response here, such as redirecting or displaying a success message
    } catch (error) {
      setErrors([error.response?.data?.message || "An error occurred while saving changes."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-md">
      {errors.length > 0 && (
        <div className="alert alert-danger mb-4 p-4 bg-red-200 text-red-600">
          {errors.map((error, index) => (
            <p key={index} className="font-semibold">
              * {error}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Issue Dates */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Open Date</label>
            <input
              type="date"
              name="open_date"
              value={formData.open_date}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Close Date</label>
            <input
              type="date"
              name="close_date"
              value={formData.close_date}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Lot Size</label>
            <input
              type="number"
              name="lot_size"
              value={formData.lot_size}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* IPO Type, Face Value */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Face Value</label>
            <input
              type="number"
              name="face_value"
              value={formData.face_value}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Market Lot</label>
            <input
              type="number"
              name="market_lot"
              value={formData.market_lot}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Order Quantity</label>
            <input
              type="number"
              name="minimum_order_quantity"
              value={formData.minimum_order_quantity}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Remaining fields */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Listing At</label>
            <input
              type="number"
              name="listing_at"
              value={formData.listing_at}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Size</label>
            <input
              type="number"
              name="issue_size"
              value={formData.issue_size}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        
        {/* Remaining fields continue here... */}

        {/* Allotment/Refund Dates */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Allotment Date</label>
            <input
              type="date"
              name="allotment_date"
              value={formData.allotment_date}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Initiation Refund</label>
            <input
              type="date"
              name="initiation_refund"
              value={formData.initiation_refund}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Demat account and IPO Listing date */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Demat Account</label>
            <input
              type="text"
              name="demat_account"
              value={formData.demat_account}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Listing Date</label>
            <input
              type="date"
              name="listing_date"
              value={formData.listing_date}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Minimum and Maximum Lots */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Lot</label>
            <input
              type="number"
              name="min_lot"
              value={formData.min_lot}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Lot</label>
            <input
              type="number"
              name="max_lot"
              value={formData.max_lot}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Minimum and Maximum Shares */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Share</label>
            <input
              type="number"
              name="min_share"
              value={formData.min_share}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Share</label>
            <input
              type="number"
              name="max_share"
              value={formData.max_share}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Minimum and Maximum Amount */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Amount</label>
            <input
              type="number"
              name="min_amount"
              value={formData.min_amount}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Amount</label>
            <input
              type="number"
              name="max_amount"
              value={formData.max_amount}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
            onClick={() => window.history.back()}
          >
            Close
          </button>
          <button
            type="submit"
            className={`px-4 py-2 ${loading ? "bg-gray-400" : "bg-blue-500"} text-white rounded-md`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewIpo;