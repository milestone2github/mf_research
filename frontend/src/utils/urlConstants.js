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
