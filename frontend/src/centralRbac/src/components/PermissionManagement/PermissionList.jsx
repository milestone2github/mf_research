import React from 'react';
import Actions from '../common/Actions';
import { DELETE_PERMISSION_URL } from '../../utils/urlConstants';

function PermissionList({ permissions, onEdit, setModalData, loading = false }) {
  return (
    <div className="overflow-x-auto border rounded-md">
      {loading ? (
        <table className="min-w-full table-auto text-left text-sm">
          <thead className="bg-teal-600">
            <tr>
              <th className="p-3 text-center">Name</th>
              <th className="p-3 text-center">Key</th>
              <th className="p-3 text-center">Category</th>
              <th className="p-3 text-center">Usage</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(20)].map((_, i) => (
              <tr key={i} className="animate-pulse border-t">
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-24 mx-auto"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-4 bg-gray-600 rounded w-16 mx-auto"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-5 bg-gray-600 rounded w-20 mx-auto"></div>
                </td>
                <td className="p-3 text-center flex justify-center space-x-2">
                  <div className="h-5 bg-gray-600 rounded w-8"></div>
                  <div className="h-5 bg-gray-600 rounded w-8"></div>
                  <div className="h-5 bg-gray-600 rounded w-8"></div>
                </td>
                <td className="p-3 text-center">
                  <div className="h-6 w-20 bg-gray-600 rounded mx-auto"></div>
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
              <th className="p-3 text-center">Key</th>
              <th className="p-3 text-center">Category</th>
              <th className="p-3 text-center">Usage</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm._id} className="border-t">
                <td className="p-3 text-center justify-start">{perm.name}</td>
                <td className="p-3 text-center">{perm.key}</td>
                <td className="p-3 text-center">
                  {/* To modify: Change border color based on category classification */}
                  <span className="px-3 py-1 m-auto border rounded-md border-red-800">{perm.category?.name || '—'}</span>
                </td>
                <td className="p-3 text-center">
                  <span className="text-green-600 px-3 py-1 m-auto border rounded-md border-green-600">{perm.combinedData.roles || 0} R</span>{' '}
                  <span className="text-orange-600 px-3 py-1 m-auto border rounded-md border-orange-600">{perm.combinedData.departments || 0} D</span>{' '}
                  <span className="text-blue-600 px-3 py-1 m-auto border rounded-md border-blue-600">{perm.combinedData.users || 0} U</span>
                </td>
                <td className="px-3">
                  <Actions
                    deleteHandler={setModalData}
                    deleteTitle={perm.name}
                    deleteUrl={DELETE_PERMISSION_URL(perm._id)}
                    editLink={`edit/${perm._id}`}
                    onEdit={() => onEdit(perm)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
      }
    </div>
  );
}

export default PermissionList;
