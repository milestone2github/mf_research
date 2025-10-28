import React, { useEffect, useState } from "react";
import axios from "axios";
import { CiCalendarDate } from "react-icons/ci";
import { BiTrash, BiUpload } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import DeleteConfirmationModal from "../../centralRbac/src/components/common/DeleteConfirmationModal";
const { formatDateDDShortMonthNameYY } = require("../../utils/formatDate");

const UploadMarketingTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [filterMinDate, setFilterMinDate] = useState("");
  const [filterMaxDate, setFilterMaxDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    publishDate: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);


  // Fetch templates (with optional publishDate filter)
  const fetchTemplates = async () => {
    try {
      setFetching(true);
      const params = {};

      if (filterMinDate || filterMaxDate) {
        params.minDate = filterMinDate || new Date().toISOString().split("T")[0];
        params.maxDate = filterMaxDate || new Date().toISOString().split("T")[0];
      }
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/marketing-template/admin`, { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTemplates(res.data.data);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error(" Error fetching templates:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterMinDate, filterMaxDate]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/marketing-template/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };


  //  Handle file upload change
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  //  Handle upload form submit
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.image || !formData.title || !formData.publishDate) {
      alert("Please fill all required fields!");
      return;
    }
    try {
      setLoading(true);
      const data = new FormData();
      data.append("image", formData.image);
      data.append("title", formData.title);
      data.append("publishDate", formData.publishDate);
      data.append("description", formData.description);

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/marketing-template/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsModalOpen(false);
      setFormData({ title: "", description: "", publishDate: "", image: null });
      fetchTemplates();
    } catch (err) {
      console.error(" Error uploading template:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Upload Marketing Templates</h2>

        <div className="flex items-center gap-4">

          {/*  Publish Date Range Filter */}
          {(
            <div className="flex bg-white items-center rounded-md border shadow-sm">
              <span className="text-xl ps-px text-black ml-2">
                <CiCalendarDate />
              </span>

              {/* From Date */}
              <label
                htmlFor="min-date"
                className={`relative flex items-center justify-center focus-within:bg-gray-100 text-sm w-[84px] h-9 text-center hover:bg-gray-100 ${!filterMinDate ? "text-gray-500" : "text-blue-600"
                  }`}

              >
                {filterMinDate
                  ? formatDateDDShortMonthNameYY(filterMinDate)
                  : "From"}
                <input
                  type="date"
                  name="minDate"
                  id="min-date"
                  className="text-xs absolute left-0 -z-10 opacity-0"
                  value={
                    filterMinDate
                      ? new Date(filterMinDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => setFilterMinDate(e.target.value)}
                  onFocus={(e) => e.target.showPicker()}
                />
              </label>

              {/* Divider */}
              <div className="h-7 border-s"></div>

              {/* To Date */}
              <label
                htmlFor="max-date"
                className={`relative flex items-center justify-center focus-within:bg-gray-100 text-sm w-[84px] h-9 p-1 text-center hover:bg-gray-100 ${!filterMaxDate ? "text-gray-500" : "text-blue-600"
                  }`}
              >
                {filterMaxDate
                  ? formatDateDDShortMonthNameYY(filterMaxDate)
                  : "To"}
                <input
                  type="date"
                  name="maxDate"
                  id="max-date"
                  className="text-xs absolute right-px -z-10 opacity-0"
                  value={
                    filterMaxDate
                      ? new Date(filterMaxDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => setFilterMaxDate(e.target.value)}
                  onFocus={(e) => e.target.showPicker()}
                />
              </label>


            </div>
          )}
          {/* Clear Button */}
          {(filterMinDate || filterMaxDate) && (
            <button
              onClick={() => {
                setFilterMinDate("");
                setFilterMaxDate("");
              }}
              className="-ml-2 text-[14px] px-3 py-1 border text-gray-500 hover:border-gray-500 rounded-md"
            >
              Clear
            </button>
          )}


          {/* Upload New Template Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
          >
            <BiUpload />
            Upload New Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {fetching ? (
        <div className="flex justify-center items-center h-48 text-gray-500 text-sm">
          Loading templates...
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {templates.length > 0 ? (
            templates.map((tpl) => (
              <div
                key={tpl._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-2 border border-gray-200"
              >
                <img
                  src={tpl.imageUrl}
                  alt={tpl.title}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
                <div className="px-2">
                  <h3
                    className="font-semibold text-sm text-gray-800 truncate cursor-pointer"
                    title={tpl.title} // shows full title on hover
                  >
                    {tpl.title}
                  </h3>

                  <p
                    className="text-xs text-gray-600 mt-1 line-clamp-2 cursor-pointer"
                    title={tpl.description || "No description provided."} // full description on hover
                  >
                    {tpl.description || "No description provided."}
                  </p>

                  <div className="text-[11px] text-gray-500 mt-2 flex flex-col gap-[2px]">
                    {tpl.publishDate && !isNaN(new Date(tpl.publishDate)) && (
                      <span>
                        <span className="text-gray-800 font-medium">📅 Publish:</span>{" "}
                        {new Date(tpl.publishDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {tpl.createdAt && !isNaN(new Date(tpl.createdAt)) && (
                      <span>
                        <span className="text-gray-800 font-medium">🕒 Created:</span>{" "}
                        {new Date(tpl.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>


                  <div className="flex justify-center mt-2">

                    <button
                      onClick={() => {
                        setDeleteTarget({ id: tpl._id, title: tpl.title });
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-600 flex items-center gap-1 text-xs font-semibold hover:text-red-700 bg-red-50 hover:border border-red-400 rounded-xl px-3 py-2"
                    >
                      <BiTrash />
                      Delete
                    </button>

                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic col-span-full">
              No templates found.
            </p>
          )}
        </section>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4 mt-6">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-900 transition"
            >
              <IoMdClose size={22} />
            </button>

            {/* Modal Title */}
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">
              Upload New Template
            </h4>

            <form onSubmit={handleUpload} className="flex flex-col gap-6">
              {/* Image Upload + Preview Row */}
              <div className="flex items-start gap-4">
                {/* File Input */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Template Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="w-40 h-40 border border-gray-200 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Title & Publish Date Row */}
              <div className="flex gap-3 publishDate">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Publish Date *
                  </label>
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={(e) =>
                      setFormData({ ...formData, publishDate: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="publishDate">
                <label className="block text-sm font-medium text-gray-600 publishDate">
                  Description
                </label>
                <textarea
                  rows="2"
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 publishDate -mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm flex items-center gap-2 transition"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <>
          <style>
            {`.fixed.inset-0 .bg-gray-700,
        .fixed.inset-0 .bg-gray-700 * {
        color: #ffffff !important; /* white text */
        }`}
          </style>
          <DeleteConfirmationModal
            modalData={{ deleteTitle: deleteTarget?.title }}
            onClose={() => setDeleteModalOpen(false)}
            onDeleteConfirm={async () => {
              await handleDelete(deleteTarget.id);
              setDeleteModalOpen(false);
              setDeleteTarget(null);
            }}
            message="This action cannot be undone."
          />
        </>
      )}


    </main>
  );
};

export default UploadMarketingTemplates;
