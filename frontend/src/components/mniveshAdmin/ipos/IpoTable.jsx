import React from 'react';
// import {} from 'dotenv/config';
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { Link } from 'react-router-dom';
import { IPO_URL } from '../../../utils/urlConstants';

function IpoTable({ ipos, pagination, onPageChange, setModalData }) {
  return (
    <div className="overflow-x-auto">
      {/* IPO Table */}
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-md">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 text-left">S.No.</th>
            <th className="p-3 text-left">Company Name</th>
            <th className="p-3 text-left">Open Date</th>
            <th className="p-3 text-left">Close Date</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ipos.length ? (
            ipos.map((ipo) => (
              <tr key={ipo._id} className="border-b border-gray-200">
                {/* Serial Number */}       {/* <<<<<<-----------------EDIT THIS LOGIC FOR S.No. */}
                <td className="p-3">
                  {/* <img
                    src={ new URL(COMPANY_LOGO(fd.image), process.env.REACT_APP_MNIVESH_URL).href }
                    alt={fd.title}
                    className="h-16 w-40 rounded-md object-cover"
                  /> */}
                </td>

                {/* Company Name */}
                <td className="p-3">{ipo.title}</td>

                {/* IPO Open Date */}
                <td className="p-3 whitespace-nowrap">
                  {new Date(ipo.open_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                
                {/* IPO Close Date */}
                <td className="p-3 whitespace-nowrap">
                  {new Date(ipo.close_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="px-3">
                  <div className="flex gap-2 min-w-32">
                    {/* Delete Button */}
                    <button
                      onClick={() =>
                        setModalData({
                          show: true,
                          ipoName: ipo.title,
                          deleteUrl: IPO_URL(ipo.slug),
                        })
                      }
                      className="p-2 border rounded-md hover:bg-red-600 transition w-9 h-9 text-red-500 hover:text-white"
                    >
                      <MdDelete />
                    </button>

                    {/* Edit Button */}
                    <Link
                      to={`edit/${ipo.slug}`}
                      className="border p-2 hover:bg-yellow-600 rounded-md transition w-9 h-9 text-yellow-500 hover:text-white"
                    >
                      <CiEdit />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-600">
                No IPOs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="mt-6 flex flex-col items-center">
          <div className="flex space-x-1 bg-white p-3 rounded-lg shadow-md">
            <button
              className="px-3 py-1 rounded-md border"
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              «
            </button>

            {Array.from({ length: Math.ceil(pagination.totalCount / 10) }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded-md border ${
                  pagination.currentPage === i + 1 ? 'bg-blue-600 text-white' : ''
                }`}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-3 py-1 rounded-md border"
              disabled={pagination.currentPage === Math.ceil(pagination.totalCount / 10)}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              »
            </button>
          </div>

          <div className="text-sm text-gray-600 mt-2">
            {`${(pagination.currentPage - 1) * 10 + 1} - ${
              pagination.currentPage * 10
            } of ${pagination.totalCount}`}
          </div>
        </div>
      )}
    </div>
  );
}

export default IpoTable
