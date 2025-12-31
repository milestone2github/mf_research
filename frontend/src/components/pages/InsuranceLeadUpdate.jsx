import React, { useRef, useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { BiCloudUpload, BiLoaderAlt } from "react-icons/bi";
import * as XLSX from "xlsx";
import { updateToast, resetToast } from "../../reducers/ToastSlice";
import Toast from "../common/Toast";

const backendUrl = process.env.REACT_APP_API_BASE_URL;
const EXCEL_EXTENSIONS = ".xlsx,.xls,.csv";

const FILE_TYPES = [
  { label: "MIS", value: "mis" },
  { label: "Brokerage", value: "brokerage" },
];

// Frontend delay helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// CSV helpers (send selected rows to SAME /ingest route as file)
function toCsvValue(v) {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCsv(headers, rows) {
  const headerLine = headers.map(toCsvValue).join(",");
  const lines = rows.map((row) => headers.map((h) => toCsvValue(row[h])).join(","));
  return [headerLine, ...lines].join("\n");
}

function InsuranceLeadUpdate() {
  const [file, setFile] = useState(null);
  const [company, setCompany] = useState("");
  const [fileType, setFileType] = useState("");
  const [reupload, setReupload] = useState(false);

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [companyOptions, setCompanyOptions] = useState([]);

  const inputRef = useRef(null);
  const dispatch = useDispatch();

  // Preview state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]); // { __rowId, ...cols }
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

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

  const clearPreview = () => {
    setIsPreviewMode(false);
    setHeaders([]);
    setRows([]);
    setSelectedRowIds(new Set());
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      clearPreview();
    }
  };

  const handleChooseFile = () => inputRef.current?.click();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      clearPreview();
    }
  };

  const validateBase = () => {
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
    clearPreview();
    if (inputRef.current) inputRef.current.value = "";
  };

  // Fire-and-forget submit: DO NOT wait for API response
  const fireAndForgetSubmit = async (submitFn, delayMs = 300) => {
    setLoading(true);

    // after 300ms: reset UI and stop loader no matter what
    setTimeout(() => {
      resetForm();
      setLoading(false);

      dispatch(updateToast({ type: "success", message: "Submitted for processing" }));
      setTimeout(() => dispatch(resetToast()), 2500);
    }, delayMs);

    // run API in background (do not await / no error handling to user)
    try {
      submitFn(); // intentionally not awaited
    } catch (_) {}
  };

  // Select All derived state
  const allSelected = useMemo(() => {
    if (!rows.length) return false;
    return selectedRowIds.size === rows.length;
  }, [selectedRowIds, rows.length]);

  const someSelected = useMemo(() => {
    return selectedRowIds.size > 0 && selectedRowIds.size < rows.length;
  }, [selectedRowIds, rows.length]);

  const toggleRow = (rowId) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const toggleAll = (checked) => {
    if (!checked) {
      setSelectedRowIds(new Set());
      return;
    }
    setSelectedRowIds(new Set(rows.map((r) => r.__rowId)));
  };

  // ---------- PREVIEW ----------
  const handlePreview = async () => {
    if (!validateBase()) return;

    setPreviewLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });

      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];

      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (!aoa.length) throw new Error("No data found in file.");

      const fileHeaders = aoa[0].map((h) => String(h || "").trim());
      const dataRows = aoa.slice(1);

      const objectRows = dataRows
        .filter((r) => r.some((cell) => String(cell).trim() !== ""))
        .map((r, idx) => {
          const obj = { __rowId: idx + 1 };
          fileHeaders.forEach((h, i) => {
            obj[h || `Column${i + 1}`] = r[i] ?? "";
          });
          return obj;
        });

      setHeaders(fileHeaders);
      setRows(objectRows);
      setSelectedRowIds(new Set());
      setIsPreviewMode(true);

      dispatch(updateToast({ type: "success", message: "Preview loaded." }));
      setTimeout(() => dispatch(resetToast()), 2000);
    } catch (err) {
      dispatch(updateToast({ type: "error", message: err.message || "Preview failed" }));
      setTimeout(() => dispatch(resetToast()), 4000);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ---------- BUTTON 1: Upload & Submit (full file) - fire-and-forget ----------
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!validateBase()) return;

    fireAndForgetSubmit(async () => {
      // optional: delay before actually sending request
      await sleep(300);

      const form = new FormData();
      form.append("file", file);
      form.append("company", company);
      form.append("fileType", fileType);
      form.append("reupload", reupload);

      await fetch(`${backendUrl}/api/insurance-leads/ingest`, {
        method: "POST",
        body: form,
      });
    }, 300); // after 300ms UI resets no matter what
  };

  // ---------- BUTTON 2: Submit Selected Rows - fire-and-forget ----------
  const handleSubmitSelected = async () => {
    if (!validateBase()) return;

    if (!rows.length) {
      dispatch(updateToast({ type: "error", message: "No preview data. Click Preview Data first." }));
      setTimeout(() => dispatch(resetToast()), 3000);
      return;
    }

    if (selectedRowIds.size === 0) {
      dispatch(updateToast({ type: "error", message: "Select at least one row." }));
      setTimeout(() => dispatch(resetToast()), 3000);
      return;
    }

    // Build CSV BEFORE resetting UI (because resetForm clears state)
    const selectedRows = rows
      .filter((r) => selectedRowIds.has(r.__rowId))
      .map(({ __rowId, ...rest }) => rest);

    const csvText = buildCsv(headers, selectedRows);
    const csvBlob = new Blob([csvText], { type: "text/csv;charset=utf-8" });

    const baseName = (file?.name || "selected_rows").replace(/\.(xlsx|xls|csv)$/i, "");
    const csvFile = new File([csvBlob], `${baseName}_selected.csv`, { type: "text/csv" });

    fireAndForgetSubmit(async () => {
      // optional: delay before actually sending request
      await sleep(300);

      const form = new FormData();
      form.append("file", csvFile);
      form.append("company", company);
      form.append("fileType", fileType);
      form.append("reupload", reupload);

      await fetch(`${backendUrl}/api/insurance-leads/ingest`, {
        method: "POST",
        body: form,
      });
    }, 300);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insurance Lead Update</h1>
      </div>

      <section className="bg-white rounded-2xl shadow p-5 md:p-7">
        <form onSubmit={handleUploadSubmit} className="space-y-6">
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

            {file && <div className="mt-4 text-sm text-gray-700 break-all">{file.name}</div>}
            {errors.file && <p className="mt-2 text-sm text-red-600">{errors.file}</p>}
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
            {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
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
            {errors.fileType && <p className="mt-1 text-sm text-red-600">{errors.fileType}</p>}
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

          {/* Buttons (ONLY before preview) */}
          {!isPreviewMode && (
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePreview}
                disabled={previewLoading || loading}
                className="min-w-[180px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-700 text-white enabled:hover:bg-gray-800 disabled:bg-gray-400"
              >
                {previewLoading ? <BiLoaderAlt className="animate-spin" /> : null}
                {previewLoading ? "Loading…" : "Preview Data"}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="min-w-[180px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white enabled:hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? <BiLoaderAlt className="animate-spin" /> : null}
                {loading ? "Uploading…" : "Upload & Submit"}
              </button>
            </div>
          )}
        </form>

        {/* Preview Table */}
        {isPreviewMode && rows.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Preview</h2>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
                Select all
              </label>
            </div>

            <div className="overflow-auto border rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border-b"></th>
                    {headers.map((h) => (
                      <th key={h} className="p-2 text-left border-b whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.__rowId} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 border-b">
                        <input
                          type="checkbox"
                          checked={selectedRowIds.has(r.__rowId)}
                          onChange={() => toggleRow(r.__rowId)}
                        />
                      </td>
                      {headers.map((h) => (
                        <td key={h} className="p-2 border-b whitespace-nowrap">
                          {String(r[h] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit button below table */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Selected: {selectedRowIds.size} / {rows.length}
              </p>

              <button
                type="button"
                onClick={handleSubmitSelected}
                disabled={loading}
                className="min-w-[220px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white enabled:hover:bg-green-700 disabled:bg-green-400"
              >
                {loading ? <BiLoaderAlt className="animate-spin" /> : null}
                {loading ? "Submitting…" : "Submit Selected Rows"}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={clearPreview}
                disabled={loading || previewLoading}
                className="text-sm text-blue-600 hover:underline"
              >
                Back to upload options
              </button>
            </div>
          </div>
        )}
      </section>

      <Toast />
    </main>
  );
}

export default InsuranceLeadUpdate;
