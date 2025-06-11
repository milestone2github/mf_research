/** WHAT'S HERE: STRING CONSTANTS, MESSAGES, STATIC INFORMATION **/

// General Constants
export const SERVER_RUNNING = (port) => `Server running on http://localhost:${port}/`;
export const SERVER_FAILED = 'Server failed to start: ';
export const CORS_NOT_ALLOWED_ERROR = 'Not allowed by CORS';
export const INTERNAL_SERVER_ERROR = "Internal server error.";
// Users


// Permissions
export const PERMISSION_FETCH_SUCCESS = "Fetching permissions successful.";
export const PERMISSION_FETCH_FAIL = "No permissions found.";
export const PERMISSION_FETCH_FAILED = (id) => `No such permissions with id ${id}.`;
export const PERMISSION_FETCH_ERROR = "Error in fetching individual permissions details.\n";
export const PERMISSION_SERVER_ERROR = (err) => `Internal server error ${err} the permissions.\n`;
export const REQUIRED_PERMISSION_FIELDS_NOT_FOUND = "Name or Key fields not found.";
export const PERMISSION_CREATE_SUCCESS = "Permission created successfully.";
export const PERMISSION_UPDATE_SUCCESS = "Permission updated successfully.";
export const PERMISSION_DELETE_SUCCESS = "Permission deleted successfully and removed with any associations at User, Role and Department.";
export const REMOVE_PERMISSION_FAILED = "Permission deleted but failed to remove it from associated User, Role, and Department.";

// Department
export const DEPARTMENT_FETCH_SUCCESS = "Department data retrieved successfully."
export const DEPARTMENT_FETCH_SUCCESSFUL = 'Department information fetched successfully.';
export const DEPARTMENT_FETCH_FAIL = "No departments found.";
export const DEPARTMENT_FETCH_FAILED = (id) => `No such department with id ${id}.`;
export const DEPARTMENT_FETCH_ERROR = "Error in fetching individual department details.\n";
export const DEPARTMENT_SERVER_ERROR = (err) => `Internal server error ${err} the departments.\n`;
export const DEPARTMENT_EXISTS_IN_DB = "Department with given details already exists in database.";
export const DEPARTMENT_CREATE_SUCCESS = "New department created successfully.";
export const DEPARTMENT_UDPATE_SUCCESS = "Department is updated with new permissions successfully.";
export const DEPARTMENT_DELETE_SUCCESS = "Department deleted successfully along with its associated role.";

// Roles
export const ROLE_FETCH_SUCCESS = "Roles retrieved successfully.";               // For all roles
export const ROLE_FETCH_SUCCESSFUL = "Role information fetched successfully";    // For individual role
export const ROLE_FETCH_FAIL = "No roles found.";
export const ROLE_FETCH_FAILED = (id) => `No such roles with department id ${id}`;
export const ROLE_FETCH_ERROR = "Error in fetching individual role details.\n";
export const ROLES_FETCH_SERVER_ERROR = "Internal server error fetching the roles.\n";
export const ROLE_SERVER_ERROR = (err) => `Internal server error ${err} the roles.\n`;
export const DEPARTMENT_ID_NOT_FOUND = "No department ID found in query parameter.";
export const ROLE_EXISTS_IN_DB = "Role with same permission already exists in DB.";
export const ROLE_CREATE_SUCCESS = "Role created successfully with given permissions.";
export const ROLE_UPDATE_SUCCESS = "Role updated successfully with new permissions.";
export const ROLE_DELETE_SUCCESS = "Role deleted successfully.";

// Category
export const CATEGORY_FETCH_SUCCESS = "Category fetched successfully.";
export const CATEGORY_CREATE_SUCCESS = "Category created successfully.";
export const CATEGORY_EXISTS = "Category already exists in db.";
export const CATEGORY_FETCH_FAIL = "No Categories found.";
export const CATEGORY_CREATE_FAIL = "Unable to create new category.";