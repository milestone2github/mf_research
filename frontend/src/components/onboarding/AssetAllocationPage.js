import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';

const AssetAllocationPage = () => {
  // const { userId } = useParams();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [availableAssets, setAvailableAssets] = useState([
    { name: 'HP Laptop', type: 'Laptop', serial: 'SRN12345678', category: 'Electronics' },
    { name: 'HP Laptop', type: 'Phone', serial: 'SRN12345678', category: 'Electronics' },
    { name: 'HP Laptop', type: 'Pen', serial: 'SRN12345678', category: 'Stationary' },
    { name: 'HP Laptop', type: 'Calculator', serial: 'SRN12345678', category: 'Stationary' }
  ]);

  const [allocatedAssets, setAllocatedAssets] = useState([]);

  const filteredAssets = availableAssets.filter(asset =>
    asset.name.toLowerCase().includes(search.toLowerCase()) &&
    (typeFilter ? asset.type === typeFilter : true) &&
    (categoryFilter ? asset.category === categoryFilter : true)
  );

  const handleAllocate = (index) => {
    const asset = filteredAssets[index];
    setAllocatedAssets([...allocatedAssets, asset]);
    setAvailableAssets(availableAssets.filter((_, i) => i !== index));
  };

  const handleDeallocate = (index) => {
    const asset = allocatedAssets[index];
    setAvailableAssets([...availableAssets, asset]);
    setAllocatedAssets(allocatedAssets.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Allocate Assets</h2>

      {/* Top box - Employee info */}
      <div className="border rounded p-4 mb-6">
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> john@example.com</p>
        <p><strong>Role:</strong> Backend Developer</p>
        <p><strong>Department:</strong> IT Desk</p>
      </div>

      {/* Available Assets Section */}
      <h3 className="text-lg font-medium mb-2">Available assets</h3>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets"
          className="border p-2 rounded"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Type</option>
          <option value="Laptop">Laptop</option>
          <option value="Phone">Phone</option>
          <option value="Pen">Pen</option>
          <option value="Calculator">Calculator</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border p-2 rounded">
          <option value="">Category</option>
          <option value="Electronics">Electronics</option>
          <option value="Stationary">Stationary</option>
        </select>
      </div>

      <div className="border rounded max-h-64 overflow-y-auto p-2 mb-6">
        {filteredAssets.length === 0 ? (
          <p className="text-gray-500">No assets available to allocate.</p>
        ) : (
          filteredAssets.map((asset, index) => (
            <div key={index} className="flex justify-between items-center border-b py-2">
              <div>{asset.name} | {asset.type} | {asset.serial} | {asset.category}</div>
              <button onClick={() => handleAllocate(index)} className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50">Allocate</button>
            </div>
          ))
        )}
      </div>

      {/* Allocated Assets Section */}
      <h3 className="text-lg font-medium mb-2">Allocated assets</h3>
      <div className="border rounded p-2">
        {allocatedAssets.length === 0 ? (
          <p className="text-gray-500">No assets allocated yet.</p>
        ) : (
          allocatedAssets.map((asset, index) => (
            <div key={index} className="flex justify-between items-center border-b py-2">
              <div>{asset.name} | {asset.type} | {asset.serial} | {asset.category}</div>
              <button onClick={() => handleDeallocate(index)} className="px-3 py-1 text-sm text-orange-600 border border-orange-600 rounded hover:bg-orange-50">Deallocate</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssetAllocationPage;
