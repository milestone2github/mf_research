import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FETCH_ALL_ROLES_URL } from '../../utils/urlConstants';
import SearchModal from '../common/SearchModal';
import RolesList from './RolesList';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { toast, ToastContainer, Slide } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

function RolesIndex() {
  const [roles, setRoles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [modalData, setModalData] = useState({ show: false, deleteTitle: '', deleteUrl: '' });

  /** To Do: Manage Roles and Manage Departments are hitting APIs every time we click,
   * integrate a way of caching to minimize no. of API hit **/
  
  // Fetch All Roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get(FETCH_ALL_ROLES_URL);
      setRoles(res.data.data);
      setFiltered(res.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles.', 
        { position: 'top-right', autoClose: 3000, transition: Slide });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Search can be based on Roles as well as Department names
  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      setFiltered(roles);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFiltered(
      roles.filter((r) =>
        r.name.toLowerCase().includes(query) ||
        r.department?.name?.toLowerCase().includes(query)
      )
    );
  };

// Role Delete handler
const handleDeleteConfirm = async () => {
  try {
    const response = await axios.delete(modalData.deleteUrl);
    setModalData({ show: false, deleteTitle: '', deleteUrl: '' });
    fetchRoles();
    if (response && response.data && response.data.message) {
      toast.success(response.data.message, {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    } else {
      toast.success('Role deleted successfully.', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message, {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    } else {
      toast.error('Failed to delete role.', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
    }
  }
};

  const navigate = useNavigate();

  return (
    <div className="p-4">
       <ToastContainer />
      <div className='text-4xl font-bold text-white pb-5 text-center'>
        <h2 className='text-white'>ROLES MANAGEMENT</h2>
        <div className="mt-2 mx-auto w-72 border-b-2 border-orange-400" />
      </div>
      <div className="flex justify-between mb-4">
        <SearchModal onSearch={handleSearch} />
        <div className='flex gap-4'>
          <button 
            className='bg-slate-500 text-white px-4 py-2 rounded-md'
            onClick={() => navigate('/rbac/departments')}
          >
              Manage Departments
          </button>
          <button
              className="bg-green-600 text-white px-4 py-2 rounded-md"
              onClick={() => navigate('/rbac/roles/edit/new')}
          >
              Add Role
          </button>
        </div>
      </div>

      <RolesList roles={filtered} setModalData={setModalData} />

      {modalData.show && (
        <DeleteConfirmationModal
          modalData={modalData}
          onClose={() => setModalData({ show: false, deleteTitle: '', deleteUrl: '' })}
          onDeleteConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export default RolesIndex;
