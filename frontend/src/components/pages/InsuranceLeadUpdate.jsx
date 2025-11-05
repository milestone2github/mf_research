import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { BiCloudUpload, BiLoaderAlt } from "react-icons/bi";
import { updateToast,resetToast } from "../../reducers/ToastSlice"; // adjust path if needed
import Toast from "../common/Toast"; // your existing toast component

const backendUrl = process.env.REACT_APP_API_BASE_URL;

const EXCEL_EXTENSIONS = ".xlsx,.xls,.csv";

const FILE_TYPES = [
  { label: "MIS", value: "mis" },
  { label: "Brokerage", value: "brokerage" },
];

function InsuranceLeadUpdate() {
  const [file, setFile] = useState(null);
  const [company, setCompany] = useState("");
  const [fileType, setFileType] = useState("");
  const [reupload, setReupload] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [companyOptions, setCompanyOptions] = useState([]);
  const inputRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch(`${backendUrl}/api/insurance-leads/companies`);
        const data = await res.json();
        setCompanyOptions(data || []);
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    }
    fetchCompanies();
  }, []);

  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleChooseFile = () => inputRef.current?.click();
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const validate = () => {
    const e = {};
    if (!file) e.file = "Please upload an Excel file.";
    else if (!/\.(xlsx|xls|csv)$/i.test(file.name))
    e.file = "Only .xlsx, .xls, or .csv files are allowed.";
    if (!company) e.company = "Select a company.";
    if (!fileType) e.fileType = "Choose the file type.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setFile(null);
    setCompany("");
    setFileType("");
    setReupload(false); 
    setErrors({});
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true); // start loader on button

  
  setTimeout(() => {
    dispatch(
      updateToast({
        type: "info",
        message: "File is processing...",
      })
    );

    // auto-hide toast after 4 seconds
    setTimeout(() => dispatch(resetToast()), 4000);

    resetForm();      // reset form when toast appears
    setLoading(false);
  }, 1000);

  try {
    const form = new FormData();
    form.append("file", file);
    form.append("company", company);
    form.append("fileType", fileType);
    form.append("reupload", reupload);

    const res = await fetch(`${backendUrl}/api/insurance-leads/ingest`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      let msg = "Upload failed";
      try {
        const errJson = await res.json();
        msg = errJson?.detail?.error || errJson?.message || msg;
      } catch (_) {
        msg = await res.text();
      }
      throw new Error(msg);
    }

    //  success toast 
    dispatch(
      updateToast({
        type: "success",
        message: "File uploaded successfully!",
      })
    );
  } catch (err) {
    //  error toast
    dispatch(
      updateToast({
        type: "error",
        message: err.message || "Upload failed",
      })
    );
  }
};


  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insurance Lead Update</h1>
      </div>

      <section className="bg-white rounded-2xl shadow p-5 md:p-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dropzone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] hover:bg-gray-50"
          >
            <BiCloudUpload className="text-5xl mb-3" />
            <p className="font-semibold">Drag & drop your Excel here</p>
            <p className="text-sm text-gray-500 mb-4">Only .xlsx or .xls or .csv</p>

            <button
              type="button"
              onClick={handleChooseFile}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Choose File
            </button>

            <input
              ref={inputRef}
              type="file"
              accept={EXCEL_EXTENSIONS}
              className="hidden"
              onChange={handleFileChange}
            />

            {file && (
              <div className="mt-4 text-sm text-gray-700 break-all">
                {file.name}
              </div>
            )}
            {errors.file && (
              <p className="mt-2 text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select company…
              </option>
              {companyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.company && (
              <p className="mt-1 text-sm text-red-600">{errors.company}</p>
            )}
          </div>

          {/* File Type */}
          <div>
            <span className="block text-sm text-gray-600 mb-1">File Type</span>
            <div className="flex items-center gap-6">
              {FILE_TYPES.map((ft) => (
                <label key={ft.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="filetype"
                    value={ft.value}
                    checked={fileType === ft.value}
                    onChange={(e) => setFileType(e.target.value)}
                  />
                  <span>{ft.label}</span>
                </label>
              ))}
            </div>
            {errors.fileType && (
              <p className="mt-1 text-sm text-red-600">{errors.fileType}</p>
            )}
          </div>
         
          {/* Reupload checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="reupload"
              type="checkbox"
              checked={reupload}
              onChange={(e) => setReupload(e.target.checked)}
            />
            <label htmlFor="reupload" className="text-sm text-gray-600">
              Reupload this file
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="min-w-[180px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white enabled:hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? <BiLoaderAlt className="animate-spin" /> : null}
              {loading ? "Uploading…" : "Upload & Submit"}
            </button>
          </div>
        </form>
      </section>

      <Toast />
    </main>
  );
}

export default InsuranceLeadUpdate;
