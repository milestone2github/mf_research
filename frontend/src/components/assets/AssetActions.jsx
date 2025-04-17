import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHANGE_STATUS_URL, REMOVE_ASSET_URL } from '../../utils/urlConstants';
import axios from 'axios';
import AllocateAssetModal from './AllocateAssetModal';

const AssetActions = ({ asset, setModalData, fetchAssets }) => {
  const { status, allocatedTo, _id, serialNumber } = asset;
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const navigate = useNavigate();

  // const isAllocated = !!allocatedTo;

  // const canAllocate   = status === 'available' && !allocatedTo;
  // const canDeallocate = Boolean(allocatedTo);

  const handleStatusChange = async (newStatus, extraBody = {}) => {
    try {
      await axios.patch(CHANGE_STATUS_URL(_id, newStatus), extraBody, {
        withCredentials: true
      });
      fetchAssets();
      // await fetchUpdatedAsset(); // refresh this asset only
    } catch (err) {
      console.error(`Failed to ${newStatus} asset`, err);
    }
  };

  // const fetchUpdatedAsset = async () => {
  //   try {
  //     const res = await axios.get(`/api/assets/${_id}`);
  //     setAsset(res.data); // assuming you have `setAsset` from useState
  //   } catch (err) {
  //     console.error('Failed to fetch updated asset', err);
  //   }
  // };

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
      // refreshAsset(userId)
      setShowAllocateModal(false);
    } catch (err) {
      console.error('Failed to allocate asset', err);
    }
  };

  // const handleAllocate = () => handleStatusChange('allocated', { assignedTo: selectedUser });
  const handleDeallocate = () => handleStatusChange('deallocate');
  const handleRepair = () => handleStatusChange('repair');
  const handleRestore = () => handleStatusChange('restore');
  // const handleRemove = () => handleStatusChange('removed');
  

  const handleRemove = async () => {
    const confirm = window.confirm(`Do you want to delete this asset?\nAffected asset: ${asset.name}`);
    if (!confirm) return;
    handleStatusChange('remove');
  };

  const handleEdit = (id) => {
    navigate(`/assets/edit/${id}`);
  }


  // const handleRemove = () => {
  //   setModalData({
  //     show: true,
  //     deleteTitle: `Delete ${asset.name}?`,
  //     deleteUrl: REMOVE_ASSET_URL(_id)
  //   });
  // };

  return (
    <div className="relative">
      <div className="flex gap-2 flex-wrap">
        {/* Allocate and Deallocate */}
        {
          status === 'available' ? (
            <button onClick={handleAllocate} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white">
              Allocate
            </button>
          ) : status === 'allocated' ? (
            <button onClick={handleDeallocate} className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-400 text-white">
              Deallocate
            </button>
          ) : null
        }

{/* 
        <button
        onClick={handleAllocate}
          disabled={!canAllocate}
          className={`px-3 py-1 text-sm rounded ${!canAllocate && status === 'available' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
        >
          Allocate
          </button>

          <button
          onClick={handleDeallocate}
          disabled={!canDeallocate}
          className={`px-3 py-1 text-sm rounded ${!canAllocate ? 'bg-orange-400 text-white' : 'bg-gray-300 text-gray-600'}`}
        >
          Deallocate
          </button>
          */}
      
      {/* 
        <button
          disabled={status !== 'available'}
          className={`px-3 py-1 text-sm rounded ${status === 'available' ? 'bg-blue-400 hover:bg-blue-300 text-white' : 'bg-gray-300 text-gray-600'}`}
          onClick={handleRepair}
        >
          Repair
        </button>
      */}

      {/* Repair / Restore */}
      {status === 'repair' ? (
        <button
          onClick={handleRestore}
          className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white"
        >
          Restore
        </button>
      ) : (
        <button
          disabled={status !== 'available'}
          className={`px-3 py-1 text-sm rounded ${status === 'available' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-gray-300 text-gray-600'}`}
          onClick={handleRepair}
        >
          Repair
        </button>
      )}

        {/* Edit */}
        <button
          className="px-5 py-2 text-sm rounded bg-slate-500 hover:bg-slate-400 text-white"
          onClick={() => handleEdit(_id)}
        >
          Edit
        </button>

        {/* Remove and Restore */}
        {status === 'removed' ? (
          <button
          onClick={handleRestore}
          className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white"
          >
            Restore
          </button>
        ) : (
          <button
          onClick={handleRemove}
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

{/* 
        <button
          disabled={status !== 'removed'}
          className={`px-3 py-1 text-sm rounded ${status === 'removed' ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'}`}
        >
          Restore
        </button>

        <button
          disabled={canAllocate}
          className={`px-3 py-1 text-sm rounded`}
          onClick={handleRemove}
        >
          Remove
        </button> */}




// import React from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { REMOVE_ASSET_URL, CHANGE_STATUS_URL } from '../../utils/urlConstants';

// const AssetActions = ({ asset, setModalData, refreshAssets, openAllocateModal }) => {
//   const { status, allocatedTo, _id, name } = asset;

//   const isAllocated = !!allocatedTo;
//   const id = _id;

//   const handleStatusChange = async (newStatus, extraBody = {}) => {
//     try {
//       const response = await axios.patch(CHANGE_STATUS_URL(id, newStatus), extraBody);
//       console.log(response.data.message);
//       refreshAssets();
//     } catch (err) {
//       console.error(`Failed to ${newStatus} asset`, err);
//     }
//   };

//   const handleRemove = () => {
//     setModalData({
//       show: true,
//       deleteTitle: `Remove ${name}?`,
//       confirmText: 'Remove',
//       onConfirm: () => handleStatusChange('remove')
//     });
//   };

//   const handleRestore = () => {
//     handleStatusChange('restore');
//   };

//   const handleRepair = () => {
//     handleStatusChange('repair');
//   };

//   const handleDeallocate = () => {
//     handleStatusChange('deallocate');
//   };

//   const handleAllocate = () => {
//     openAllocateModal(asset); // Opens modal with user list and remarks
//   };

//   return (
//     <div className="flex gap-2 flex-wrap">
//       {/* Deallocate */}
//       {isAllocated && (
//         <button
//           className="px-3 py-1 text-sm rounded bg-orange-400 text-white"
//           onClick={handleDeallocate}
//         >
//           Deallocate
//         </button>
//       )}

//       {/* Allocate */}
//       {!isAllocated && status === 'available' && (
//         <button
//           className="px-3 py-1 text-sm rounded bg-green-500 text-white"
//           onClick={handleAllocate}
//         >
//           Allocate
//         </button>
//       )}

//       {/* Repair */}
//       <button
//         disabled={status !== 'available'}
//         className={`px-3 py-1 text-sm rounded ${status === 'available' ? 'bg-blue-400 text-white' : 'bg-gray-300 text-gray-600'}`}
//         onClick={handleRepair}
//       >
//         Repair
//       </button>

//       {/* Restore */}
//       {status === 'removed' ? (
//         <button
//           className="px-3 py-1 text-sm rounded bg-teal-500 text-white"
//           onClick={handleRestore}
//         >
//           Restore
//         </button>
//       ) : (
//         // Remove (only visible when not removed)
//         <button
//           disabled={isAllocated}
//           className={`px-3 py-1 text-sm rounded ${!isAllocated ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'}`}
//           onClick={handleRemove}
//         >
//           Remove
//         </button>
//       )}

//       {/* Edit */}
//       <Link to={`/assets/edit/${id}`}>
//         <button className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded">Edit</button>
//       </Link>
//     </div>
//   );
// };

// export default AssetActions;
