import React, { useEffect, useState } from 'react'
import BackButton from '../../common/BackButton'
import BlogTable from './BlogTable'
// import SearchBlog from './SearchBlog'
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Search from '../common/Search';
import { BLOG_URL } from '../../../utils/urlConstants';
import { BLOG_DELETE_ERROR, BLOG_DELETE_ERROR_ALERT, BLOG_DELETE_SUCCESSFUL, BLOG_FETCH_ERROR } from '../../../utils/stringConstants';

function BlogIndex() {
  const [blogs, setBlogs] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState({ show: false, blogName: '', deleteUrl: '' });
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  // Fetch blogs based on search query availability
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const url = searchQuery
          ? new URL(BLOG_URL(`?q=${searchQuery}&page=${page}`), process.env.REACT_APP_API_BASE_URL).href
          : new URL(BLOG_URL(`?page=${page}`), process.env.REACT_APP_API_BASE_URL).href;
        const { data } = await axios.get(url);

        setBlogs(data.data || []);
        setPagination({
          currentPage: data.currentPage,
          totalCount: data.totalCount,
        });
      } catch (err) {
        console.error(BLOG_FETCH_ERROR, err);
      }
    };

    fetchBlogs();
  }, [searchQuery, page]);

  // Page change handler
  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage);
      return params;
    });
  };

  // Deleting blog handler
  async function handleDelete(deleteUrl) {
    try {
      // const delUrl = `${process.env.REACT_APP_API_BASE_URL}/${deleteUrl}`;
      const delUrl = new URL(deleteUrl, process.env.REACT_APP_API_BASE_URL).href;
      await axios.delete(delUrl);
      alert(BLOG_DELETE_SUCCESSFUL);
      setBlogs((prev) => prev.filter((b) => BLOG_URL(b.slug) !== deleteUrl));
      setModalData({ ...modalData, show: false });
      
      navigate('../blogs');
    } catch (error) {
      console.error(BLOG_DELETE_ERROR, error);
      alert(BLOG_DELETE_ERROR_ALERT);
    }
  }
  return (
    <div className="p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Manage Blogs</h2>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
        {/* <SearchBlog onSearch={setSearchQuery} /> */}
        <Search onSearch={setSearchQuery} />
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
      />

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

export default BlogIndex