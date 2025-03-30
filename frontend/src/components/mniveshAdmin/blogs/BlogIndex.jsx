import React, { useEffect, useState } from 'react'
import BackButton from '../../common/BackButton'
import BlogTable from './BlogTable'
import SearchBlog from './SearchBlog'
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import {} from 'dotenv/config'


function BlogIndex() {
  const [blogs, setBlogs] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState({ show: false, blogName: '', deleteUrl: '' });
  const [pagination, setPagination] = useState(null);

  // const page = searchParams.get("page") || 1;
  // const searchQuery = searchParams.get("search") || "";

  // Fetch blogs based on search query availability
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const url = searchQuery
          // ? `/api/mnivesh/admin/blogs/${searchQuery}`  /* ISSUE WITH THE API */
          ? `${process.env.REACT_APP_API_BASE_URL}/api/mnivesh/admin/blogs?q=${searchQuery}&page=${page}` /* not working w/o explicity defining localhost:5000/ */
          : `${process.env.REACT_APP_API_BASE_URL}/api/mnivesh/admin/blogs?page=${page}`;
        const { data } = await axios.get(url);
        // const blogArr = data.data;
        // const paginationData = {
        //   currentPage: data.currentPage,
        //   totalCount: data.totalCount
        // };
        console.log("Data fetched directly: ", data);
        // setBlogs(blogArr ? blogArr : []);
        // setPagination(paginationData);
        setBlogs(data.data || []);
        setPagination({
          currentPage: data.currentPage,
          totalCount: data.totalCount,
        });
      } catch (err) {
        console.error("Error fetching blogs from the backend.", err);
      }
    };

    fetchBlogs();
  }, [searchQuery, page]);

  // When a pagination button is clicked:
  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage);
      return params;
    });
  };

  // Handling deleting function
  async function handleDelete(deleteUrl) {
    try {
      await axios.delete(deleteUrl);
      alert('Blog deleted successfully!');
      setBlogs((prev) => prev.filter((b) => `/api/blogs/${b.id}` !== deleteUrl));
      setModalData({ ...modalData, show: false });
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog.');
    }
  }
  return (
    <div className="p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Manage Blogs</h2>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
        <SearchBlog onSearch={setSearchQuery} />
        {/* <SearchBlog searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}
        <Link 
          to="add" 
          className="bg-green-600 text-white px-4 py-2 rounded-md whitespace-nowrap w-full md:w-auto text-center"
        >
          Add New Blog
        </Link>
      </div>

      {/* Blog Table */}
      <BlogTable 
        blogs={blogs}
        pagination={pagination}
        setModalData={setModalData}
        onPageChange={handlePageChange}
        // onPageChange={(newPage) => {
        //   setSearchParams((prev) => {
        //     const updated = new URLSearchParams(prev);
        //     updated.set("page", newPage);
        //     return updated;
        //   });
        // }}
      />

      {/* Pagination */}
      {pagination && (
        <div className="mt-6 flex justify-center">
          <div className="pagination flex space-x-2 bg-white p-3 rounded-lg shadow-md">
            {/* pagination logic */}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalData.show && (
        <div id="deleteModal" className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="bg-black bg-opacity-50 absolute inset-0" 
            onClick={() => setModalData({ ...modalData, show: false })}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Blog</h2>
            <p className="mb-4">
              Are you sure you want to delete blog "<span>{modalData.blogName}</span>"?
            </p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setModalData({ ...modalData, show: false })} 
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={() => { handleDelete(modalData.deleteUrl); setModalData({ ...modalData, show: false }); }} 
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

      // <h2 class="text-2xl font-bold mb-4">Manage Blogs</h2>
      // <SearchBlogs />
      // <AddBlog />
      // THIS IS A TEST DIV INSIDE BLOG INDEX

export default BlogIndex