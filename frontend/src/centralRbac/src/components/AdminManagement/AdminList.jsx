import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";
import AddAdmin from "./AddAdmin.jsx";
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RBAC_BASE_URL } from "../../utils/urlConstants.js";
import DeleteUserNameConfirmationModal from "../common/DeleteUserNameConfirmationModal.jsx";

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
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: "", });
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const query = searchQuery.trim() ? `?search=${searchQuery}&isAdminOnly=true` : `?isAdminOnly=true`;

            const response = await axios.get(`${RBAC_BASE_URL}/users${query}`);

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
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    // Effect uses fetchAdmins with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAdmins();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchAdmins]);

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
                <h1 className="text-3xl font-semibold text-white m-0">Manage Admins</h1>
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
                {loading ? (
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
                            {[...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-700">
                                    <td className="p-2 text-center">
                                        <div className="h-4 w-8 bg-gray-600 rounded mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="h-8 w-8 bg-gray-600 rounded-full mx-auto"></div>
                                    </td>
                                    <td className="p-2">
                                        <div className="h-4 w-32 bg-gray-600 rounded mx-auto"></div>
                                    </td>
                                    <td className="p-2">
                                        <div className="h-4 w-40 bg-gray-600 rounded mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="h-4 w-24 bg-gray-600 rounded mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center flex justify-center space-x-2">
                                        <div className="h-6 w-8 bg-gray-600 rounded"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
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
                )}
            </div>

            <AddAdmin
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                setAdmins={setAdmins}
                admins={admins}
                navigate={navigate}
            />

        {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <DeleteUserNameConfirmationModal
                    userName={deleteModal.userName}
                    onCancel={cancelRemoveAdmin}
                    onConfirm={confirmRemoveAdmin}
                />
            )}

        </div>
    );
}

export default AdminList;