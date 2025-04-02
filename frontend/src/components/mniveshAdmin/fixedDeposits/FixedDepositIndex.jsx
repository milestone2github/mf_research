import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import BackButton from '../../common/BackButton';
import Search from '../common/Search';
import { FD_URL, FD_URL2 } from '../../../utils/urlConstants';
import { FD_DELETE_ERROR, FD_DELETE_ERROR_ALERT, FD_DELETE_SUCCESSFUL, FD_FETCH_ERROR } from '../../../utils/stringConstants';
import FixedDepositTable from './FixedDepositTable';

function FixedDepositIndex() {
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [pagination, setPagination] = useState(null);
  const [modalData, setModalData] = useState({ show: false, fixedDepositName: '', deleteUrl: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch FDs based on search query
  useEffect(() => {
    const fetchFD = async () => {
      try {
        const url = searchQuery
          ? new URL(FD_URL2(`?q=${searchQuery}&page=${page}`), process.env.REACT_APP_API_BASE_URL).href
          : new URL(FD_URL2(`?page=${page}`), process.env.REACT_APP_API_BASE_URL).href;
        const { data } = await axios.get(url);

        setFixedDeposits(data.data || []);
        setPagination({
          currentPage: data.currentPage,
          totalCount: data.totalCount,
        });
      } catch (err) {
        console.error(FD_FETCH_ERROR, err);
      }
    };

    fetchFD();
  }, [searchQuery, page]);

   // Page change function
   const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage);
      return params;
    });
  };

  // Deleting FD function
  async function handleDelete(deleteUrl) {
    try {
      // const delUrl = `${process.env.REACT_APP_API_BASE_URL}/${deleteUrl}`;
      const delUrl = new URL(`/${deleteUrl}`, process.env.REACT_APP_API_BASE_URL).href;
      await axios.delete(delUrl);
      alert(FD_DELETE_SUCCESSFUL);
      setFixedDeposits((prev) => prev.filter((b) => FD_URL(b.slug) !== deleteUrl));
      setModalData({ ...modalData, show: false });
      
      navigate('../fixed-deposits');
    } catch (error) {
      console.error(FD_DELETE_ERROR, error);
      alert(FD_DELETE_ERROR_ALERT);
    }
  }

  return (
    <div className="p-4">
          <BackButton />
          <h2 className="text-2xl font-bold mb-4">Manage Fixed Deposits</h2>
    
          {/* Search and Add Button */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
            <Search onSearch={setSearchQuery} />
            <Link 
              to="add" 
              className="bg-green-600 text-white px-4 py-2 rounded-md whitespace-nowrap w-full md:w-auto text-center"
            >
              Add New FD
            </Link>
          </div>

          {/* FD Table */}
        <FixedDepositTable 
          fds={fixedDeposits}
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
              <h2 className="text-xl font-bold mb-4">Delete FD</h2>
              <p className="mb-4">
                Are you sure you want to delete this Fixed Deposit "<span>{modalData.fixedDepositName}</span>"?
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

export default FixedDepositIndex