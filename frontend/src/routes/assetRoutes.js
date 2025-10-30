import AddEditAsset from "../components/assets/AddEditAsset";
import AssetIndex from "../components/assets/AssetIndex";
import AssignedAssetsList from "../components/assets/AssignedAssetsList";
import AssetDashboard from "../components/assets/AssetDashboard";
import ManageMerchants from "../components/assets/ManageMerchants";
import ManageAssetTypes from "../components/assets/ManageAssetTypes";
import ManageCategories from "../components/assets/ManageCategories";

export const assetRoutes = [
    { to: '', element: <AssetDashboard /> },         
    { to: 'manage', element: <AssetIndex /> }, 
    { to: 'add', element: <AddEditAsset /> },
    { to: 'edit/:id', element: <AddEditAsset /> },
    { to: 'assigned', element: <AssignedAssetsList /> },
    { to: 'merchants', element: <ManageMerchants /> },
    { to: 'types', element: <ManageAssetTypes /> },
    { to: 'categories', element: <ManageCategories /> },
]