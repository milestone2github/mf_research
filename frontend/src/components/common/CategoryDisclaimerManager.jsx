
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { toast, Slide } from "react-toastify";

const CategoryDisclaimerManager = ({
    isOpen,
    onClose,
    type = "category", // "category" | "disclaimer"
    initialData = null, // if editing
    baseUrl,
    onSuccess, // callback to refresh options
}) => {
    const [formData, setFormData] = useState({
        label: "",
        key: "",
        text: "", // only for disclaimer
        isActive: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                label: initialData.label || "",
                key: initialData.key || "",
                text: initialData.text || "",
                isActive: initialData.isActive !== false,
            });
        } else {
            setFormData({
                label: "",
                key: "",
                text: "",
                isActive: true,
            });
        }
    }, [initialData, isOpen, type]);

    const generateKey = (label) => {
        return label
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Auto-generate key if creating new and key is empty/untouched (optional UX)
        if (name === "label" && !initialData) {
            setFormData((prev) => ({
                ...prev,
                label: value,
                key: generateKey(value),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = type === "category" ? "category" : "disclaimer";
        const payload = {
            label: formData.label,
            key: formData.key,
            isActive: formData.isActive,
        };
        if (type === "disclaimer") {
            payload.text = formData.text;
        }

        try {
            if (initialData?._id) {
                // Update
                // Note: Key usually shouldn't be changed after creation if used as ref, but backend allows it?
                // Checking backend controller: updateCategory takes label, isActive. It ignores key update.
                await axios.put(
                    `${baseUrl}/api/marketing-template/${endpoint}/${initialData._id}`,
                    payload
                );
                toast.success(`${type === "category" ? "Category" : "Disclaimer"} updated!`, {
                    transition: Slide,
                    autoClose: 2000
                });
            } else {
                // Create
                await axios.post(`${baseUrl}/api/marketing-template/${endpoint}`, payload);
                toast.success(`${type === "category" ? "Category" : "Disclaimer"} created!`, {
                    transition: Slide,
                    autoClose: 2000
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message || err.message || "Operation failed",
                { transition: Slide }
            );
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        setLoading(true);
        const endpoint = type === "category" ? "category" : "disclaimer";
        try {
            await axios.delete(`${baseUrl}/api/marketing-template/${endpoint}/${initialData._id}`);
            toast.success(`${type === "category" ? "Category" : "Disclaimer"} deleted!`, {
                transition: Slide,
                autoClose: 2000
            });
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Delete failed",
                { transition: Slide }
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">
                        {initialData ? "Edit" : "Add"} {type}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-900 transition"
                    >
                        <IoMdClose size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label *
                        </label>
                        <input
                            type="text"
                            name="label"
                            value={formData.label}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Mutual Funds"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Key (Unique ID) *
                        </label>
                        <input
                            type="text"
                            name="key"
                            value={formData.key}
                            onChange={(e) =>
                                setFormData({ ...formData, key: e.target.value.toUpperCase() })
                            }
                            required
                            disabled={!!initialData} // Usually keys act as IDs so maybe disable edit
                            className={`w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${initialData ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                                }`}
                            placeholder="e.g. MUTUAL_FUNDS"
                        />
                        {initialData && (
                            <p className="text-xs text-gray-400 mt-1">Key cannot be changed after creation.</p>
                        )}
                    </div>

                    {type === "disclaimer" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Disclaimer Text *
                            </label>
                            <textarea
                                name="text"
                                rows="4"
                                value={formData.text}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter disclaimer text..."
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData({ ...formData, isActive: e.target.checked })
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                            Active
                        </label>
                    </div>

                    <div className="pt-4 border-t mt-2 flex justify-end gap-3">
                        {initialData && (
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="mr-auto text-red-600 text-sm font-medium hover:underline"
                            >
                                Delete
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md text-gray-700 text-sm hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryDisclaimerManager;
