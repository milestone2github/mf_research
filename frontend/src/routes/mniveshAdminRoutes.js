import AddBlog from "../components/mniveshAdmin/blogs/AddBlog";
import BlogIndex from "../components/mniveshAdmin/blogs/BlogIndex";
import AdminIndex from "../components/mniveshAdmin/AdminIndex";

export const mniveshAdminRoutes = [
    { to: "", element: <AdminIndex /> },
    { to: "blogs", element: <BlogIndex /> },
    { to: "blogs/add", element: <AddBlog /> },
    { to: "blogs/edit/:slug", element: <AddBlog /> }
]