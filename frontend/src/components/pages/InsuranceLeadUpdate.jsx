import React, { useCallback, useMemo, useRef, useState } from "react";
import { BiCloudUpload, BiLoaderAlt } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";

const backendUrl = process.env.REACT_APP_API_BASE_URL;

const EXCEL_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];
const EXCEL_EXTENSIONS = ".xlsx,.xls";

const COMPANY_OPTIONS = [
  "HDFC ERGO",
  "TATA AIG",
  "POLICY BajjaR",
  "Girnar",
  "Royal Sundaram",
  "Star Health",
  "Other",
];

const FILE_TYPES = [
  { label: "MIS", value: "mis" },
  { label: "Brokerage", value: "brokerage" },
];

function InsuranceLeadUpdate() {
  // step control
  const [step, setStep] = useState(1);

  // ---- MULTI FILE STATE ----
  // each entry: { file: File, company: string, customCompany: string, fileType: string }
  const [files, setFiles] = useState([]);

  // ui state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // step 2 (headers)
  const [headers, setHeaders] = useState([]); // from backend
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [search, setSearch] = useState("");

  const inputRef = useRef(null);

  // ---- helpers
  const filteredHeaders = useMemo(() => {
    if (!search) return headers;
    return headers.filter((h) => h.toLowerCase().includes(search.toLowerCase()));
  }, [headers, search]);

  const isExcel = (f) =>
    f && (EXCEL_MIME_TYPES.includes(f.type) || /\.(xlsx|xls)$/i.test(f.name));

  const resetErrors = () => setErrors({});

  // add one or more files
  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter(Boolean);
    if (incoming.length === 0) return;

    setFiles((prev) => [
      ...prev,
      ...incoming.map((f) => ({
        file: f,
        company: "",
        customCompany: "",
        fileType: "",
      })),
    ]);
  };

  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFileMeta = (idx, field, value) => {
    setFiles((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  // ---- drag & drop / input
  const onDrop = useCallback((ev) => {
    ev.preventDefault();
    addFiles(ev.dataTransfer.files);
  }, []);

  const onDragOver = (ev) => ev.preventDefault();

  const handleChooseFile = () => inputRef.current?.click();

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ---- validation for ALL files
  const validateStep1 = () => {
    const e = {};
    if (files.length === 0) e.files = "Please upload at least one Excel file.";

    files.forEach((row, idx) => {
      if (!row.file) e[`file_${idx}`] = "Missing file.";
      else if (!isExcel(row.file)) e[`file_${idx}`] = "Only .xlsx or .xls allowed.";
      if (!row.company) e[`company_${idx}`] = "Select a company.";
      if (row.company === "Other" && !row.customCompany.trim())
        e[`customCompany_${idx}`] = "Enter company name.";
      if (!row.fileType) e[`fileType_${idx}`] = "Choose file type.";
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- submit step 1: upload all files + meta
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    resetErrors();
    if (!validateStep1()) return;

    try {
      setIsSubmitting(true);

      const form = new FormData();
      files.forEach((row, idx) => {
        form.append("files", row.file); // backend as array
        form.append(
          `meta[${idx}][company]`,
          row.company === "Other" ? row.customCompany.trim() : row.company
        );
        form.append(`meta[${idx}][fileType]`, row.fileType);
        form.append(`meta[${idx}][originalName]`, row.file.name);
      });

      // TODO: replace endpoint when you receive it
      const res = await fetch(`${backendUrl}/api/insurance-leads/upload`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Upload failed");
      }

      // Expected: { headers: [...] }
      const data = await res.json();
      const hdrs = Array.isArray(data.headers) ? data.headers : [];
      setHeaders(hdrs);
      setSelectedHeaders(hdrs.slice(0, 5));
      setStep(2);
    } catch (err) {
      setErrors((prev) => ({ ...prev, server: err.message || "Server error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHeader = (h) => {
    setSelectedHeaders((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

  const handleSelectAll = () => {
    if (selectedHeaders.length === filteredHeaders.length) {
      setSelectedHeaders((prev) =>
        prev.filter((h) => !filteredHeaders.includes(h))
      );
    } else {
      setSelectedHeaders((prev) =>
        Array.from(new Set([...prev, ...filteredHeaders]))
      );
    }
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    if (selectedHeaders.length === 0) {
      setErrors({ headers: "Pick at least one header." });
      return;
    }
    setErrors({});

    try {
      setIsSubmitting(true);

      // TODO: replace endpoint when you receive it
      const res = await fetch(`${backendUrl}/api/insurance-leads/map-headers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // if later you need to send per-file details again, attach as needed
          selectedHeaders,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Submit failed");
      }

      setStep(3);
    } catch (err) {
      setErrors((prev) => ({ ...prev, server: err.message || "Server error" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setFiles([]);
    setErrors({});
    setHeaders([]);
    setSelectedHeaders([]);
    setSearch("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ---- UI
  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insurance Lead Update</h1>
        <div className="flex items-center gap-2 text-sm">
          <StepDot active={step >= 1} label="Upload" />
          <StepLine />
          <StepDot active={step >= 2} label="Select Headers" />
          <StepLine />
          <StepDot active={step >= 3} label="Done" />
        </div>
      </div>

      {/* Card */}
      <section className="bg-white rounded-2xl shadow p-5 md:p-7">
        {/* ====== STEP 1 ====== */}
        {step === 1 && (
  <form onSubmit={handleSubmitStep1} className="space-y-6">
    {/* Top: Drag & Drop */}
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] hover:bg-gray-50"
    >
      <BiCloudUpload className="text-5xl mb-3" />
      <p className="font-semibold">Drag & drop your Excel here</p>
      <p className="text-sm text-gray-500 mb-4">Only .xlsx or .xls</p>

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
        multiple
        accept={EXCEL_EXTENSIONS}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Small status line */}
      {files.length > 0 && (
        <div className="mt-4 text-xs text-gray-600">
          {files.length} file{files.length > 1 ? "s" : ""} added
        </div>
      )}
      {errors.files && (
        <p className="mt-2 text-sm text-red-600">{errors.files}</p>
      )}
    </div>

    {/* Below: Per-file sections */}
    <div className="space-y-6">
      {files.map((row, idx) => (
        <div key={idx} className="rounded-xl border p-4">
          {/* filename */}
          <div className="flex items-start justify-between">
            <div className="font-medium break-all">
              {row.file?.name || `File ${idx + 1}`}
            </div>
            <button
              type="button"
              onClick={() => removeFileAt(idx)}
              className="text-gray-600 hover:text-gray-900"
              title="Remove"
            >
              <IoMdClose />
            </button>
          </div>

          {/* Company */}
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Company</label>
            <select
              value={row.company}
              onChange={(e) => updateFileMeta(idx, "company", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Select company…</option>
              {COMPANY_OPTIONS.map((c) => (
                <option key={`${c}-${idx}`} value={c}>{c}</option>
              ))}
            </select>
            {errors[`company_${idx}`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`company_${idx}`]}</p>
            )}
          </div>

          {/* Other company name */}
          {row.company === "Other" && (
            <div className="mt-3">
              <label className="block text-sm text-gray-600 mb-1">Enter Company Name</label>
              <input
                type="text"
                value={row.customCompany}
                onChange={(e) => updateFileMeta(idx, "customCompany", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your company name"
              />
              {errors[`customCompany_${idx}`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`customCompany_${idx}`]}</p>
              )}
            </div>
          )}

          {/* File Type */}
          <div className="mt-4">
            <span className="block text-sm text-gray-600 mb-1">File Type</span>
            <div className="flex items-center gap-6">
              {FILE_TYPES.map((ft) => (
                <label key={`${ft.value}-${idx}`} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`filetype-${idx}`}
                    value={ft.value}
                    checked={row.fileType === ft.value}
                    onChange={(e) => updateFileMeta(idx, "fileType", e.target.value)}
                  />
                  <span>{ft.label}</span>
                </label>
              ))}
            </div>
            {errors[`fileType_${idx}`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`fileType_${idx}`]}</p>
            )}
          </div>

          {/* Per-file validation error */}
          {errors[`file_${idx}`] && (
            <p className="mt-3 text-sm text-red-600">{errors[`file_${idx}`]}</p>
          )}
        </div>
      ))}
    </div>

    {/* Buttons */}
    <div className="pt-2 flex items-center gap-3">
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-w-[180px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white enabled:hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isSubmitting ? <BiLoaderAlt className="animate-spin" /> : null}
        {isSubmitting ? "Uploading…" : "Upload & Fetch Headers"}
      </button>

      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          onClick={() => {
            const mock = [
              "Policy No","Customer Name","Email","Mobile","Premium Amount",
              "Policy Start Date","Policy End Date","Insurer","Agent Code",
              "Payout %","UTR","City","State","Pincode","Status","Remarks",
            ];
            setHeaders(mock);
            setSelectedHeaders(["Policy No", "Customer Name", "Mobile"]);
            setStep(2);
          }}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          title="Dev: skip upload and preview header selection"
        >
          Preview Select Headers
        </button>
      )}
    </div>

    {errors.server && <p className="text-sm text-red-600">{errors.server}</p>}
  </form>
)}


        {/* ====== STEP 2 ====== */}
        {step === 2 && (
          <form onSubmit={handleSubmitStep2} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">Select Headers</p>
                <p className="text-sm text-gray-500">
                  Choose the columns you want to use.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                >
                  {selectedHeaders.length === filteredHeaders.length
                    ? "Unselect Visible"
                    : "Select Visible"}
                </button>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search headers…"
                  className="px-3 py-1.5 rounded-lg border w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 max-h-80 overflow-auto border rounded-xl p-3">
              {filteredHeaders.length === 0 ? (
                <p className="text-sm text-gray-500 px-2">
                  No headers match your search.
                </p>
              ) : (
                filteredHeaders.map((h) => (
                  <label
                    key={h}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHeaders.includes(h)}
                      onChange={() => toggleHeader(h)}
                    />
                    <span className="truncate">{h}</span>
                  </label>
                ))
              )}
            </div>
            {errors.headers && (
              <p className="text-sm text-red-600">{errors.headers}</p>
            )}
            {errors.server && (
              <p className="text-sm text-red-600">{errors.server}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white enabled:hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <BiLoaderAlt className="animate-spin" />
                ) : null}
                {isSubmitting ? "Submitting…" : "Submit Selection"}
              </button>
            </div>
          </form>
        )}

        {/* ====== STEP 3 ====== */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center py-12">
            <FaCheckCircle className="text-5xl text-green-500 mb-3" />
            <h3 className="text-2xl font-semibold">All set!</h3>
            <p className="text-gray-600">
              Your headers were submitted successfully.
            </p>
            <button
              onClick={handleRestart}
              className="mt-6 px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Upload another file
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default InsuranceLeadUpdate;

// --- small UI atoms ---
function StepDot({ active, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3.5 w-3.5 rounded-full ${
          active ? "bg-blue-600" : "bg-gray-300"
        }`}
      ></span>
      <span className={`text-xs ${active ? "text-gray-900" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}
function StepLine() {
  return <div className="mx-2 h-px w-10 bg-gray-300" />;
}
