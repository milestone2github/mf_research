import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHANGE_STATUS_URL } from '../../utils/urlConstants';
import axios from 'axios';
import AllocateAssetModal from './AllocateAssetModal';

const AssetActions = ({ asset, setModalData, fetchAssets, selectedFilters }) => {
  const { status, allocatedTo, _id, serialNumber } = asset;
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus, extraBody = {}) => {
    try {
      await axios.patch(CHANGE_STATUS_URL(_id, newStatus), extraBody, {
        withCredentials: true
      });
      fetchAssets({ type: selectedFilters.type });
    } catch (err) {
      console.error(`Failed to ${newStatus} asset`, err);
    }
  };

  // Handle Allocate option modal
  const handleAllocate = () => {
    setShowAllocateModal(true);
  };
  const handleConfirmAllocate = async (userId, remarks) => {
    try {
      await handleStatusChange('allocate', {
        assignedTo: userId,
        remarks,
      });
      setShowAllocateModal(false);
    } catch (err) {
      console.error('Failed to allocate asset', err);
    }
  };

  const handleDeallocate = () => handleStatusChange('deallocate');
  const handleRepair = () => handleStatusChange('repair');
  const handleRestore = () => handleStatusChange('restore');

  const handleRemove = async () => {
    const confirm = window.confirm(`Do you want to delete this asset?\nAffected asset: ${asset.name}`);
    if (!confirm) return;
    handleStatusChange('remove');
  };

  const handleEdit = (id) => {
    navigate(`/assets/edit/${id}`);
  }

  return (
    <div className="relative">
      <div className="flex gap-2 flex-nowrap">
        {/* Allocate and Deallocate */}
        {
          status === 'available' ? (
            <button  onClick={(e) => { e.stopPropagation(); handleAllocate(); }} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white">
              Allocate
            </button>
          ) : status === 'allocated' ? (
            <button onClick={(e) => { e.stopPropagation(); handleDeallocate(); }} className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-400 text-white">
              Deallocate
            </button>
          ) : null
        }

      {/* Repair / Restore */}
      {status === 'repair' ? (
        <button
          onClick={(e) => { e.stopPropagation(); handleRestore(); }}
          className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-400 text-white"
        >
          Restore
        </button>
      ) : (
        <button
          disabled={status !== 'available'}
          className={`px-3 py-1 text-sm rounded ${status === 'available' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-gray-300 text-gray-600'}`}
           onClick={(e) => { e.stopPropagation(); handleRepair(); }}
        >
          Repair
        </button>
      )}

        {/* Edit */}
        <button
          className="px-5 py-2 text-sm rounded bg-slate-500 hover:bg-slate-400 text-white"
          onClick={(e) => { e.stopPropagation(); handleEdit(_id); }}
        >
          Edit
        </button>

        {/* Remove and Restore */}
        {status === 'removed' ? (
          <button
          onClick={(e) => { e.stopPropagation(); handleRestore(); }}
          className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white"
          >
            Restore
          </button>
        ) : (
          <button
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          disabled={status !== 'available'}
          className={`px-3 py-1 rounded ${
            status === 'available'
            ? 'bg-red-500 text-white'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
          >
            Remove
          </button>
        )}

      <AllocateAssetModal
        show={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        asset={asset}
        onAllocate={handleConfirmAllocate}
      />
      </div>
    </div>
  );
};

export default AssetActions;