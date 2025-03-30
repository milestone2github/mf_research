import React from 'react';

function BlogTable({ blogs, pagination, onPageChange, setModalData }) {
  return (
    <div className="overflow-x-auto">
      {/* Blog Table */}
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-md">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 text-left">Image</th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Author</th>
            <th className="p-3 text-left">Post Date</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.length ? (
            blogs.map((blog) => (
              <tr key={blog._id} className="border-b border-gray-200">
                {/* Blog Image */}
                <td className="p-3">
                  <img
                    src={`${process.env.REACT_APP_IMAGE_URL}/${blog.image}`} // Ensure this is the correct image path
                    alt={blog.title}
                    className="h-16 w-20 rounded-md object-cover"
                  />
                </td>

                {/* Blog Title */}
                <td className="p-3">{blog.title}</td>

                {/* Blog Author */}
                <td className="p-3">{blog.author}</td>

                {/* Blog Post Date */}
                <td className="p-3 whitespace-nowrap">
                  {new Date(blog.post_date).toLocaleDateString('en-GB', {
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
                          blogName: blog.title,
                          deleteUrl: `/api/blogs/${blog._id}`,
                        })
                      }
                      className="p-2 border rounded-md hover:bg-red-600 transition w-9 h-9"
                    >
                      <img
                        src={`${process.env.REACT_APP_TEMP_URL}/images/icons/delete-red.svg`}
                        alt="Del"
                        width="26"
                      />
                    </button>

                    {/* Edit Button */}
                    <a
                      href={`/blogs/edit/${blog._id}`}
                      className="border p-2 hover:bg-yellow-600 rounded-md transition w-9 h-9"
                    >
                      <img
                        src={`${process.env.REACT_APP_TEMP_URL}/icons/edit.svg`}
                        alt="Edit"
                        width="24"
                      />
                    </a>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-600">
                No blogs found.
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

export default BlogTable;
