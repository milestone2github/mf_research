import React from 'react';
import AssetActions from './AssetActions';

function AssetList({ assets, onEdit, refresh }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Serial Number</th>
          <th>Allocated To</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset._id}>
            <td>{asset.name}</td>
            <td>{asset.category}</td>
            <td>{asset.serialNumber}</td>
            <td>{asset.allocatedTo || '-'}</td>
            <td>{asset.status}</td>
            <td>
              <button onClick={() => onEdit(asset)}>Edit</button>
              <AssetActions asset={asset} refresh={refresh} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AssetList;
