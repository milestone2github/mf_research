/** THIS FILE CONTAINS ALL THE URL EXTENSION ROUTES **/

// mnivesh Admin Dashboard
// Blogs
export const BLOG_URL = (ext) => `/api/mnivesh/admin/blogs/${ext}`;
export const BLOG_IMAGE = (image) => `/images/blog/${image}`;

// Fixed Deposits
export const COMPANY_LOGO =  (image) => `/images/fixed-deposit/${image}`;  // CHECK
export const FD_URL = (ext) => `/api/mnivesh/admin/fixed-deposits/${ext}`;

// IPOs
export const IPO_URL = (ext) => `/api/mnivesh/admin/ipos/${ext}`;
