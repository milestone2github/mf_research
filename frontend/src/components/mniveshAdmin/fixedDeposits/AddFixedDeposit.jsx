import React, { useState } from "react";
import axios from "axios"; // For handling form submission

const AddFixedDeposit = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    image: null,
    rating: "",
    roi: "",
    senior: "",
    month_12: Array(5).fill(""), // Initializing for 12 months tenure
    month_24: Array(5).fill(""),
    month_36: Array(5).fill(""),
    month_48: Array(5).fill(""),
    month_60: Array(5).fill(""),
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleArrayChange = (e, monthKey) => {
    const { value, dataset } = e.target;
    const index = dataset.index;
    const newMonthArray = [...formData[monthKey]];
    newMonthArray[index] = value;
    setFormData({ ...formData, [monthKey]: newMonthArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData.image) {
        form.append(key, formData.image);
      } else {
        form.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post("/admin/fixed_deposit/store", form);
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

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Company Logo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Company Logo</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Rating</label>
          <input
            type="text"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Rate of Interest */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Rate of Interest</label>
          <input
            type="number"
            name="roi"
            value={formData.roi}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            required
            min="0"
            step=".01"
          />
        </div>

        {/* Additional Interest for Senior Citizens */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Additional Interest for Senior Citizens
          </label>
          <input
            type="number"
            name="senior"
            value={formData.senior}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            required
            min="0"
            step=".01"
          />
        </div>

        {/* Interest Table */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Interest Table</label>
          <table className="table-auto w-full border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-center">Tenure (Months)</th>
                <th className="px-4 py-2 text-center">Monthly</th>
                <th className="px-4 py-2 text-center">Quarterly</th>
                <th className="px-4 py-2 text-center">Half Yearly</th>
                <th className="px-4 py-2 text-center">Annually</th>
                <th className="px-4 py-2 text-center">UpTo Maturity</th>
              </tr>
            </thead>
            <tbody>
              {["month_12", "month_24", "month_36", "month_48", "month_60"].map((monthKey, index) => (
                <tr key={monthKey}>
                  <th>{(index + 1) * 12} Months</th>
                  {formData[monthKey].map((value, idx) => (
                    <td key={idx}>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={value}
                        onChange={(e) => handleArrayChange(e, monthKey)}
                        data-index={idx}
                        min="0"
                        step=".01"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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

export default AddFixedDeposit;