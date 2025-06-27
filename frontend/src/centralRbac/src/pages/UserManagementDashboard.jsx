import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaArrowLeft, FaPlus } from "react-icons/fa";
import axios from "axios";
import DeleteUserNameConfirmationModal from "../components/common/DeleteUserNameConfirmationModal";
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RBAC_BASE_URL } from "../utils/urlConstants";


const getInitials = (name) => {
    if (!name || typeof name !== 'string') return "?";
    const words = name.trim().split(" ");
    return words.length > 1 ? words[0][0] + words[1][0] : words[0][0];
};

const getAvatorColor = (key) => {
    if (!key) {
        return "bg-gray-500";
    }
    const colors = ["bg-blue-600", "bg-red-600", "bg-green-600", "bg-purple-600", "bg-yellow-600"];
    const index = key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

function UserManagementDashboard() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterByEmail, setFilterByEmail] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");
    const [message, setMessage] = useState("");

    const [departments, setDepartments] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: "", });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await axios.get(`${RBAC_BASE_URL}/users`);
                if (response.data.success) {
                    console.log(response.data.data)
                    setUsers(response.data.data);
                } else {
                    console.error("Backend returned error:", response.data.message);
                    toast.error(`Failed to fetch users: ${response.data.message}`,
                        { position: 'top-right', autoClose: 3000, transition: Slide });
                }
            } catch (error) {
                console.error("Error fetching all users:", error);
                toast.error("Error fetching users.",
                    { position: 'top-right', autoClose: 3000, transition: Slide });
            }
        };

        fetchAllUsers();
    }, []);



    // Fetch users from API based on search query
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let response;
                if (searchQuery.trim() === "") {
                    // Fetch all users again when search query is empty
                    response = await axios.get(`${RBAC_BASE_URL}/users`);
                    if (response.data.success) {
                        setUsers(response.data.data);
                    }
                } else {
                    // Fetch searched users
                    response = await axios.get(`${RBAC_BASE_URL}/users/search?search=${searchQuery}&isAdminOnly=false`);
                    if (response.data.success) {
                        setUsers(response.data.data);
                        setMessage(response.data.message);

                    }
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setMessage("Error fetching users");
                setUsers([]);
                toast.error("Error fetching users based on search.",
                    { position: 'top-right', autoClose: 3000, transition: Slide });
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Fetch users when email filter is applied
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let response;
                if (filterByEmail) {
                    response = await axios.get(`${RBAC_BASE_URL}/users?email=${filterByEmail}`);
                } else {
                    // Fetch all users when filterByEmail is empty
                    response = await axios.get(`${RBAC_BASE_URL}/users`);
                }
                setUsers(response.data.data);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Error fetching users based on email filter.",
                    { position: 'top-right', autoClose: 3000, transition: Slide });
            }
        };

        fetchUsers();
    }, [filterByEmail]);

    // Fetch users based on department filter
    useEffect(() => {
        const fetchUsersByDepartment = async () => {
            try {
                let response;
                if (filterByDepartment) {
                    const encodedDepartment = encodeURIComponent(filterByDepartment);
                    const url = `${ RBAC_BASE_URL }/users?department=${encodedDepartment}`;
                    response = await axios.get(url);
                }               
                 else {
                    response = await axios.get(`${RBAC_BASE_URL}/users`);
                }
                if (response.data.success) {
                    setUsers(response.data.data);
                } else {
                    console.error("Error fetching users:", response.data.message);
                    setUsers([]);
                    toast.error(`Error fetching users by department: ${response.data.message}`,
                        { position: 'top-right', autoClose: 3000, transition: Slide });
                }
            } catch (error) {
                console.error("Error fetching users by department:", error);
                setUsers([]);
                toast.error("Error fetching users by department.",
                    { position: 'top-right', autoClose: 3000, transition: Slide });
            }
        };

        fetchUsersByDepartment();
    }, [filterByDepartment]);

    // Fetch departments on initial load
    useEffect(() => {
        const fetchDepartmentsData = async () => {
            try {
                const response = await axios.get(`${RBAC_BASE_URL}/depts`);;
                if (response.data) {
                    setDepartments(response.data.data);
                } else {
                    console.error("Error fetching departments:", response.data.message);
                    toast.error(`Error fetching departments: ${response.data.message}`,
                        { position: 'top-right', autoClose: 3000, transition: Slide });
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
                toast.error("Error fetching departments.",
                    { position: 'top-right', autoClose: 3000, transition: Slide });
            }
        };

        fetchDepartmentsData();
    }, []);

    // Handle Delete User - Modified to use modal
    const handleDeleteUser = (id, name) => {
        setDeleteModal({
            show: true,
            userId: id,
            userName: name,
        });
    };

    const confirmDeleteUser = async () => {
        try {
            const response = await axios.delete(`${RBAC_BASE_URL}/users/${deleteModal.userId}`);
            if (response.data.success && response.data.message) {
                toast.success(response.data.message,
                    { position: 'top-right', autoClose: 3000, transition: Slide });
                setUsers(users.filter(user => user._id !== deleteModal.userId));
            } else if (response.data.message) {
                toast.error(response.data.message,
                    { position: 'top-right', autoClose: 3000, transition: Slide });
            } else {
                toast.success("User deleted successfully.",
                    { position: 'top-right', autoClose: 3000, transition: Slide });
                setUsers(users.filter(user => user._id !== deleteModal.userId));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Error deleting user.",
                { position: 'top-right', autoClose: 3000, transition: Slide });
        } finally {
            setDeleteModal({ show: false, userId: null, userName: "" }); // Close modal
        }
    };

    const cancelDeleteUser = () => {
        setDeleteModal({ show: false, userId: null, userName: "" }); // Close modal
    };

    return (
        <div className="p-4">
            <ToastContainer />
            <div className="relative flex items-center mb-5">
                <button onClick={() => navigate("/rbac")} className="text-white hover:text-gray-400 mr-4">
                    <FaArrowLeft size={20} />
                </button>

                <h1 className="text-3xl font-semibold text-white m-0">
                    Users Management Dashboard
                </h1>
            </div>

            {/* Search & Filter Section */}
            <div className="flex justify-between items-center mb-2 bg-gray-800 p-3 rounded-lg shadow-md">
                <div className="flex gap-8">
                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="px-12 py-2 rounded-lg bg-gray-800 text-white border border-gray-400 focus:outline-gray-500 placeholder-gray-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Email Filter Dropdown */}
                    <select
                        className="px-6 py-2 rounded-lg bg-gray-800 text-white border border-gray-400"
                        onChange={(e) => setFilterByEmail(e.target.value)}
                    >
                        <option value="">All Users</option>
                        <option value="niveshonline.com">Zoho Users</option>
                        <option value="gmail.com">Gmail Users</option>
                    </select>

                    {/* Department Filter Dropdown */}
                    <select
                        className="px-6 py-2 rounded-lg bg-gray-800 text-white border border-gray-400"
                        value={filterByDepartment}
                        onChange={(e) => setFilterByDepartment(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept.name}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Add User Button */}
                <button
                    onClick={() => navigate(`/rbac/addUser`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <FaPlus className="mr-2" /> Add User
                </button>
            </div>

            {/* Message */}
            {/* {message && <p className="text-yellow-400 mb-2 text-center text-xl"> 🤷‍♂️ {message} 🤷‍♂️</p>} */}
            {/* User Table */}
            <div className="bg-gray-900 p-3 rounded-lg shadow-lg overflow-x-auto border-white">
                <table className="w-full text-left text-gray-300">
                    <thead>
                        <tr className="bg-teal-600 text-gray-200 text-base ">
                            <th className="p-2">Sr. No</th>
                            <th className="p-2">Avatar</th>
                            <th className="p-2">Full Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Department</th>
                            <th className="p-2">Active Status</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(users) && users.map((user, index) => (
                            <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-800 transition-all text-sm">
                                <td className="p-2">{index + 1}</td>

                                {/* Avatar */}
                                <td className="p-2">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm ${getAvatorColor(user._id)}`}>
                                        {getInitials(user.name).toUpperCase()}
                                    </div>
                                </td>

                                <td className="p-2">{user.name}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2">{user.role?.name}</td>
                                <td className="p-2">{user.department?.name}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${user.emp_status === "Active" ? "bg-green-600" : "bg-red-600"
                                        }`}>
                                        {user.emp_status}
                                    </span>
                                </td>
                                <td className="p-2 flex justify-center gap-2">
                                    <button onClick={() => navigate(`/rbac/users/${user._id}`)} className="text-blue-400 hover:text-blue-500">
                                        <FaEdit size={20} />
                                    </button>
                                    <button onClick={() => handleDeleteUser(user._id, user.name)} className="text-red-600 hover:text-red-800">
                                        <FaTrash size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <DeleteUserNameConfirmationModal
                    userName={deleteModal.userName}
                    onCancel ={cancelDeleteUser}
                    onConfirm={confirmDeleteUser}
                />
            )}
        </div>
    );
}

export default UserManagementDashboard;
