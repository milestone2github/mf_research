// ✅ Utility to get the base API URL from environment
const BASE_API = process.env.REACT_APP_API_BASE_URL;

if (!BASE_API) {
  throw new Error("🚨 REACT_APP_API_BASE_URL is not defined in the environment. Please check your .env file.");
}
/* FRONTEND URL CONSTANTS */
export const RBAC_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/rbac`;

export const BASE_URL = (url) => `/api/rbac/${url}`;
export const PERMISSION_URL = (id) => `/api/rbac/permissions/${id}`;
export const DEPARTMENT_URL = (id) => `/api/rbac/depts/${id}`;
export const CATEGORIES_URL = '/api/rbac/categories';
export const ROLES_URL = (param) => `/api/rbac/roles${param}`;

export const FETCH_PERMISSION_URL = new URL(PERMISSION_URL(''), process.env.REACT_APP_API_BASE_URL).href;
export const POST_PERMISSION_URL = (id) => new URL(PERMISSION_URL(id), process.env.REACT_APP_API_BASE_URL).href;
export const DELETE_PERMISSION_URL = (id) => new URL(PERMISSION_URL(id), process.env.REACT_APP_API_BASE_URL).href;

export const FETCH_CATEGORIES_URL = new URL(CATEGORIES_URL, process.env.REACT_APP_API_BASE_URL).href;

export const FETCH_DEPARTMENT_URL = (id) => new URL(DEPARTMENT_URL(id), process.env.REACT_APP_API_BASE_URL).href;
export const POST_DEPARTMENT_URL = new URL(DEPARTMENT_URL(''), process.env.REACT_APP_API_BASE_URL).href;
export const UPDATE_DEPARTMENT_URL = (id) => new URL(DEPARTMENT_URL(id), process.env.REACT_APP_API_BASE_URL).href;
export const DELETE_DEPARTMENT_URL = (id) => new URL(DEPARTMENT_URL(id), process.env.REACT_APP_API_BASE_URL).href;

export const UPDATE_ROLE_URL = (id) => new URL(ROLES_URL(`/${id}`), process.env.REACT_APP_API_BASE_URL).href;
export const POST_ROLE_URL = new URL(ROLES_URL(''), process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_ALL_ROLES_URL = new URL(ROLES_URL(''), process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_ROLES_URL = (deptId) => new URL(ROLES_URL(`?dept=${deptId}`), process.env.REACT_APP_API_BASE_URL).href;
export const DELETE_ROLE_URL = (id) => new URL(ROLES_URL(`/${id}`), process.env.REACT_APP_API_BASE_URL).href;