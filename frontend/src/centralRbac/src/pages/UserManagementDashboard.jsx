import { useState, useEffect, useCallback } from "react";
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
    const [loading, setLoading] = useState(false); // ⬅️ Loader state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterByEmail, setFilterByEmail] = useState("");
    const [filterByDepartment, setFilterByDepartment] = useState("");
    const [message, setMessage] = useState("");

    const [departments, setDepartments] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: "", });

    const navigate = useNavigate();

    
  // ✅ Single unified fetch function
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (filterByEmail) params.append("email", filterByEmail);
      if (filterByDepartment) params.append("department", filterByDepartment);

      const response = await axios.get(`${RBAC_BASE_URL}/users?${params.toString()}`);

      if (response.data.success) {
          setUsers(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch users.", {
          position: "top-right",
          autoClose: 3000,
          transition: Slide,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("No user Found.", {
        position: "top-right",
        autoClose: 3000,
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterByEmail, filterByDepartment]);

  // Debounced effect (only 1 fetch, not 4)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);


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
                        { position: 'top-right', autoClose: 2000, transition: Slide });
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
                    { position: 'top-right', autoClose: 2000, transition: Slide });
                setUsers(users.filter(user => user._id !== deleteModal.userId));
            } else if (response.data.message) {
                toast.error(response.data.message,
                    { position: 'top-right', autoClose: 2000, transition: Slide });
            } else {
                toast.success("User deleted successfully.",
                    { position: 'top-right', autoClose: 2000, transition: Slide });
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
                {loading ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-teal-600 text-gray-200 text-base">
                            <tr>
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
                            {[...Array(20)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-700">
                                    <td className="p-2 text-center">
                                        <div className="h-4 bg-gray-600 rounded w-8 mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="rounded-full bg-gray-600 h-8 w-8 mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="h-4 bg-gray-600 rounded w-28 mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="h-4 bg-gray-600 rounded w-40 mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="h-4 bg-gray-600 rounded w-20 mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="h-4 bg-gray-600 rounded w-24 mx-auto"></div>
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="h-5 bg-gray-600 rounded w-16 mx-auto"></div>
                                    </td>
                                    <td className="p-2 flex justify-center space-x-2">
                                        <div className="h-5 w-5 bg-gray-600 rounded"></div>
                                        <div className="h-5 w-5 bg-gray-600 rounded"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    //start
                    <table className="w-full text-left text-gray-300">
                        <thead>
                            <tr className="bg-teal-600 text-gray-200 text-base ">
                                <th className="p-2 whitespace-nowrap">Sr. No</th>
                                <th className="p-2 whitespace-nowrap">Avatar</th>
                                <th className="p-2 whitespace-nowrap">Full Name</th>
                                <th className="p-2 whitespace-nowrap">Email</th>
                                <th className="p-2 whitespace-nowrap">Role</th>
                                <th className="p-2 whitespace-nowrap">Department</th>
                                <th className="p-2 whitespace-nowrap">Active Status</th>
                                <th className="p-2 text-center whitespace-nowrap">Actions</th>
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
                                    <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold
                                    ${ user.status === "active"? "bg-green-600"
                                            : user.status === "inactive" ? "bg-red-600"
                                            : user.status === "pending" ? "bg-orange-500"
                                            : user.status === "onboarding" ? "bg-yellow-600"
                                            : user.status === "terminated" ? "bg-gray-500"
                                            : "bg-gray-400"
                                        }`}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
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
                )}
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
