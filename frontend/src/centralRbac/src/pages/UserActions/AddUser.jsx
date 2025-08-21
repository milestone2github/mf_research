import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RBAC_BASE_URL } from "../../utils/urlConstants";

const AddUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        role: "",
        customRole: "",
        mintUsername: "",
        insuranceDashboardID: "",
        permissions: [],
    });

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [additionalPermissions, setAdditionalPermissions] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loadingRoles, setLoadingRoles] = useState(false); 

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const deptRes = await axios.get(`${RBAC_BASE_URL}/depts`);
                setDepartments(deptRes.data.data);
            } catch (err) {
                console.error("Error fetching departments", err);
                setError("Error fetching department data.");
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        // Fetch roles based on the selected department
        const fetchRolesByDepartment = async (departmentId) => {
            if (departmentId) {
                setLoadingRoles(true);
                try {
                    const roleRes = await axios.get(`${RBAC_BASE_URL}/roles?dept=${departmentId}`);
                    setFilteredRoles(roleRes.data.data);
                } catch (err) {
                    console.error("Error fetching roles by department", err);
                    setError("Error fetching roles for this department.");
                    setFilteredRoles([]);
                } finally {
                    setLoadingRoles(false);
                }
            } else {
                setFilteredRoles([]);
            }
            // Reset the selected role and permissions when department changes
            setFormData(prev => ({ ...prev, role: "" }));
            setAdditionalPermissions([]);
        };

        if (formData.department) {
            fetchRolesByDepartment(formData.department);
        } else {
            setFilteredRoles([]);
            setFormData(prev => ({ ...prev, role: "" }));
            setAdditionalPermissions([]);
        }
    }, [formData.department]);

    useEffect(() => {
        const fetchAdditionalPerms = async () => {
            if (formData.department && formData.role) {
                try {
                    const res = await axios.get(`${RBAC_BASE_URL}/permissions/addperm`, {
                        params: {
                            roleId: formData.role,
                            departmentId: formData.department,
                        },
                    });
                    setAdditionalPermissions(res.data.additionalPermissions || []);
                } catch (err) {
                    console.error("Error fetching additional permissions", err);
                    setError("Error fetching additional permissions.");
                    setAdditionalPermissions([]);
                }
            } else {
                setAdditionalPermissions([]);
            }
        };

        fetchAdditionalPerms();
    }, [formData.department, formData.role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, value]
                : prev.permissions.filter((perm) => perm !== value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.name || !formData.email || !formData.department || !formData.role) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            const response = await axios.post(`${RBAC_BASE_URL}/users`, formData);
            setSuccess("User created successfully!");
            setFormData({
                name: "",
                email: "",
                department: "",
                role: "",
                customRole: "",
                mintUsername: "",
                insuranceDashboardID: "",
                permissions: [],
            });
            setAdditionalPermissions([]);

            toast.success("User created successfully!", {
                position: "top-right",
                autoClose: 3000,
                transition: Slide,
                onClose: () => navigate("/rbac/users"),
            });

        } catch (err) {
            setError(err.response?.data?.message || "Error creating user.");
            toast.error(err.response?.data?.message || "Error creating user.", {
                position: "top-right",
                autoClose: 3000,
                transition: Slide,
            });
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-3 sm:py-6 lg:py-8">
            <ToastContainer />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                              🙋🏻‍♂️ Add New User
                            </h2>
                            <button
                                onClick={() => navigate("/rbac/users")}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <FaArrowLeft size={20} className="inline-block mr-2" />
                                Back to Users
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name and Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="john.doe@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Department Dropdown */}
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="department"
                                    id="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="" className="text-gray-500">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept._id} value={dept._id} className="text-gray-700">
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Dropdown */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    id="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                    disabled={!formData.department || loadingRoles}
                                >
                                    <option value="" className="text-gray-500">Select Role</option>
                                    {loadingRoles ? (
                                        <option disabled className="text-gray-500">Loading roles...</option>
                                    ) : (
                                        filteredRoles.map((role) => (
                                            <option key={role._id} value={role._id} className="text-gray-700">
                                                {role.name}
                                            </option>
                                        ))
                                    )}
                                    {filteredRoles.length === 0 && formData.department && !loadingRoles && (
                                        <option disabled className="text-gray-500">No roles for this department</option>
                                    )}
                                    {!formData.department && (
                                        <option disabled className="text-gray-500">Select department first</option>
                                    )}
                                </select>
                            </div>

                            {/* Custom Role */}
                            <div>
                                <label htmlFor="customRole" className="block text-sm font-medium text-gray-700">
                                    Custom Role
                                </label>
                                <input
                                    type="text"
                                    name="customRole"
                                    id="customRole"
                                    placeholder="Optional"
                                    value={formData.customRole}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            {/* Mint Username and Insurance Dashboard ID */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="mintUsername" className="block text-sm font-medium text-gray-700">
                                        Mint Username
                                    </label>
                                    <input
                                        type="text"
                                        name="mintUsername"
                                        id="mintUsername"
                                        placeholder="Optional"
                                        value={formData.mintUsername}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="insuranceDashboardID" className="block text-sm font-medium text-gray-700">
                                        Insurance Dashboard ID
                                    </label>
                                    <input
                                        type="text"
                                        name="insuranceDashboardID"
                                        id="insuranceDashboardID"
                                        placeholder="Optional"
                                        value={formData.insuranceDashboardID}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Permissions Checkboxes */}
                            <fieldset className="border rounded-md shadow-sm p-4">
                                <legend className="text-base font-medium text-gray-700">
                                    Additional Permissions
                                </legend>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {additionalPermissions.map((perm) => (
                                        <div key={perm._id} className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id={`permission-${perm._id}`}
                                                    name="permissions"
                                                    type="checkbox"
                                                    value={perm._id}
                                                    checked={formData.permissions.includes(perm._id)}
                                                    onChange={handleCheckboxChange}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor={`permission-${perm._id}`} className="font-medium text-gray-700">
                                                    {perm.name}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                    {additionalPermissions.length === 0 && (
                                        <p className="text-gray-500 col-span-2 italic">☝️ Select Department and Role first to see relevant permissions. ☝️</p>
                                    )}
                                </div>
                            </fieldset>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUser;