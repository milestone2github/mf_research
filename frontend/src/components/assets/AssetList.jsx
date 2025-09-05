import React from 'react';
import AssetActions from './AssetActions';

const AssetList = ({ assets, setModalData, fetchAssets, selectedFilters, loading }) => {
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
        {loading ? (
          <tr>
            <td colSpan="7" className="p-8">
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <span className="inline-block h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                Loading assets...
              </div>
            </td>
          </tr>
        ) : assets.length ? (
          assets.map(asset => (
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
                  selectedFilters={selectedFilters}
                />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center p-4 text-gray-600">
              No assets found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AssetList;
