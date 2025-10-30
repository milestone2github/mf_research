import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MerchantModal from "./MerchantModal";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function ManageMerchants() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  //   fetchMerchants 
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/assets/merchants`,
        { withCredentials: true }
      );
      console.log("response:",res.data);
      if (res.data?.data) {
        setMerchants(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch merchants:", err);
    } finally {
      setLoading(false);
    }
  };

  //  Call it once when component mounts
  useEffect(() => {
    fetchMerchants();
  }, []);

  //  Search merchants
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFiltered(merchants);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const result = merchants.filter(
      (m) =>
        m.name?.toLowerCase().includes(lower) ||
        m.email?.toLowerCase().includes(lower) ||
        m.contactPerson?.toLowerCase().includes(lower) ||
        m.phone?.includes(searchTerm)
    );
    setFiltered(result);
  };

  //  Open modal for Add
  const handleAddMerchant = () => {
    setSelectedMerchant(null);
    setModalOpen(true);
  };

  //  Open modal for Edit/Delete
  const handleRowClick = (merchant) => {
    setSelectedMerchant(merchant);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-center relative pb-5">
        {/* Back Button */}
        <button
          onClick={() => navigate("/assets")}
          className="absolute left-0 flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-4xl font-bold text-gray-800 text-center">
          <h2>MANAGE MERCHANTS</h2>
          <div className="mt-2 mx-auto w-64 border-b-2 border-orange-400" />
        </div>
      </div>

      {/* ===== Top Controls ===== */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        {/* Search Box */}
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="Search merchant"
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

        {/* Add Merchant */}
        <button
          onClick={handleAddMerchant}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full md:w-auto"
        >
          + Add Merchant
        </button>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border">S.No.</th>
              <th className="px-4 py-3 border">Name</th>
              <th className="px-4 py-3 border">Phone</th>
              <th className="px-4 py-3 border">Email</th>
              <th className="px-4 py-3 border">Contact Person</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((merchant, i) => (
                <tr
                  key={merchant._id || i}
                  className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(merchant)}
                >
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{merchant.name}</td>
                  <td className="px-4 py-3">{merchant.phone}</td>
                  <td className="px-4 py-3">{merchant.email}</td>
                  <td className="px-4 py-3">{merchant.contactPerson}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-5 text-gray-500">
                  No merchants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modal ===== */}
      <MerchantModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedMerchant={selectedMerchant}
        refreshMerchants={fetchMerchants}
      />
    </div>
  );
}

export default ManageMerchants;
