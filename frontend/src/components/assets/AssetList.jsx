import React from 'react';
import AssetActions from './AssetActions';

const AssetList = ({ assets, setModalData, fetchAssets, selectedFilters, loading }) => {
  return (
    <table className="min-w-full bg-white border border-gray-200 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-4 border-b whitespace-nowrap">Asset Code</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Asset Name</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Brand</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Model No</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Serial No</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Type</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Category</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Merchant</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Date of Purchase</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Warranty Expiry</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Allocated To</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Status</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Remarks</th>
          <th className="py-2 px-4 border-b whitespace-nowrap">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="15" className="p-8">
              <div className="flex items-center justify-center gap-3 text-gray-600">
                <span className="inline-block h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                Loading assets...
              </div>
            </td>
          </tr>
        ) : assets.length ? (
         assets.map(asset => {
        const lastAllocation = asset.allocations?.length
          ? asset.allocations[asset.allocations.length - 1]
          : null;

        const allocatedName =
          asset.status === 'allocated'
            ? lastAllocation?.userId?.name || '-'
            : '-';

        return (
          <tr key={asset._id} className="hover:bg-gray-50">
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.assetCode || '-'}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.assetName || '-'}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.brandName || '-'}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.modelNumber || '-'}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.serialNumber}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.type?.name || '-'}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.type?.category?.name || '-'}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.merchantId?.name || '-'}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">
              {asset.dateOfPurchase ? new Date(asset.dateOfPurchase).toLocaleDateString() : '-'}
            </td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">
              {asset.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate).toLocaleDateString() : '-'}
            </td>

            <td className="py-2 px-4 border-b text-center whitespace-nowrap">
              {allocatedName}
            </td>

            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.status}</td>
            <td className="py-2 px-4 border-b text-center whitespace-nowrap">{asset.remarks || '-'}</td>
            <td className="py-2 px-4 border-b whitespace-nowrap">
              <AssetActions
                asset={asset}
                setModalData={setModalData}
                fetchAssets={fetchAssets}
                selectedFilters={selectedFilters}
              />
            </td>
          </tr>
        );
      })

        ) : (
          <tr>
            <td colSpan="15" className="text-center p-4 text-gray-600">
              No assets found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AssetList;
