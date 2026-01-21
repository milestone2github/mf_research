import { useEffect, useState } from "react";
import Select, { components } from "react-select";
import axios from "axios";
import { CiCalendarDate } from "react-icons/ci";
import { BiEdit, BiTrash, BiUpload, BiPlus } from "react-icons/bi";
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from "react-icons/io";
import { toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmationModal from "../../centralRbac/src/components/common/DeleteConfirmationModal";
import CategoryDisclaimerManager from "../common/CategoryDisclaimerManager";
const { formatDateDDShortMonthNameYY } = require("../../utils/formatDate");
// const baseUrl = import.meta.env.VITE_API_BASE_URL;
const baseUrl = process.env.REACT_APP_API_BASE_URL;

const UploadMarketingTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [filterMinDate, setFilterMinDate] = useState("");
  const [filterMaxDate, setFilterMaxDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [disclaimerOptions, setDisclaimerOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;
  const [priorityCategory, setPriorityCategory] = useState(null);

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Manager Modal State
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerType, setManagerType] = useState("category"); // 'category' | 'disclaimer'
  const [managerData, setManagerData] = useState(null);


  const EMPTY_FORM = {
    title: "",
    description: "",
    category: null, // Stores ObjectId
    disclaimer: null, // Stores ObjectId
    publishDate: "",
    closeDate: "",
    festivalDate: "",
    image: null,
  };

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editData, setEditData] = useState(EMPTY_FORM);

  const isValidDate = (d) => d && !isNaN(new Date(d));
  const toISODate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
  const getCategoryId = (cat) => typeof cat === "string" ? cat : cat?._id;
  const isCollateral = (cat) => {
    const id = getCategoryId(cat);
    const meta = categoryOptions.find(c => c.value === id)?.meta;
    return meta?.key === "MARKETING_COLLATERAL";
  };
  const isMarketing = (cat) => {
    const id = getCategoryId(cat);
    const meta = categoryOptions.find(c => c.value === id)?.meta;
    return meta?.key === "MARKETING";
  };
  const isFestival = (cat) => {
    const id = getCategoryId(cat);
    const meta = categoryOptions.find(c => c.value === id)?.meta;
    return meta?.key === "FESTIVAL";
  };

  // Fetch Category and Disclaimer options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/marketing-template/getList`);

        const categories = res.data.category.map((c) => ({
          value: c._id,
          label: c.label,
          meta: c
        }));

        const disclaimers = res.data.disclaimerOptions.map((d) => ({
          value: d._id,
          label: d.label,
          text: d.text || "",
          meta: d
        }));

        setCategoryOptions(categories);
        setDisclaimerOptions(disclaimers);
      } catch (err) {
        console.error("Failed to fetch marketing options", err);
      }
    };

    fetchOptions();
  }, []);

  // Hydrate FormData after fetching Category and Disclaimer details
  useEffect(() => {
		if (categoryOptions.length && !formData.category) {
			setFormData((p) => ({ ...p, category: categoryOptions[0].value }));
		}

		if (disclaimerOptions.length && !formData.disclaimer) {
			setFormData((p) => ({ ...p, disclaimer: disclaimerOptions[0].value }));
		}
	}, [
		categoryOptions,
		disclaimerOptions,
		formData.category,
		formData.disclaimer,
	]);

  // Fetch marketing templates list
  const fetchTemplates = async (page = 1) => {
    try {
      setFetching(true);
      const params = { page, limit: PAGE_SIZE };

      if (filterMinDate || filterMaxDate) {
        params.minDate =
          filterMinDate || new Date().toISOString().split("T")[0];
        params.maxDate =
          filterMaxDate || new Date().toISOString().split("T")[0];
      }

      if (priorityCategory) {
        params.priorityCategory = priorityCategory.value;
      }

      const res = await axios.get(`${baseUrl}/api/marketing-template/admin`,
        { params }
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setTemplates(res.data.data);
      } else {
        setTemplates([]);
      }

      // Pagination logic
      const pagination = res.data?.pagination;
      if (pagination) {
        setCurrentPage(pagination.currentPage || 1);
        setTotalPages(pagination.totalPages || 1);
      } else {
        setCurrentPage(page);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(
        "Error fetching templates:",
        err.response?.data?.message || err.message
      );
      toast.error(
        err.response?.data?.message ||
        "Error fetching templates. Please try again later.",
        { autoClose: 3000, transition: Slide }
      );
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setFetching(false);
    }
  };

  // Fetch updated templates based on filters
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMinDate, filterMaxDate, priorityCategory]);

  // Category and Disclaimer CRUD logic along-with the Selection drop-down
  const CrudOption = (props) => {
    const { data, selectProps } = props;
    return (
      <components.Option {...props}>
        <div className="flex justify-between items-center">
          <span>{data.label}</span>
          <div className="flex gap-2">
            <BiEdit
              className="cursor-pointer text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                selectProps.onEdit(data.meta);
              }}
            />
            <BiTrash
              className="cursor-pointer text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                selectProps.onDelete(data.meta);
              }}
            />
          </div>
        </div>
      </components.Option>
    );
  };

  // Delete Template handler
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/api/marketing-template/${id}`
      );

      const nextPage =
        templates.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      const deletedTitle = response.data?.data?.title || "Template";
      toast.success(`${deletedTitle} deleted successfully!`, {
        autoClose: 2000,
        transition: Slide,
        hideProgressBar: true,
      });

      fetchTemplates(nextPage);
    } catch (err) {
      console.error("Error deleting template:", err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Error deleting template. Please try again later.",
        { autoClose: 3000, transition: Slide }
      );
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || fetching) return;
    fetchTemplates(page);
  };

  // Template EDIT Modal logic
  const openEditModal = (tpl) => {
    console.log("Editing Template Data:", tpl);

    // Extract ID from populated object (or use string if not populated)
    // const cat = tpl.category?._id || (typeof tpl.category === 'string' ? tpl.category : null);
    // let discId = tpl.disclaimer?._id || (typeof tpl.disclaimer === 'string' ? tpl.disclaimer : null);

    // Fallback for legacy disclaimer text (if stored as string and not matching an ID)
    // if (!discId && tpl.disclaimer && typeof tpl.disclaimer === 'string') {
      // Check if it matches a text in options
      // const found = disclaimerOptions.find(d => d.text === tpl.disclaimer || d.value === tpl.disclaimer);
      // if (found) discId = found.value;
    // }
    // Default fallback if still missing (optional, maybe better to leave empty)
    // if (!discId && disclaimerOptions.length > 0) {
      // discId = disclaimerOptions[0].value; 
      // Better NOT to default randomly if data is missing, but user code had a default.
      // Let's rely on what's there.
    // }

    setEditingTemplate(tpl);
    setEditData({
			title: tpl.title,
			description: tpl.description,
			category: tpl.category?._id || tpl.category,
			disclaimer: tpl.disclaimer?._id || tpl.disclaimer,
			publishDate: toISODate(tpl.publishDate),
			closeDate: tpl.closeDate ? toISODate(tpl.closeDate) : "",
			festivalDate: isFestival(tpl.category) ? toISODate(tpl.closeDate) : "",
		});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTemplate(null);
    setEditData({
      title: "",
      description: "",
      category: categoryOptions[0].value,
      disclaimer: disclaimerOptions[0].value,
      publishDate: "",
      closeDate: "",
    });
  };

  // Save Updated Template handler
  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingTemplate?._id) return;

    try {
      const normalizedCloseDate = isCollateral(editData.category)
        ? ""
        : editData.closeDate;

      //  MARKETING => closeDate compulsory
      if (isMarketing(editData.category) && !normalizedCloseDate) {
        toast.error("Close date is required for Marketing templates.", {
          autoClose: 2500,
          transition: Slide,
        });
        return;
      }

      // validation: closeDate should not be before publishDate (only if NOT collateral)
      if (
        !isCollateral(editData.category) &&
        normalizedCloseDate &&
        editData.publishDate &&
        normalizedCloseDate < editData.publishDate
      ) {
        toast.error("Close date cannot be before publish date.", {
          autoClose: 2500,
          transition: Slide,
        });
        return;
      }

      setLoading(true);

      let finalPublishDate = editData.publishDate;
      let finalCloseDate = editData.closeDate;

      if (isFestival(editData.category)) {
        // T-2 logic
        if (!editData.festivalDate) {
          toast.error("Festival Date is required.", { autoClose: 2500, transition: Slide });
          return;
        }
        const festDate = new Date(editData.festivalDate);
        const pubDate = new Date(festDate);
        pubDate.setDate(festDate.getDate() - 2);

        finalPublishDate = pubDate.toISOString().split('T')[0];
        finalCloseDate = festDate.toISOString().split('T')[0];
      } else if (isCollateral(editData.category)) {
        finalCloseDate = null;
      }

      setLoading(true);

      const payload = {
        title: editData.title,
        description: editData.description,
        category: editData.category,
        disclaimer: editData.disclaimer,
        publishDate: finalPublishDate,
        closeDate: finalCloseDate,
      };

      const response = await axios.patch(
        `${baseUrl}/api/marketing-template/${editingTemplate._id}`,
        payload
      );

      const updatedTemplate = response.data?.data;

      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl._id === updatedTemplate._id ? { ...tpl, ...updatedTemplate } : tpl
        )
      );

      closeEditModal();

      toast.success("Template updated successfully!", {
        autoClose: 2000,
        transition: Slide,
        hideProgressBar: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong, please try again later",
        { autoClose: 3000, transition: Slide }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleCategoryChange = (value, mode = "create") => {
    const updater = prev => ({
      ...prev,
      category: value,
      closeDate: isCollateral(value) ? "" : prev.closeDate,
      festivalDate: "",
    });

    mode === "create" ? setFormData(updater) : setEditData(updater);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const normalizedCloseDate = isCollateral(formData.category)
      ? ""
      : formData.closeDate;

    // if (!formData.image || !formData.title || !formData.publishDate) {
      // toast.error("Please fill all required fields!", {
        // autoClose: 2500,
        // transition: Slide,
      // });
      // return;
    // }

    const isFestivalCat = isFestival(formData.category);

		if (!formData.image || !formData.title) {
			toast.error("Please fill all required fields!", {
				autoClose: 2500,
				transition: Slide,
			});
			return;
		}
    if (isFestivalCat && !formData.festivalDate) {
			toast.error("Festival Date is required.", {
				autoClose: 2500,
				transition: Slide,
			});
			return;
		}

		if (!isFestivalCat && !formData.publishDate) {
			toast.error("Publish Date is required.", {
				autoClose: 2500,
				transition: Slide,
			});
			return;
		}

    //  MARKETING => closeDate compulsory
    if (isMarketing(formData.category) && !normalizedCloseDate) {
      toast.error("Close date is required for Marketing templates.", {
        autoClose: 2500,
        transition: Slide,
      });
      return;
    }

    // validation: closeDate should not be before publishDate (only if NOT collateral)
    if (
      !isCollateral(formData.category) &&
      normalizedCloseDate &&
      formData.publishDate &&
      normalizedCloseDate < formData.publishDate
    ) {
      toast.error("Close date cannot be before publish date.", {
        autoClose: 2500,
        transition: Slide,
      });
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("image", formData.image);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("disclaimer", formData.disclaimer);
      if (isFestival(formData.category)) {
        if (!formData.festivalDate) {
          toast.error("Festival Date is required.", { autoClose: 2500, transition: Slide });
          return;
        }
        const festDate = new Date(formData.festivalDate);
        const pubDate = new Date(festDate);
        pubDate.setDate(festDate.getDate() - 2);

        data.append("publishDate", pubDate.toISOString().split('T')[0]);
        data.append("closeDate", festDate.toISOString().split('T')[0]);
      } else {
        data.append("publishDate", formData.publishDate);
        if (!isCollateral(formData.category)) {
          data.append("closeDate", normalizedCloseDate);
        }
      }

      await axios.post(
        `${baseUrl}/api/marketing-template/`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        category: categoryOptions[0].value,
        disclaimer: disclaimerOptions[0].value,
        publishDate: "",
        closeDate: "",
        image: null,
      });

      fetchTemplates();
      toast.success("Template uploaded successfully!", {
        autoClose: 2000,
        transition: Slide,
        hideProgressBar: true,
      });
    } catch (err) {
      console.error("Error uploading template:", err);
      toast.error(
        err.response?.data?.message ||
        "Error uploading template. Please try again later.",
        { autoClose: 3000, transition: Slide }
      );
    } finally {
      setLoading(false);
    }
  };

  // const categoryLabel = (cat) =>
  //   cat === "MARKETING_COLLATERAL" ? "Marketing Collateral" : "Marketing";

  const fetchCategories = async () => {
    const res = await axios.get(`${baseUrl}/api/marketing-template/getList`);
    setCategoryOptions(
      res.data.category.map((c) => ({ value: c._id, label: c.label, meta: c }))
    );
    setDisclaimerOptions(
      res.data.disclaimerOptions.map((d) => ({ value: d._id, label: d.label, text: d.text, meta: d }))
    );
  };

  const openManager = (type, data = null) => {
    setManagerType(type);
    setManagerData(data);
    setManagerOpen(true);
  };

  const handleDeleteItem = async (type, meta) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    // setLoading(true); // maybe set specific loading?
    const endpoint = type === "category" ? "category" : "disclaimer";
    try {
      await axios.delete(`${baseUrl}/api/marketing-template/${endpoint}/${meta._id}`);
      toast.success(`${type === "category" ? "Category" : "Disclaimer"} deleted!`, {
        transition: Slide,
        autoClose: 2000
      });
      fetchCategories(); // Refresh options
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Delete failed",
        { transition: Slide }
      );
    }
  };



  return (
    <main className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Upload Marketing Templates
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4">

          {/* Priority Category Filter */}
          <div className="w-48">
            <Select
              value={priorityCategory}
              onChange={setPriorityCategory}
              options={categoryOptions}
              placeholder="Sort by Category"
              isClearable
              className="text-sm"
            />
          </div>

          {/* Publish Date Range Filter */}
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
                value={filterMinDate ? toISODate(filterMinDate) : ""}
                onChange={(e) => setFilterMinDate(e.target.value)}
                onFocus={(e) => e.target.showPicker()}
              />
            </label>

            <div className="h-7 border-s" />

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
                value={filterMaxDate ? toISODate(filterMaxDate) : ""}
                onChange={(e) => setFilterMaxDate(e.target.value)}
                onFocus={(e) => e.target.showPicker()}
              />
            </label>
          </div>

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
                    title={tpl.title}
                  >
                    {tpl.title}
                  </h3>

                  <p
                    className="text-xs text-gray-600 mt-1 line-clamp-2 cursor-pointer"
                    title={tpl.description || "No description provided."}
                  >
                    {tpl.description || "No description provided."}
                  </p>

                  <div className="mt-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 border">
                      {tpl.category?.label || tpl.category?.key || "Marketing"}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 mt-2 flex flex-col gap-[2px]">
                    {isValidDate(tpl.publishDate) && (
                      <span>
                        <span className="text-gray-800 font-medium">
                          📅 Publish:
                        </span>{" "}
                        {new Date(tpl.publishDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}

                    {!isCollateral(tpl.category) && isValidDate(tpl.closeDate) && (
                      <span>
                        <span className="text-gray-800 font-medium">
                          ⛔ Close:
                        </span>{" "}
                        {new Date(tpl.closeDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}

                    {isValidDate(tpl.createdAt) && (
                      <span>
                        <span className="text-gray-800 font-medium">
                          🕒 Created:
                        </span>{" "}
                        {new Date(tpl.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center mt-2 gap-2">
                    <button
                      onClick={() => {
                        setDeleteTarget({ id: tpl._id, title: tpl.title });
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-600 flex items-center gap-1 text-xs font-semibold hover:text-red-700 bg-red-50 border border-red-50 hover:border-red-400 rounded-xl px-3 py-2"
                    >
                      <BiTrash />
                      Delete
                    </button>

                    <button
                      onClick={() => openEditModal(tpl)}
                      className="text-blue-600 flex items-center gap-1 text-xs font-semibold hover:text-blue-700 bg-blue-50 border border-blue-50 hover:border-blue-400 rounded-xl px-3 py-2"
                    >
                      <BiEdit />
                      Edit
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

      {!fetching && templates.length > 0 && (
        <div className="flex items-center justify-center mt-6 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || fetching}
            className={`px-4 py-2 border rounded-md text-gray-700 flex items-center gap-1 ${currentPage === 1 || fetching
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
              }`}
          >
            <IoIosArrowBack /> Prev
          </button>

          <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || fetching}
            className={`px-4 py-2 border rounded-md text-gray-700 flex items-center gap-1 ${currentPage === totalPages || fetching
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
              }`}
          >
            Next <IoIosArrowForward />
          </button>
        </div>
      )}

      {/*  Upload Modal (UI fixed: close X + buttons never hidden) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-start justify-center pt-10 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
            {/* sticky header so X always visible */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b">
              <h4 className="text-xl font-semibold text-gray-800">
                Upload New Template
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 transition"
                aria-label="Close"
              >
                <IoMdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-6 px-6 py-6">
              <div className="flex items-start gap-4">
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

              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-600">
                    Category *
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 text-xs cursor-pointer flex items-center gap-1 hover:underline focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openManager("category");
                    }}
                  >
                    <BiPlus /> Add New
                  </button>
                </div>
                <Select
                  value={categoryOptions.find(
                    (c) => c.value === formData.category
                  )}
                  options={categoryOptions}
                  components={{ Option: CrudOption }}
                  onEdit={(meta) => openManager("category", meta)}
                  onDelete={(meta) => handleDeleteItem("category", meta)}
                  onChange={(opt) => handleCategoryChange(opt.value, "create")}
                  className="text-sm"
                  classNamePrefix="react-select"
                />

              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-600">
                    Disclaimer Type *
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 text-xs cursor-pointer flex items-center gap-1 hover:underline focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openManager("disclaimer");
                    }}
                  >
                    <BiPlus /> Add New
                  </button>
                </div>
                <Select
                  value={disclaimerOptions.find(
                    (d) => d.value === formData.disclaimer
                  )}
                  options={disclaimerOptions}
                  components={{ Option: CrudOption }}
                  onEdit={( meta) => openManager("disclaimer", meta) }
                  onDelete={ (meta) => handleDeleteItem("disclaimer", meta) }
                  onChange={ (opt) => setFormData(p => ({ ...p, disclaimer: opt.value })) }
                  className="text-sm"
                  classNamePrefix="react-select"
                />
                {/* <select
                  value={formData.disclaimerType}
                  onChange={(e) =>
                    setFormData({ ...formData, disclaimerType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {disclaimerOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select> */}

                {/* Optional preview --> To-Do */}
                <p className="text-xs text-gray-500 mt-1">
                  {
                    disclaimerOptions.find((d) => d.value === formData.disclaimer)?.text
                  }
                </p>
              </div>

              <div
                className={`grid grid-cols-1 ${isCollateral(formData.category)
                  ? "sm:grid-cols-1"
                  : "sm:grid-cols-2"
                  } gap-3`}
              >
                {isFestival(formData.category) ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Festival Date *
                    </label>
                    <input
                      type="date"
                      name="festivalDate"
                      value={formData.festivalDate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, festivalDate: e.target.value })
                      }
                      required
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Template will be visible from T-2 days.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
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

                    {!isCollateral(formData.category) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Close Date *
                        </label>
                        <input
                          type="date"
                          name="closeDate"
                          value={formData.closeDate}
                          onChange={(e) =>
                            setFormData({ ...formData, closeDate: e.target.value })
                          }
                          required={isMarketing(formData.category)}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* sticky footer so buttons never hidden */}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t flex justify-end gap-3">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm flex items-center gap-2 transition disabled:opacity-60"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}

      {
        deleteModalOpen && (
          <>
            <style>
              {`.fixed.inset-0 .bg-gray-700,
              .fixed.inset-0 .bg-gray-700 * {
                color: #ffffff !important;
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
        )
      }

      {/*  Edit Modal (UI fixed same way) */}
      {
        isEditModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b">
                <h4 className="text-xl font-semibold text-gray-800">Edit Template</h4>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-900 transition"
                  aria-label="Close"
                >
                  <IoMdClose size={22} />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="flex flex-col gap-6 px-6 py-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    name="description"
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>

                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-600">
                      Category *
                    </label>
                    <button
                      type="button"
                      className="text-blue-600 text-xs cursor-pointer flex items-center gap-1 hover:underline focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openManager("category");
                      }}
                    >
                      <BiPlus /> Add New
                    </button>
                  </div>
                  <Select
                    value={categoryOptions.find(c => c.value === editData.category)}
                    options={categoryOptions}
                    components={{ Option: CrudOption }}
                    onEdit={(meta) => openManager("category", meta)}
                    onDelete={(meta) => handleDeleteItem("category", meta)}
                    onChange={(opt) => handleCategoryChange(opt.value, "edit")}
                    className="text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-600">
                      Disclaimer Type *
                    </label>
                    <button
                      type="button"
                      className="text-blue-600 text-xs cursor-pointer flex items-center gap-1 hover:underline focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openManager("disclaimer");
                      }}
                    >
                      <BiPlus /> Add New
                    </button>
                  </div>
                  <Select
                    value={disclaimerOptions.find(d => d.value === editData.disclaimer)}
                    onChange={(opt) => setEditData({ ...editData, disclaimer: opt.value })}
                    options={disclaimerOptions}
                    components={{ Option: CrudOption }}
                    onEdit={(meta) => openManager("disclaimer", meta)}
                    onDelete={(meta) => handleDeleteItem("disclaimer", meta)}
                    className="text-sm"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    {/* {DISCLAIMER_TEXT_BY_TYPE[editData.disclaimerType]} */}
                    {disclaimerOptions.find((d) => d.value === editData.disclaimer)?.text}
                  </p>
                </div>

                <div
                  className={`grid grid-cols-1 ${isCollateral(editData.category)
                    ? "sm:grid-cols-1"
                    : "sm:grid-cols-2"
                    } gap-3`}
                >
                  {isFestival(editData.category) ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Festival Date *
                      </label>
                      <input
                        type="date"
                        name="festivalDate"
                        value={editData.festivalDate || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, festivalDate: e.target.value })
                        }
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        Template will be visible from T-2 days.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Publish Date *
                        </label>
                        <input
                          type="date"
                          name="publishDate"
                          value={editData.publishDate}
                          onChange={(e) =>
                            setEditData({ ...editData, publishDate: e.target.value })
                          }
                          required
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {!isCollateral(editData.category) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Close Date *
                          </label>
                          <input
                            type="date"
                            name="closeDate"
                            value={editData.closeDate}
                            onChange={(e) =>
                              setEditData({ ...editData, closeDate: e.target.value })
                            }
                            required={isMarketing(editData.category)}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm flex items-center gap-2 transition disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      <CategoryDisclaimerManager
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        type={managerType}
        initialData={managerData}
        baseUrl={baseUrl}
        onSuccess={fetchCategories}
      />

      {deleteModalOpen && (
        <DeleteConfirmationModal
          modalData={{ deleteTitle: deleteTarget?.title }}
          onClose={() => setDeleteModalOpen(false)}
          onDeleteConfirm={() => {
            if (deleteTarget) {
              handleDelete(deleteTarget.id);
              setDeleteModalOpen(false);
            }
          }}
        />
      )}

    </main >
  );
};

export default UploadMarketingTemplates;