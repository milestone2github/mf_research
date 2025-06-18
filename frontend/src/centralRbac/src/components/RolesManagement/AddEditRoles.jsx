import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FETCH_DEPARTMENT_URL,
  FETCH_PERMISSION_URL,
  FETCH_ROLES_URL,
  POST_ROLE_URL,
  UPDATE_ROLE_URL,
} from '../../utils/urlConstants';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast, ToastContainer, Slide } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';


function AddEditRoles() {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(deptId !== 'new' ? deptId : '');
  const [permissions, setPermissions] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [permissionToggles, setPermissionToggles] = useState([]);
  const [existingRole, setExistingRole] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, permRes] = await Promise.all([
          axios.get(FETCH_DEPARTMENT_URL('')),
          axios.get(FETCH_PERMISSION_URL),
        ]);
        setDepartments(deptRes.data.data || []);
        setPermissions(permRes.data.permissionData || []);
      } catch (error) {
        toast.error('Failed to load initial data.', 
          { position: 'top-right', autoClose: 3000, transition: Slide });
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchRoleForDept = async () => {
      if (selectedDept && deptId !== 'new') {
        try {
          const res = await axios.get(FETCH_ROLES_URL(selectedDept));
          const role = res.data.data?.[0];
          if (role) {
            setExistingRole(role);
            setRoleName(role.name);
            setPermissionToggles(role.permissions?.map(p => p._id));
          }
        } catch (err) {
          console.error('Error fetching existing role:', err);
          toast.error('Failed to fetch existing role.', 
            { position: 'top-right', autoClose: 3000, transition: Slide });
        }
      }
    };
    fetchRoleForDept();
  }, [selectedDept]);

  const togglePermission = (permId) => {
    setPermissionToggles((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (existingRole) {
        const updateBody = {
          name: roleName,
          permissions: permissionToggles,
        };
        response = await axios.put(UPDATE_ROLE_URL(existingRole._id), updateBody);
      } else {
        const createBody = {
          name: roleName,
          department: selectedDept,
          permissions: permissionToggles,
        };
        response = await axios.post(POST_ROLE_URL, createBody);
      }

      toast.success(`Role ${existingRole ? 'updated' : 'added'} successfully.`, {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
        onClose: () => navigate('/rbac/roles/manage'),
      });
    } catch (err) {
      console.error('Error saving role:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
        });
      } else {
        toast.error(`Failed to ${existingRole ? 'update' : 'add'} role.`, {
          position: 'top-right',
          autoClose: 3000,
          transition: Slide,
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ToastContainer />
      <button onClick={() => navigate('/rbac/roles')} className="text-blue-500 mb-4">
        &larr; Back
      </button>
      <h2 className="text-2xl font-bold mb-4 text-white">{existingRole ? 'Edit Role' : 'Add Role'}</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Department</label>
        <select
          className="border p-2 w-full text-black"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          disabled={deptId !== 'new'}
        >
          <option value="">-- Select Department --</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <input
        className="border p-2 w-full mb-4 text-black"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        placeholder="Role Name"
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
          {existingRole ? 'Update Role' : 'Add Role'}
        </button>
      </div>
    </div>
  );
}

export default AddEditRoles;
