import React from 'react';
import { useNavigate } from 'react-router-dom';
import Actions from '../common/Actions';
import { DELETE_ROLE_URL } from '../../utils/urlConstants';

function RolesList({ roles, setModalData }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto border rounded-md">
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
    </div>
  );
}

export default RolesList;
