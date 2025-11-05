import React from 'react';
import { useNavigate } from 'react-router-dom';
import Actions from '../common/Actions';
import { DELETE_ROLE_URL } from '../../utils/urlConstants';

function RolesList({ roles, setModalData, loading = false }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto border rounded-md">
      {loading ? (
        <table className="min-w-full table-auto text-left text-sm">
          <thead className="bg-teal-600 text-gray-200">
            <tr>
              <th className="p-3 text-center">Role Name</th>
              <th className="p-3 text-center">Permissions</th>
              <th className="p-3 text-center">Assigned Department</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(15)].map((_, i) => (
              <tr key={i} className="animate-pulse border-t">
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-32 mx-auto"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-16 mx-auto"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-28 mx-auto"></div>
                </td>
                <td className="p-3 text-center flex justify-center space-x-2">
                  <div className="h-6 w-8 bg-gray-600 rounded"></div>
                  <div className="h-6 w-8 bg-gray-600 rounded"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
      <table className="min-w-full table-auto text-left text-sm">
        <thead className="bg-teal-600">
          <tr>
            <th className="p-3 text-center">Role Name</th>
            <th className="p-3 text-center">Permissions</th>
            <th className="p-3 text-center">Assigned Department</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role._id} className="border-t">
              <td className="p-3 text-center">{role.name}</td>
              <td className="p-3 text-center">{role.permissions?.length || '0'}</td>
              <td className="p-3 text-center">{role.department?.name || '0'}</td>
              <td className="px-3 flex justify-center">
                <Actions
                  deleteHandler={setModalData}
                  deleteTitle={role.name}
                  deleteUrl={DELETE_ROLE_URL(role._id)}
                  onEdit={() => navigate(`/rbac/roles/edit/${role.department?._id}`)}
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

export default RolesList;
