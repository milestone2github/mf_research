/** THIS FILE CONTAINS ALL THE URL EXTENSION ROUTES **/

// mnivesh Admin Dashboard
// Blogs
export const BLOG_URL = (ext) => `/api/mnivesh/admin/blogs/${ext}`;
export const BLOG_IMAGE = (image) => `/images/blog/${image}`;

// Fixed Deposits
export const COMPANY_LOGO =  (image) => `/storage/deposit/${image}`;  // CHECK
export const FD_URL = (ext) => `/api/mnivesh/admin/fixed-deposits/${ext}`;
export const FD_URL2 = (ext) => `/api/mnivesh/admin/fixed-diposits/${ext}`; // URL with 'diposits' mentioned

// IPOs
export const IPO_URL = (ext) => `/api/mnivesh/admin/ipos/${ext}`;

// Assets
export const BASE_ASSET = (data) => `/api/assets/${data}`;
export const BASE_ASSET2 = (id) => `/api/assets/types/${id}`;
export const BASE_USER = `/api/users`;
export const FETCH_ALL_ASSETS = `/api/assets`;
export const FETCH_ALL_CATEGORIES = `/api/assets/types?allCat=true`;
export const FETCH_ALL_TYPES = `/api/assets/types`;
export const CREATE_ASSET = '/api/assets';
export const CREATE_CATEGORY = '/api/assets/categories';
export const CREATE_TYPE = '/api/assets/types';
export const ASSIGNED_ASSETS_ENDPOINT = '/api/assets/assigned';

export const FETCH_ALL_USERS_URL = new URL(BASE_USER, process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_ASSETS_URL = new URL(FETCH_ALL_ASSETS, process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_SINGLE_ASSET_URL = (id) => new URL(BASE_ASSET(id), process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_ASSET_BASED_ON_TYPE = (id) => new URL(BASE_ASSET2(id), process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_ASSIGNED_ASSETS = new URL(ASSIGNED_ASSETS_ENDPOINT, process.env.REACT_APP_API_BASE_URL).href;

export const FETCH_CATEGORIES_URL = new URL(FETCH_ALL_CATEGORIES, process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_TYPES_URL = new URL(FETCH_ALL_TYPES, process.env.REACT_APP_API_BASE_URL).href;
export const FETCH_TYPES_BASED_ON_CAT_URL = (cat) => new URL(BASE_ASSET(`types?cat=${cat}`), process.env.REACT_APP_API_BASE_URL).href;
export const CREATE_ASSET_URL = new URL(CREATE_ASSET, process.env.REACT_APP_API_BASE_URL).href;
export const CREATE_CATEGORY_URL = new URL(CREATE_CATEGORY, process.env.REACT_APP_API_BASE_URL).href;
export const CREATE_TYPE_URL = new URL(CREATE_TYPE, process.env.REACT_APP_API_BASE_URL).href;
export const CHANGE_STATUS_URL = (id, status) => new URL(BASE_ASSET(`${id}/${status}`), process.env.REACT_APP_API_BASE_URL).href;
export const UPDATE_ASSET_URL = (id) => new URL(BASE_ASSET(id), process.env.REACT_APP_API_BASE_URL).href;

export const REMOVE_ASSET_URL = (id) => new URL(BASE_ASSET(id), process.env.REACT_APP_API_BASE_URL).href;