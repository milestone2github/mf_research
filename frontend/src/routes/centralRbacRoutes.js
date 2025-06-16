import Homepage from "../centralRbac/src/pages/Homepage";
import UserManagementDashboard from "../centralRbac/src/pages/UserManagementDashboard";
import PermissionIndex from "../centralRbac/src/components/PermissionManagement/PermissionIndex";
import AddEditDepartment from "../centralRbac/src/components/DepartmentManagement/AddEditDepartment";
import DepartmentIndex from "../centralRbac/src/components/DepartmentManagement/DepartmentIndex";
import RolesIndex from "../centralRbac/src/components/RolesManagement/RolesIndex";
import AddEditRoles from "../centralRbac/src/components/RolesManagement/AddEditRoles";
import NfoHyperlinks from "../centralRbac/src/components/NFOhyperlinks/NfoHyperlinks";
import AdminList from "../centralRbac/src/components/AdminManagement/AdminList";
import EditUser from "../centralRbac/src/pages/UserActions/EditUser";
import AddUser from "../centralRbac/src/pages/UserActions/AddUser";
import { ProtectedRoute } from "../centralRbac/src/pages/ProtectedRoute/ProtectedRoute";

export const centralRbacRoutes = [
    { to: "", element: <ProtectedRoute allowedRoles="Admin"><Homepage /></ProtectedRoute> },
    { to: "users", element: <ProtectedRoute allowedRoles="Admin"><UserManagementDashboard /></ProtectedRoute> },
    { to: "users/:userId", element: <ProtectedRoute allowedRoles="Admin"><EditUser /></ProtectedRoute> },
    { to: "addUser", element: <ProtectedRoute allowedRoles="Admin"><AddUser /></ProtectedRoute> },
    { to: "permissions", element: <ProtectedRoute allowedRoles="Admin"><PermissionIndex /></ProtectedRoute> },
    { to: "departments", element: <ProtectedRoute allowedRoles="Admin"><DepartmentIndex /></ProtectedRoute> },
    { to: "departments/add", element: <ProtectedRoute allowedRoles="Admin"><AddEditDepartment /></ProtectedRoute> },
    { to: "departments/edit/:id", element: <ProtectedRoute allowedRoles="Admin"><AddEditDepartment /></ProtectedRoute> },
    { to: "roles", element: <ProtectedRoute allowedRoles="Admin"><RolesIndex /></ProtectedRoute> },
    { to: "roles/manage", element: <ProtectedRoute allowedRoles="Admin"><RolesIndex /></ProtectedRoute> },
    { to: "roles/add/:deptId", element: <ProtectedRoute allowedRoles="Admin"><AddEditRoles /></ProtectedRoute> },
    { to: "roles/edit/:deptId", element: <ProtectedRoute allowedRoles="Admin"><AddEditRoles /></ProtectedRoute> },
    { to: "nfohyperlinks", element: <ProtectedRoute allowedRoles="Admin"><NfoHyperlinks /></ProtectedRoute> },
    { to: "admin", element: <ProtectedRoute allowedRoles="Super Admin"><AdminList /></ProtectedRoute> },
];