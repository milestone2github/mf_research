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
import Protected from "../components/common/Protected";

export const centralRbacRoutes = [
    { to: "", element: <Homepage /> },
    { to: "users", element: <UserManagementDashboard /> },
    { to: "users/:userId", element: <EditUser /> },
    { to: "addUser", element: <AddUser /> },
    { to: "permissions", element: <PermissionIndex /> },
    { to: "departments", element: <DepartmentIndex /> },
    { to: "departments/add", element: <AddEditDepartment /> },
    { to: "departments/edit/:id", element: <AddEditDepartment /> },
    { to: "roles", element: <RolesIndex /> },
    { to: "roles/manage", element: <RolesIndex /> },
    { to: "roles/add/:deptId", element: <AddEditRoles /> },
    { to: "roles/edit/:deptId", element: <AddEditRoles /> },
    { to: "nfohyperlinks", element: <NfoHyperlinks /> },
    { to: "admin", element: <Protected requiredInternalRole={["Super Admin"]}><AdminList /></Protected> },
];