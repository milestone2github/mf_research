import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AssetAllocationPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null); // ✅ fetched user data

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/onboarding/onboarding-details/${userId}`);
        const data = await res.json();
        if (data.success) {
          setUserInfo(data.data ?data.data:null);
          
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUserInfo();
  }, [userId]);

  // Dummy asset states (you already have this)
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [availableAssets, setAvailableAssets] = useState([
    { name: 'HP Laptop', type: 'Laptop', serial: 'SRN12345678', category: 'Electronics' },
    { name: 'HP Laptop', type: 'Phone', serial: 'SRN12345678', category: 'Electronics' },
    { name: 'HP Laptop', type: 'Pen', serial: 'SRN12345678', category: 'Stationary' },
    { name: 'HP Laptop', type: 'Calculator', serial: 'SRN12345678', category: 'Stationary' },
    { name: 'HP Laptop', type: 'Mouse', serial: 'SRN12345678', category: 'Electronics' },
    { name: 'HP Laptop', type: 'Keyboard', serial: 'SRN12345678', category: 'Electronics' },
  ]);
  const [allocatedAssets, setAllocatedAssets] = useState([]);

  const handleAllocate = (index) => {
    const asset = availableAssets[index];
    setAvailableAssets(prev => prev.filter((_, i) => i !== index));
    setAllocatedAssets(prev => [...prev, asset]);
  };

  const handleDeallocate = (index) => {
    const asset = allocatedAssets[index];
    setAllocatedAssets(prev => prev.filter((_, i) => i !== index));
    setAvailableAssets(prev => [...prev, asset]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-blue-600 hover:underline">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-6">Allocate Assets</h2>

      {/* User info box */}
      <div className="bg-white border rounded-lg p-4 shadow mb-8 flex justify-between text-sm font-medium">
        {userInfo ? (
          <>
            <span><strong>Name:</strong> {userInfo.onboarding?.hrFilledInfo?.name || '-'}</span>
            <span><strong>Email:</strong> {userInfo.onboarding?.hrFilledInfo?.personalEmail || userInfo.email}</span>
            <span><strong>Role:</strong> {userInfo.onboarding?.hrFilledInfo?.role || '-'}</span>
            <span><strong>Department:</strong> {userInfo.onboarding?.hrFilledInfo?.department || '-'}</span>
          </>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>

      {/* Search Filters */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Available assets</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets"
            className="border p-2 rounded w-1/3"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded w-1/4"
          >
            <option value="">Type</option>
            <option value="Laptop">Laptop</option>
            <option value="Phone">Phone</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded w-1/4"
          >
            <option value="">Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Stationary">Stationary</option>
          </select>
        </div>
      </div>

      {/* Available Assets Table */}
      <div className="border rounded-lg p-4 mb-6 shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Asset Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Serial Number</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
        </table>
        <div className="max-h-60 overflow-y-auto mt-2">
          <table className="w-full text-sm">
            <tbody>
              {availableAssets.length === 0 ? (
                <tr><td className="p-4" colSpan={5}>No assets available to allocate.</td></tr>
              ) : (
                availableAssets.map((asset, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{asset.name}</td>
                    <td className="px-4 py-2">{asset.type}</td>
                    <td className="px-4 py-2">{asset.serial}</td>
                    <td className="px-4 py-2">{asset.category}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleAllocate(index)}
                        className="text-green-600 border border-green-600 px-2 py-1 rounded hover:bg-green-50 text-xs"
                      >
                        Allocate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocated Assets Table */}
      <div className="border rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-4">Allocated assets</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Asset Name</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Serial Number</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
        </table>
        <div className="max-h-60 overflow-y-auto mt-2">
          <table className="w-full text-sm">
            <tbody>
              {allocatedAssets.length === 0 ? (
                <tr><td className="p-4" colSpan={5}>No assets allocated yet.</td></tr>
              ) : (
                allocatedAssets.map((asset, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{asset.name}</td>
                    <td className="px-4 py-2">{asset.type}</td>
                    <td className="px-4 py-2">{asset.serial}</td>
                    <td className="px-4 py-2">{asset.category}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeallocate(index)}
                        className="text-orange-600 border border-orange-600 px-2 py-1 rounded hover:bg-orange-50 text-xs"
                      >
                        Deallocate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

     
  );
};

export default AssetAllocationPage;
