import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FETCH_DEPARTMENT_URL,
  FETCH_PERMISSION_URL,
  POST_DEPARTMENT_URL,
  UPDATE_DEPARTMENT_URL,
} from '../../utils/urlConstants';

function AddEditDepartment() {
  const { id: deptId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [permissionToggles, setPermissionToggles] = useState([]);
  const [roles, setRoles] = useState([]);

  // Fetch all permissions initially
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get(FETCH_PERMISSION_URL);
        setPermissions(res.data.permissionData || []);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        toast.error('Failed to fetch permissions.',
          { position: 'top-right', autoClose: 3000, transition: Slide });
      }
    };
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (deptId) {
      const fetchDepartment = async () => {
        try {
          const deptRes = await axios.get(FETCH_DEPARTMENT_URL(deptId));
          //   console.log("Department data fetched: --> ", deptRes);
          const data = deptRes.data.data;
          setName(data.name);
          //   setPermissionToggles(data.permissions || []);
          const assignedPermissionIds = (data.permissions || []).map(perm => perm._id);
          setPermissionToggles(assignedPermissionIds);
        } catch (err) {
          console.error('Error fetching department:', err);
          toast.error('Failed to fetch department details.',
            { position: 'top-right', autoClose: 3000, transition: Slide });
        }
      };

      fetchDepartment();
    }
  }, [deptId]);

  // Toggle permission selection
  const togglePermission = (permId) => {
    setPermissionToggles((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  // Save department (create or update)
  const handleSubmit = async () => {
    const body = { name, permissions: permissionToggles };
    try {
      let response;
      if (deptId) {
        response = await axios.put(UPDATE_DEPARTMENT_URL(deptId), body);
      } else {
        response = await axios.post(POST_DEPARTMENT_URL, body);
      }

      // Display success toast based on the backend message
      if (response && response.data && response.data.message) {
        toast.success(response.data.message, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
          onClose: () => navigate('/rbac/departments'),
        });
      } else {
        toast.success(`Department ${deptId ? 'updated' : 'added'} successfully.`, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
          onClose: () => navigate('/rbac/departments'),
        });
      }
    } catch (err) {
      console.error('Error saving department:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
        });
      } else {
        toast.error(`Failed to ${deptId ? 'update' : 'add'} department.`, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto ">
      <ToastContainer />
      <button onClick={() => navigate('/rbac/departments')} className="text-blue-500 mb-4">
        &larr; Back
      </button>
      <h2 className="text-2xl font-bold mb-4 text-white">{deptId ? 'Edit' : 'Add'} Department</h2>
      <input
        className="border p-2 w-full mb-4 text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Department Name"
      />

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Permissions</h3>
        <div className="flex flex-wrap gap-4">
          {permissions.map((perm) => (
            <div key={perm._id} className="flex items-center gap-2">
              <button onClick={() => togglePermission(perm._id)}>
                {permissionToggles.includes(perm._id)
                  ? <FaToggleOn size={34} />
                  : <FaToggleOff size={34} />}
              </button>
              <span>{perm.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-700 text-white rounded"
        >
          {deptId ? 'Update' : 'Add'}
        </button>
      </div>
    </div>
  );
}

export default AddEditDepartment;