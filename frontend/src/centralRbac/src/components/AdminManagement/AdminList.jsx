import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";
import AddAdmin from "./AddAdmin.jsx";
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RBAC_BASE_URL } from "../../utils/urlConstants.js";

const getInitials = (name) => {
    const words = name.split(" ");
    return words.length > 1 ? words[0][0] + words[1][0] : words[0][0];
};

const getAvatarColor = (key) => {
    if (!key) {return "bg-gray-500";}
    const colors = ["bg-blue-600", "bg-red-600", "bg-green-600", "bg-purple-600", "bg-yellow-600"];
    const index = key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

function AdminList() {
    const [admins, setAdmins] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: "", });
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchAdmins = useCallback(async () => {
        try {
            const response = await axios.get(`${RBAC_BASE_URL}/admin`);
            if (response.data.success) {
                setAdmins(response.data.data);
            } else {
                console.error("Error fetching admins:", response.data.message);
                toast.error(response.data.message || "Could not fetch admins.",
                    {
                        position: "top-right", autoClose: 3000, transition: Slide,
                    });
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
            toast.error("Could not fetch admins.",
                { position: "top-right", autoClose: 3000, transition: Slide, });
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    useEffect(() => {
        const fetchSearchedAdmins = async () => {
            try {
                let response;
                if (searchQuery.trim() === "") {
                    response = await axios.get(`${RBAC_BASE_URL}/admin`);
                } else {
                    response = await axios.get(
        `${RBAC_BASE_URL}/users/search?search=${searchQuery}&isAdminOnly=true`
                    );
                }

                if (response.data.success) {
                    setAdmins(response.data.data);
                } else {
                    console.error("Error fetching admins:", response.data.message);
                    toast.error(response.data.message || "Could not fetch admins.", {
                        position: "top-right", autoClose: 3000, transition: Slide,
                    });
                }
            } catch (error) {
                console.error("Error fetching admins:", error);
                toast.error("Could not fetch admins.",
                    {
                        position: "top-right", autoClose: 3000, transition: Slide,
                    });
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchSearchedAdmins();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleRemoveAdmin = (id, name, role) => {
        // Disable delete for Super Admins
        if (role !== 'Super Admin') {
            setDeleteModal({ show: true, userId: id, userName: name });
        } else {
            toast.warn("Deleting Super Admins is not allowed from here.", {
                position: "top-right", autoClose: 3000, transition: Slide,
            });
        }
    };

    const confirmRemoveAdmin = async () => {
        try {
            const response = await axios.patch(`${RBAC_BASE_URL}/admin/${deleteModal.userId}/delete`);
            // Check for both 
            if (response.data.success || response.data.message) {
                toast.success(`Admin role removed from user ${deleteModal.userName} successfully.`,
                    {
                        position: "top-right", autoClose: 3000, transition: Slide,
                    });
                await fetchAdmins(); // Refresh the admin list
            } else {
                console.error("Error removing admin:", response.data.message);
                toast.error(response.data.message || "Could not remove admin.", {
                    position: "top-right",
                    autoClose: 3000,
                    transition: Slide,
                });
            }
        } catch (error) {
            console.error("Error removing admin:", error);
            toast.error(error.response?.data?.message || "Could not remove admin.", {
                position: "top-right",
                autoClose: 3000,
                transition: Slide,
            });
        } finally {
            setDeleteModal({ show: false, userId: null, userName: "" });
        }
    };

    const cancelRemoveAdmin = () => {
        setDeleteModal({ show: false, userId: null, userName: "" });
    };

    return (
        <div className="p-6" style={{}}>
              <ToastContainer />
            <div className="relative flex items-center mb-5">
                <button
                    onClick={() => navigate("/rbac")}
                    className="text-white hover:text-gray-400 mr-4"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-semibold text-white">Manage Admins</h1>
            </div>

            <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg shadow-md text-gray-200">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="px-12 py-2 rounded-lg bg-gray-800 text-white border border-gray-200 focus:outline-gray-400 placeholder-gray-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                    <FaPlus className="mr-2" />
                    Add Admin
                </button>
            </div>

            <div
                className="bg-gray-900 rounded-md shadow-lg overflow-x-auto border-2 border-gray-500"
                style={{}}
            >
                <table className="w-full text-left text-gray-300">
                    <thead>
                        <tr className="bg-teal-600 text-gray-200 text-base">
                            <th className="p-2">Sr. No</th>
                            <th className="p-2">Avatar</th>
                            <th className="p-2">Full Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin, index) => (
                            <tr key={admin._id} className="hover:bg-gray-800 border-b border-gray-700">
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">
                                    <div
                                        className={`rounded-full h-8 w-8 flex items-center justify-center ${getAvatarColor(
                                            admin.name
                                        )}`}
                                    >
                                        {getInitials(admin.name)}
                                    </div>
                                </td>
                                <td className="p-2  text-gray-200">{admin.name}</td>
                                <td className="p-2 text-gray-200">{admin.email}</td>
                                <td className="p-2 text-green-500 ">{admin.internalDashboardRole}</td>
                                <td className="p-2 text-center">
                                <button onClick={() => handleRemoveAdmin(admin._id, admin.name, admin.internalDashboardRole)}
                                        className={`text-red-600 hover:text-red-400 p-2 ${admin.internalDashboardRole === 'Super Admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={admin.internalDashboardRole === 'Super Admin'}
                                    >
                                        <FaTrash size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddAdmin
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                setAdmins={setAdmins}
                admins={admins}
                navigate={navigate}
            />

            {deleteModal.show && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                        <div
                            className="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-headline"
                        >
                            <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3
                                            className="text-lg leading-6 font-medium text-white"
                                            id="modal-headline"
                                        >
                                            Remove Admin
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-300">
                                                Are you sure you want to remove admin role from{" "}
                                                <b>{deleteModal.userName}</b>?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={confirmRemoveAdmin}
                                >
                                    Remove
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={cancelRemoveAdmin}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminList;