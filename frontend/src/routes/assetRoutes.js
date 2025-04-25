import AddEditAsset from "../components/assets/AddEditAsset";
import AssetIndex from "../components/assets/AssetIndex";

export const assetRoutes = [
    { to: '', element: <AssetIndex /> },
    { to: 'add', element: <AddEditAsset /> },
    { to: 'edit/:id', element: <AddEditAsset /> },

]