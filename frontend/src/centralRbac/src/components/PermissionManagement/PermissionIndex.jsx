import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Search from '../common/SearchModal';
import PermissionList from './PermissionList';
import AddEditPermission from './AddEditPermission';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { FETCH_PERMISSION_URL } from '../../utils/urlConstants';
import { PERMISSION_DELETE_MESSAGE } from '../../utils/stringConstants';
import { toast, ToastContainer, Slide } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';


function PermissionIndex() {
  const [permissions, setPermissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalData, setModalData] = useState({ show: false, deleteTitle: '', deleteUrl: '' });

  // Function to fetch and store search-based results
  const fetchPermissions = async () => {
    try {
      const res = await axios.get(FETCH_PERMISSION_URL);
      setPermissions(res.data.permissionData);
      setFiltered(res.data.permissionData);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch permissions.', 
        { position: 'top-right', autoClose: 3000, transition: Slide });
    }
  };

  // Hit the BE to populate the data
  useEffect(() => {
    fetchPermissions();
  }, []);

  // Search query handler
  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      setFiltered(permissions);
      return;
    }
    setFiltered(
      permissions.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

 // Delete confirmation modal handler
 const handleDeleteConfirm = async () => {
  try {
    const response = await axios.delete(modalData.deleteUrl);
    setModalData({ show: false, deleteTitle: '', deleteUrl: '' });
    fetchPermissions();
    if (response && response.data && response.data.message) {
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    } else {
      toast.success('Permission deleted successfully.', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
  } catch (error) {
    console.error('Error deleting permission:', error);
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message, {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    } else {
      toast.error('Failed to delete permission.', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
  }
};

  return (
    <div className="p-4">
      <ToastContainer />
      <div className='text-4xl font-bold text-white pb-5 text-center'>
        <h2 className='text-white'>PERMISSION MANAGEMENT</h2>
        <div className="mt-2 mx-auto w-72 border-b-2 border-orange-400" />
      </div>
      {/* Search and Add option */}
      <div className="flex justify-between mb-4">
        <Search onSearch={handleSearch} />
        <button
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Add Permission
        </button>
      </div>

      {/* List of Permissions */}
      <PermissionList
        permissions={filtered}
        onEdit={(perm) => {
          setEditData(perm);
          setShowModal(true);
        }}
        setModalData={setModalData}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <AddEditPermission
          editData={editData}
          onClose={() => setShowModal(false)}
          onSuccess={fetchPermissions}
        />
      )}

      {/* Delete Confirmation Modal */}
      {modalData.show && (
        <DeleteConfirmationModal
          modalData={modalData}
          onClose={() => setModalData({ show: false, deleteTitle: '', deleteUrl: '' })}
          onDeleteConfirm={handleDeleteConfirm}
          message={PERMISSION_DELETE_MESSAGE}
        />
      )}
    </div>
  );
}

export default PermissionIndex;
