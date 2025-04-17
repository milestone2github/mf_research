import React from 'react';
import AssetActions from './AssetActions';

const AssetList = ({ assets, setModalData, fetchAssets }) => {
  return (
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        <tr className="bg-gray-100 text-sm">
          <th className="py-2 px-4 border-b">Name</th>
          <th className="py-2 px-4 border-b">Type</th>
          <th className="py-2 px-4 border-b">Serial No</th>
          <th className="py-2 px-4 border-b">Category</th>
          <th className="py-2 px-4 border-b">Allocated To</th>
          <th className="py-2 px-4 border-b">Status</th>
          <th className="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        {assets.map(asset => (
          <tr key={asset._id} className="hover:bg-gray-50">
            <td className="py-2 px-4 border-b text-center">{asset.name}</td>
            <td className="py-2 px-4 border-b text-center">{asset.type?.name || '-'}</td>
            <td className="py-2 px-4 border-b text-center">{asset.serialNumber}</td>
            <td className="py-2 px-4 border-b text-center">{asset.type?.category?.name || ''}</td>
            <td className="py-2 px-4 border-b text-center">{asset.allocatedTo?.name || '-'}</td>
            <td className="py-2 px-4 border-b text-center">{asset.status}</td>
            <td className="py-2 px-4 border-b">
              <AssetActions
                asset={asset}
                setModalData={setModalData}
                fetchAssets={fetchAssets}
                // refreshAsset={refreshAsset}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AssetList;
