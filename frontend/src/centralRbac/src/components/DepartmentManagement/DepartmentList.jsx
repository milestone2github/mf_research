import React from 'react';
import { useNavigate } from 'react-router-dom';
import Actions from '../common/Actions';
import { DELETE_DEPARTMENT_URL } from '../../utils/urlConstants';

function DepartmentList({ departments, setModalData, roleCounts = {}, loading = false }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto border rounded-md">
      {loading ? (
        <table className="min-w-full table-auto text-left text-sm">
          <thead className="bg-teal-600 text-gray-200">
            <tr>
              <th className="p-3 text-center">Sr. No</th>
              <th className="p-3 text-center">Department Name</th>
              <th className="p-3 text-center">Roles Assigned</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="animate-pulse border-t">
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-8 mx-auto"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-40 mx-auto"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-20 mx-auto"></div>
                </td>
                <td className="p-3 text-center flex justify-center space-x-2">
                  <div className="h-5 bg-gray-600 rounded w-8"></div>
                  <div className="h-5 bg-gray-600 rounded w-8"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
      <table className="min-w-full table-auto text-left text-sm">
        <thead className="bg-teal-600">
          <tr>
            <th className="p-3 text-center">Name</th>
            <th className="p-3 text-center">Permissions</th>
            <th className="p-3 text-center">Roles</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept._id} className="border-t">
              <td className="p-3 text-center">{dept.name}</td>
              <td className="p-3 text-center">{dept.permissions?.length || '0'}</td>
              <td className="p-3 text-center">
                {roleCounts[dept._id] || '0'}
              </td>
              <td className="px-3 flex justify-center">
                <Actions
                  deleteHandler={setModalData}
                  deleteTitle={dept.name}
                  deleteUrl={DELETE_DEPARTMENT_URL(dept._id)}
                  onEdit={() => navigate(`/rbac/departments/edit/${dept._id}`)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}

export default DepartmentList;
