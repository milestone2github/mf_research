import AdminIndex from "../components/mniveshAdmin/AdminIndex";
import BlogIndex from "../components/mniveshAdmin/blogs/BlogIndex";
import AddBlog from "../components/mniveshAdmin/blogs/AddBlog";
import FixedDepositIndex from "../components/mniveshAdmin/fixedDeposits/FixedDepositIndex";
import AddFixedDeposit from "../components/mniveshAdmin/fixedDeposits/AddFixedDeposit";
import IposIndex from "../components/mniveshAdmin/ipos/IposIndex";
import AddNewIpo from "../components/mniveshAdmin/ipos/AddNewIpo";

export const mniveshAdminRoutes = [
    { to: "", element: <AdminIndex /> },
    { to: "blogs", element: <BlogIndex /> },
    { to: "blogs/add", element: <AddBlog /> },
    { to: "blogs/edit/:slug", element: <AddBlog /> },
    { to: "fixed-deposits", element: <FixedDepositIndex /> },
    { to: "fixed-deposits/add", element: <AddFixedDeposit /> },
    { to: "fixed-deposits/edit/:slug", element: <AddFixedDeposit /> },
    { to: "ipos", element: <IposIndex /> },
    { to: "ipos/add", element: <AddNewIpo /> },
    { to: "ipos/edit/:slug", element: <AddNewIpo /> },
]