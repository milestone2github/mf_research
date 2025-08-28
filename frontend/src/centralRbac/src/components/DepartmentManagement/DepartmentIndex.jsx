import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft } from "react-icons/fa";
import { FETCH_DEPARTMENT_URL, FETCH_ALL_ROLES_URL } from '../../utils/urlConstants';
import SearchModal from '../common/SearchModal';
import DepartmentList from './DepartmentList';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { Link } from 'react-router-dom';
import { DEPARTMENT_DELETE_MESSAGE } from '../../utils/stringConstants';
import { toast, ToastContainer, Slide } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


function DepartmentIndex() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);
  const [modalData, setModalData] = useState({ show: false, deleteTitle: '', deleteUrl: '' });
  const [roleCounts, setRoleCounts] = useState({}); // Maps department id with roles assigned
  const navigate = useNavigate();

  /** To Do: Manage Roles and Manage Departments buttons are hitting APIs every time we click,
   * integrate a way of caching to minimize no. of API hit **/
  
  // Fetch all departments
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(FETCH_DEPARTMENT_URL(''));
      const data = res.data.data;
      setDepartments(data);
      setFiltered(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments.', { position: 'top-right', autoClose: 3000, transition: Slide });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all roles and group by departmentId
  const fetchRoleCounts = async () => {
    try {
      const res = await axios.get(FETCH_ALL_ROLES_URL);
      const roles = res.data.data || [];
      const counts = {};

      roles.forEach(role => {
        const deptId = role.department?._id || role.department;
        if (deptId) {
          counts[deptId] = (counts[deptId] || 0) + 1;
        }
      });

      setRoleCounts(counts);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch role counts.', { position: 'top-right', autoClose: 3000, transition: Slide });
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchRoleCounts();
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      setFiltered(departments);
      return;
    }
    setFiltered(
      departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(modalData.deleteUrl);
      setModalData({ show: false, deleteTitle: '', deleteUrl: '' });
      fetchDepartments();
      fetchRoleCounts(); // Refresh roles after delete
      if (response && response.data && response.data.message) {
        toast.success(response.data.message, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
        });
      } else {
        toast.success('Department deleted successfully.', {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
        });
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
        });
      } else {
        toast.error('Failed to delete department.', {
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
      <div className="relative flex items-center mb-5">
        <button onClick={() => navigate("/rbac")} className="text-white hover:text-gray-400 mr-4">
          <FaArrowLeft size={20} />
        </button>

        <h1 className="text-3xl font-semibold text-white m-0">
          Department Management
        </h1>
      </div>
      <div className="flex justify-between mb-4">
        <SearchModal onSearch={handleSearch} />
        <div className='flex gap-5'>
          <Link to="/rbac/roles/manage">
            <button className="bg-slate-500 hover:bg-slate-700 hover:border-white text-white px-4 py-2 rounded-md">
              Manage Roles
            </button>
          </Link>
          <Link to="/rbac/departments/add">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Add Department
            </button>
          </Link>
        </div>
      </div>

      <DepartmentList 
        departments={filtered} 
        setModalData={setModalData} 
        roleCounts={roleCounts}
        loading={loading}
      />

      {modalData.show && (
        <DeleteConfirmationModal
          modalData={modalData}
          onClose={() => setModalData({ show: false, deleteTitle: '', deleteUrl: '' })}
          onDeleteConfirm={handleDeleteConfirm}
          message={DEPARTMENT_DELETE_MESSAGE}
        />
      )}
    </div>
  );
}

export default DepartmentIndex;
