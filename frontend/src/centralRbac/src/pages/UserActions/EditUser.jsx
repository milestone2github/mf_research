import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Switch } from '@headlessui/react';
import { RBAC_BASE_URL } from "../../utils/urlConstants";


const getInitials = (name) => {
    const words = name?.split(" ") || [];
    return words.length > 1 ? words[0][0] + words[1][0] : words[0]?.[0] || '';
};

const getAvatorColor = (key) => {
    if (!key) return "bg-gray-500";
    const colors = ["bg-blue-600", "bg-red-600", "bg-green-600", "bg-purple-600", "bg-yellow-600"];
    const index = key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

function EditUser() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeStatus, setActiveStatus] = useState("Active");
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [rolePermissions, setRolePermissions] = useState([]);
    const [departmentPermissions, setDepartmentPermissions] = useState([]);
    const [additionalPermissions, setAdditionalPermissions] = useState([]);
    const [toggledPermissions, setToggledPermissions] = useState({});
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    // Main initialization effect
    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                
                // Fetch departments first
                const deptsResponse = await axios.get(`${RBAC_BASE_URL}/depts`);
                setDepartments(deptsResponse.data.data);
                
                // Then fetch user details
                const userResponse = await axios.get(`${RBAC_BASE_URL}/users/${userId}`);
                const userData = userResponse.data.data;
                setUser(userData);
                setActiveStatus(userData.emp_status || "Active");

                // Set initial department and role
                if (userData.department?._id) {
                    setSelectedDepartment(userData.department._id);
                    
                    // Fetch roles for this department
                    const rolesResponse = await axios.get(`${RBAC_BASE_URL}/roles`, {
                        params: { dept: userData.department._id }
                    });
                    setRoles(rolesResponse.data.data);
                    
                    // Set initial role if exists
                    if (userData.role?._id) {
                        setSelectedRole(userData.role._id);
                    }
                }
                
            } catch (error) {
                console.error("Initialization error:", error);
                toast.error("Failed to load initial data", { position: "top-right" });
            } finally {
                setLoading(false);
            }
        };
        
        initializeData();
    }, [userId]);

    // Effect to handle permission fetching when role or department changes
    useEffect(() => {
        const fetchPermissions = async () => {
            if (selectedDepartment && selectedRole) {
                setLoadingPermissions(true);
                try {
                    // Fetch all permissions in parallel
                    await Promise.all([
                        fetchDepartmentPermissions(selectedDepartment),                      
                        fetchRolePermissions(selectedRole),
                        fetchAdditionalPermissions(selectedRole, selectedDepartment)
                    ]);
                } catch (error) {
                    console.error("Permission fetch error:", error);
                    toast.error("Failed to load permissions", { position: "top-right" });
                } finally {
                    setLoadingPermissions(false);
                }
            }else if (selectedDepartment) {
                setLoadingPermissions(true);
                try {
                    // Fetch all permissions in parallel
                    await Promise.all([
                        fetchDepartmentPermissions(selectedDepartment)                   
                    ]);
                } catch (error) {
                    console.error("Permission fetch error:", error);
                    toast.error("Failed to load permissions", { position: "top-right" });
                } finally {
                    setLoadingPermissions(false);
                }
            }
        };
        
        fetchPermissions();
    }, [selectedDepartment, selectedRole]);

    // Fetch department permissions
    const fetchDepartmentPermissions = async (departmentId) => {
        try {
            const res = await axios.get(`${RBAC_BASE_URL}/depts/${departmentId}`
            );
            setDepartmentPermissions(res.data.data?.permissions || []);
        } catch (err) {
            console.error("Department permissions error:", err);
            setDepartmentPermissions([]);
        }
    };

    // Fetch role permissions
    const fetchRolePermissions = async (roleId) => {       
        try {
            const res = await axios.get(`${RBAC_BASE_URL}/roles/${roleId}`    
            );
            setRolePermissions(res.data.data?.permissions || []);
        } catch (err) {
            console.error("Role permissions error:", err);
            setRolePermissions([]);
        }
    };

    // Fetch additional permissions - UPDATED TO HANDLE TOGGLES PROPERLY
    const fetchAdditionalPermissions = async (roleId, departmentId) => {
        console.log("Role and department id at 139",roleId,departmentId);
        try {
            const response = await axios.get(`${RBAC_BASE_URL}/permissions/addperm`, {
                params: {
                    roleId,
                    departmentId,
                    userId: userId
                }
            });
    
            let fetchedPermissions = response.data.additionalPermissions || [];
    
            // Filter out permissions already in role or department
            const deptRoleIds = new Set([
                ...rolePermissions.map(p => p._id),
                ...departmentPermissions.map(p => p._id),
            ]);
    
            fetchedPermissions = fetchedPermissions.filter(perm => !deptRoleIds.has(perm._id));
            setAdditionalPermissions(fetchedPermissions);
    
            const initialToggles = {};
            const userPermissionIds = user?.permissions?.map(p => p._id) || [];
    
            fetchedPermissions.forEach(perm => {
                initialToggles[perm._id] = userPermissionIds.includes(perm._id);
            });
    
            setToggledPermissions(initialToggles);
    
        } catch (error) {
            console.error('Additional permissions error:', error);
            setAdditionalPermissions([]);
            setToggledPermissions({});
        }
    };
    

    // Handle department change
    const handleDepartmentChange = async (deptId) => {
        setSelectedDepartment(deptId);
        setSelectedRole(null); // Reset role when department changes
        setRoles([]); // Clear roles until we fetch new ones
        
        if (deptId) {
            try {
                const rolesResponse = await axios.get(`${RBAC_BASE_URL}/roles`, {
                    params: { dept: deptId }
                });
                setRoles(rolesResponse.data.data);
            } catch (err) {
                console.error("Roles fetch error:", err);
                toast.error("Failed to fetch roles", { position: "top-right" });
            }
        }
    };

    // Handle role change
    const handleRoleChange = async(roleId) => {
        if (selectedDepartment && roleId) {
            try {
                setLoadingPermissions(true);
                await Promise.all([
                    fetchDepartmentPermissions(selectedDepartment),
                    fetchRolePermissions(roleId),
                    fetchAdditionalPermissions(roleId, selectedDepartment)
                ]);
            } catch (error) {
                console.error("Permission fetch error:", error);
            } finally {
                setLoadingPermissions(false);
            }
        }
        setSelectedRole(roleId);
    };

    // Handle permission toggle - UPDATED TO PROPERLY SYNC WITH USER PERMISSIONS
    const handleToggleChange = async (permissionId, checked) => {
        // Update toggle state immediately for UI
        setToggledPermissions(prev => ({ ...prev, [permissionId]: checked }));
        
        // Update user permissions in state
        setUser(prevUser => {
            if (!prevUser) return prevUser;
            
            const currentPermissions = prevUser.permissions || [];
            let updatedPermissions;
            
            if (checked) {
                // Add permission if not already present
                if (!currentPermissions.some(p => p._id === permissionId)) {
                    const permissionToAdd = additionalPermissions.find(p => p._id === permissionId);
                    if (permissionToAdd) {
                        updatedPermissions = [...currentPermissions, permissionToAdd];
                    }
                }
            } else {
                // Remove permission if present
                updatedPermissions = currentPermissions.filter(p => p._id !== permissionId);
            }
            
            return updatedPermissions 
                ? { ...prevUser, permissions: updatedPermissions }
                : prevUser;
        });
    };

    // Save user changes
    const handleSave = async () => {
        if (!user || !selectedDepartment || !selectedRole) {
            toast.error("Please fill all required fields", { position: "top-right" });
            return;
        }
    
        try {
            const deptRoleIds = new Set([
                ...rolePermissions.map(p => p._id),
                ...departmentPermissions.map(p => p._id),
            ]);
    
            // Only include additional permissions not in dept/role
            const additionalOnlyPermissions = user.permissions.filter(
                perm => !deptRoleIds.has(perm._id)
            );
    
            const permissionIds = additionalOnlyPermissions.map(p => p._id);
    
            const response = await axios.put(`${RBAC_BASE_URL}/users/${userId}`, {
                department: selectedDepartment,
                role: selectedRole,
                mintUsername: user.mintUsername,
                insuranceDashboardID: user.insuranceDashboardID,
                permissions: permissionIds,
                emp_status: activeStatus,
            });
    
            if (response.data.success) {
                toast.success(response.data.message || "User updated successfully", {
                    position: "top-right",
                    autoClose: 2000,
                    onClose: () => navigate("/rbac/users"),
                });
            } else {
                toast.error(response.data.message || "Update failed", { position: "top-right" });
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save changes", { position: "top-right" });
        }
    };
    

    if (loading) {
        return (
            <div className="p-6 bg-gray-800 min-h-screen text-white flex justify-center items-center">
                <p>Loading user details...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-800 min-h-screen text-white">
            <ToastContainer />
            <button
                onClick={() => navigate("/rbac/users")}
                className="text-white hover:text-gray-400 mr-4 mb-4 flex items-center gap-2"
            >
                <FaArrowLeft size={20} /> Back
            </button>

            {/* Top Profile Section */}
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center border-2 border-green-700 mb-6 gap-4">
                {/* Left Section - Avatar, Name, Email */}
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full text-white font-bold text-lg md:text-xl ${getAvatorColor(user._id)}`}>
                        {getInitials(user?.name).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-white">{user?.name}</h2>
                        <p className="text-gray-300 text-sm md:text-base">{user?.email}</p>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <select
                        className={`px-3 py-2 md:px-4 md:py-2 font-medium rounded-lg focus:outline-white text-sm md:text-base ${activeStatus === "Active" ? "bg-green-500" : "bg-red-500"}`}
                        value={activeStatus}
                        onChange={(e) => setActiveStatus(e.target.value)}
                    >
                        <option value="Active" className="bg-green-500">Active</option>
                        <option value="Inactive" className="bg-red-500">Inactive</option>
                    </select>
                </div>

                {/* Role & Department Dropdowns / Save Button */}
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
                    <select
                        className="bg-blue-700 text-white px-6 py-2 rounded-lg focus:outline-none w-full md:w-auto text-sm md:text-base"
                        value={selectedDepartment || ""}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="bg-blue-700 text-white px-3 py-2 rounded-lg focus:outline-none w-full md:w-auto text-sm md:text-base"
                        value={selectedRole || ""}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        disabled={!selectedDepartment}
                    >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role._id} value={role._id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleSave}
                        className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-lg focus:outline-none w-full md:w-auto text-sm md:text-base"
                        disabled={!selectedDepartment || !selectedRole}
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Permissions Section */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Container - User Info and Additional Permissions */}
                <div className="lg:w-[40%] bg-gray-900 p-6 rounded-lg shadow-lg border-2 border-gray-700 mb-6">
                    {/* User Info */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">User Info</h3>
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2 text-sm md:text-base">Mint Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none text-sm md:text-base"
                                value={user?.mintUsername || ""}
                                onChange={(e) => setUser({ ...user, mintUsername: e.target.value })}
                                placeholder="Enter Mint username"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2 text-sm md:text-base">Dashboard ID</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none text-sm md:text-base"
                                value={user?.insuranceDashboardID || ""}
                                onChange={(e) => setUser({ ...user, insuranceDashboardID: e.target.value })}
                                placeholder="Enter Dashboard ID"
                            />
                        </div>
                    </div>

                    {/* Additional Permissions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">
                            Additional Permissions
                        </h3>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            {loadingPermissions ? (
                                <div className="text-center py-4 text-gray-400">Loading permissions...</div>
                            ) : additionalPermissions.length > 0 ? (
                                <ul className="space-y-3">
                                    {additionalPermissions.map((perm) => (
                                        <li key={perm._id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-700 rounded">
                                            <span className="text-gray-300 text-sm md:text-base">{perm.name}</span>
                                            <Switch
                                                checked={toggledPermissions[perm._id] || false}
                                                onChange={(checked) => handleToggleChange(perm._id, checked)}
                                                className={`${toggledPermissions[perm._id] ? 'bg-green-500' : 'bg-gray-600'} relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors`}
                                            >
                                                <span
                                                    className={`${toggledPermissions[perm._id] ? 'translate-x-4 md:translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 py-4 text-center text-sm md:text-base">
                                    {selectedDepartment && selectedRole
                                        ? "No additional permissions available"
                                        : "Select a department and role to see additional permissions"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Container - Department and Role Permissions */}
                <div className="lg:w-[60%] flex flex-col lg:flex-row gap-6">
                    {/* Department Permissions */}
                    <div className="lg:w-[50%] bg-gray-900 p-6 rounded-lg shadow-lg border-2 border-gray-700">
                        <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">
                            Department Permissions
                            {selectedDepartment && (
                                <span className="text-sm text-gray-400 ml-2">
                                    ({departments.find(d => d._id === selectedDepartment)?.name || ''})
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-col gap-4">
                            {selectedDepartment ? (
                                departmentPermissions.length > 0 ? (
                                    departmentPermissions.map((perm) => (
                                        <span
                                            key={perm._id}
                                            className="bg-indigo-800 text-white px-3 py-1 rounded-full text-sm md:text-base"
                                        >
                                            {perm.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm md:text-base">No permissions assigned to this department</p>
                                )
                            ) : (
                                <p className="text-gray-400 text-sm md:text-base">Select a department to view permissions</p>
                            )}
                        </div>
                    </div>

                    {/* Role Permissions */}
                    <div className="lg:w-[50%] bg-gray-900 p-6 rounded-lg shadow-lg border-2 border-gray-700">
                        <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">
                            Role Permissions
                            {selectedRole && (
                                <span className="text-sm text-gray-400 ml-2">
                                    ({roles.find(r => r._id === selectedRole)?.name || ''})
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-col gap-4 ">
                            {selectedRole ? (
                                rolePermissions.length > 0 ? (
                                    rolePermissions.map((perm) => (
                                        <span
                                            key={perm._id}
                                            className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm md:text-base"
                                        >
                                            {perm.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm md:text-base">No permissions assigned to this role</p>
                                )
                            ) : (
                                <p className="text-gray-400 text-sm md:text-base">Select a role to view permissions</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditUser;