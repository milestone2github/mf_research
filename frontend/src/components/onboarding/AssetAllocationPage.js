import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FETCH_ASSETS_URL,
  CHANGE_STATUS_URL
} from '../../utils/urlConstants';

const AssetAllocationPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const [hasAssetsAllocated, setHasAssetsAllocated] = useState();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
 

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/onboarding/onboarding-details/${userId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setUserInfo(data.data || null);
        setHasAssetsAllocated(data.data?.onboarding?.
          hasAssestAllocated
           || false);
        
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  }, [userId]);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch(FETCH_ASSETS_URL, { credentials: 'include' });
      const data = await res.json();
      if (data?.data) {
        const allAssets = data.data;
        const available = allAssets.filter(asset => asset.status === 'available');
        const allocated = allAssets.filter(asset => asset.allocatedTo?._id === userId);
        setAvailableAssets(available);
        setAllocatedAssets(allocated);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserInfo();
    fetchAssets();
  }, [fetchUserInfo, fetchAssets]);

  const refreshAll = async () => {
    await fetchUserInfo();
    await fetchAssets();
  };

  const handleAllocate = async (assetId) => {
    try {
      const res = await fetch(CHANGE_STATUS_URL(assetId, 'allocate'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ allocatedTo: userId })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(' Allocation successful');
        // setHasAssetsAllocated(false); // Show button again
       
        refreshAll();
      } else {
        toast.error(result.message || 'Allocation failed');
      }
    } catch (err) {
      console.error('Allocation failed:', err);
      toast.error('Allocation failed');
    }
  };

  const handleDeallocate = async (assetId) => {
    try {
      const res = await fetch(CHANGE_STATUS_URL(assetId, 'deallocate'), {
        method: 'PATCH',
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(' Deallocation successful');
        // setHasAssetsAllocated(false); // Show button again
        
        refreshAll();
      } else {
        toast.error(result.message || 'Deallocation failed');
      }
    } catch (err) {
      console.error('Deallocation failed:', err);
      toast.error('Deallocation failed');
    }
  };

  const handleAllocationDone = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/onboarding/update-allocation-status/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(' Marked allocation as done');
        
        setHasAssetsAllocated(true);
      } else {
        toast.error(result.message || 'Failed to mark as done');
      }
    } catch (err) {
      console.error('Failed to update allocation status:', err);
      toast.error('Server Error');
    }
  };

  const filteredAssets = availableAssets.filter(asset =>
    asset.name.toLowerCase().includes(search.toLowerCase()) &&
    (!type || asset.type?.name === type) &&
    (!category || asset.type?.category?.name === category)
  );

  

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-blue-600 hover:underline">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-6">Allocate Assets</h2>

      {/* User Info */}
      <div className="bg-white border rounded-lg p-4 shadow mb-8 text-sm">
        {userInfo ? (
          <table className="table-auto w-full text-left">
            <thead className="text-xs text-gray-500 border-b">
              <tr>
                <th className="pb-2">Name</th>
                <th className="pb-2">Personal Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Department</th>
              </tr>
            </thead>
            <tbody className="text-base font-semibold text-gray-800">
              <tr>
                <td className="py-1">{userInfo.onboarding?.hrFilledInfo?.name || '-'}</td>
                <td className="py-1">{userInfo.onboarding?.hrFilledInfo?.personalEmail || '-'}</td>
                <td className="py-1">{userInfo.role?.name || userInfo.onboarding?.hrFilledInfo?.role || '-'}</td>
                <td className="py-1">{userInfo.department?.name || userInfo.onboarding?.hrFilledInfo?.department || '-'}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>

      {/* Filters + Button */}
      <div className="mb-4 flex items-center gap-4">
        <h3 className="font-semibold">Available assets</h3>
        {(!hasAssetsAllocated ) && (
          <button
            onClick={handleAllocationDone}
            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Allocation Done
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets"
          className="border p-2 rounded w-1/3"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="border p-2 rounded w-1/4">
          <option value="">Type</option>
          {[...new Set(availableAssets.map(a => a.type?.name))].map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded w-1/4">
          <option value="">Category</option>
          {[...new Set(availableAssets.map(a => a.type?.category?.name))].map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Available Assets Table */}
      <div className="border rounded-lg p-4 mb-6 shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Asset Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Serial</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">No assets available.</td></tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset._id} className="border-t">
                  <td className="px-4 py-2">{asset.name}</td>
                  <td className="px-4 py-2">{asset.type?.name}</td>
                  <td className="px-4 py-2">{asset.serialNumber}</td>
                  <td className="px-4 py-2">{asset.type?.category?.name}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleAllocate(asset._id)}
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

      {/* Allocated Assets Table */}
      <div className="border rounded-lg p-4 shadow">
        <h3 className="font-semibold mb-4">Allocated assets</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Asset Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Serial</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allocatedAssets.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">No assets allocated.</td></tr>
            ) : (
              allocatedAssets.map((asset) => (
                <tr key={asset._id} className="border-t">
                  <td className="px-4 py-2">{asset.name}</td>
                  <td className="px-4 py-2">{asset.type?.name}</td>
                  <td className="px-4 py-2">{asset.serialNumber}</td>
                  <td className="px-4 py-2">{asset.type?.category?.name}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeallocate(asset._id)}
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
  );
};

export default AssetAllocationPage;
