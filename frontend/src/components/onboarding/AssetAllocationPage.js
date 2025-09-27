import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FETCH_ASSETS_URL,
} from '../../utils/urlConstants';

const AssetAllocationPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]); // NEW: keep a copy of full list from server
  const [pendingOps, setPendingOps] = useState({}); 
 // pendingOps shape: { [assetId]: { op: 'allocate'|'deallocate', to: 'userId', remarks?: string } }
  const targetUserId = String(userInfo?.user?._id || userInfo?._id || userId);
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
      const all = data.data;
      setAllAssets(all); // NEW
      const available = all.filter(asset => asset.status === 'available');
      const allocated = all.filter(asset => String(asset.allocatedTo?._id) === String(userId) || String(asset.allocatedTo) === String(userId));
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

  // const refreshAll = async () => {
  //   await fetchUserInfo();
  //   await fetchAssets();
  // };

  const handleAllocate = (assetId, remarks = '') => {
    setPendingOps(prev => ({
      ...prev,
      [assetId]: { op: 'allocate', to: targetUserId, remarks }
    }));
  };

  const handleDeallocate = (assetId) => {
    setPendingOps(prev => ({
      ...prev,
      [assetId]: { op: 'deallocate' }
    }));
  };

   const handleAllocationDone = async () => { 
  const ops = Object.entries(pendingOps).map(([assetId, op]) => ({
    assetId,
    op: op.op,
    assignedTo: op.to || undefined,
    remarks: op.remarks || ''
  }));

  if (ops.length === 0) {
    toast.info('No staged changes.');
    return;
  }

  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const targetUserId = String(userInfo?.user?._id || userInfo?._id || userId);

  try {
    const bulkRes = await fetch(`${API_BASE}/api/assets/bulk/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        assets: ops,
        userId: targetUserId  
      }),
    });

    if (bulkRes.ok) {
      setAllAssets(prev =>
        prev.map(asset => {
          const op = ops.find(o => o.assetId === asset._id);
          if (!op) return asset;

          if (op.op === 'allocate') {
            return { ...asset, status: 'allocated', allocatedTo: { _id: targetUserId } };
          }
          if (op.op === 'deallocate') {
            return { ...asset, status: 'available', allocatedTo: null };
          }
          return asset;
        })
      );

      setPendingOps({});
      setHasAssetsAllocated(true);
      toast.success('Changes saved');
      navigate('/onboarding');  

      return;
    }

    // fallback handling unchanged...
  } catch (e) {
    console.warn('Bulk endpoint not available, falling back...', e);
  }
};





  // --- Overlay helpers (staging) ---
  const getEffectiveStatus = (asset) => {
    const op = pendingOps[asset._id];
    if (!op) return asset.status;
    return op.op === 'allocate' ? 'allocated' : 'available';
  };
  const getEffectiveAllocatedTo = (asset) => {
    const op = pendingOps[asset._id];
    if (!op) return asset.allocatedTo;
    return op.op === 'allocate' ? targetUserId : null;
  };

  // Apply overlay to ALL assets we know
  const allWithOverlay = (allAssets.length ? allAssets : [...availableAssets, ...allocatedAssets]).map(a => ({
    ...a,
    __effectiveStatus: getEffectiveStatus(a),
    __effectiveAllocatedTo: getEffectiveAllocatedTo(a),
  }));

  // Visible AVAILABLE (with your existing filters)
  const visibleAvailable = allWithOverlay.filter(asset =>
    asset.__effectiveStatus === 'available' &&
    asset.name.toLowerCase().includes(search.toLowerCase()) &&
    (!type || asset.type?.name === type) &&
    (!category || asset.type?.category?.name === category)
  );

  // Visible ALLOCATED to THIS user (tab 2)
  const visibleAllocated = allWithOverlay.filter(asset => {
    if (asset.__effectiveStatus !== 'allocated') return false;
    const at = asset.__effectiveAllocatedTo;
    const atId = typeof at === 'string' ? at : at?._id || at?.id || null;
    return String(atId) === String(targetUserId);
  });

  

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
            {visibleAvailable.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">No assets available.</td></tr>
            ) : (
              visibleAvailable.map((asset) => (
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
            {visibleAllocated.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">No assets allocated.</td></tr>
            ) : (
              visibleAllocated.map((asset) => (
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
