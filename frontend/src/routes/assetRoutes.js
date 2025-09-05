import AddEditAsset from "../components/assets/AddEditAsset";
import AssetIndex from "../components/assets/AssetIndex";
import AssignedAssetsList from "../components/assets/AssignedAssetsList";

export const assetRoutes = [
    { to: '', element: <AssetIndex /> },
    { to: 'add', element: <AddEditAsset /> },
    { to: 'edit/:id', element: <AddEditAsset /> },
    { to: 'assigned', element: <AssignedAssetsList /> },
]