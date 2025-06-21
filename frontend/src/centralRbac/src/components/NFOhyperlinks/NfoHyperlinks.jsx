import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { RBAC_BASE_URL } from '../../utils/urlConstants';

function Nfohyperlinks() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveButtonActive, setSaveButtonActive] = useState(false);

  useEffect(() => {
    const fetchInfoLinks = async () => {
      try {
        const response = await axios.get(`${RBAC_BASE_URL}/nfohyperlinks`);
        setImageUrl(response.data.imageUrl);
        // console.log(response.data.imageUrl);
        setRedirectUrl(response.data.redirectUrl);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load info links.');
        setLoading(false);
      }
    };

    fetchInfoLinks();
  }, []);

  useEffect(() => {
    // Enable save button only if editing is active and either URL has changed
    if (isEditing && (redirectUrl !== imageUrl)) {
      setSaveButtonActive(true);
    } else {
      setSaveButtonActive(false);
    }
  }, [isEditing, imageUrl, redirectUrl]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(`${RBAC_BASE_URL}/nfohyperlinks`,
        { imageUrl, redirectUrl }
      );
      setImageUrl(response.data.data.imageUrl);
      setRedirectUrl(response.data.data.redirectUrl);
      setIsEditing(false);
      setError('');
      toast.success('NFO Hyperlink updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
        onClose: () => navigate("/rbac"),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating NFO Hyperlink.', {
        position: 'top-right',
        autoClose: 3000,
        transition: Slide,
      });
      setError(err.message || 'Failed to update info links.');
    } finally {
      setLoading(false);
      setSaveButtonActive(false); // Disable save button after attempt
    }
  };

  const handleBackClick = () => {
    navigate("/rbac");
  };

  return (
    <div className="flex items-center justify-center p-16">
      <ToastContainer />
      <form className="bg-white shadow-md rounded-lg px-10 py-6 w-full max-w-2xl">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">NFO Hyperlinks 🔗</h2>
          <button onClick={handleBackClick} className="flex items-center font-medium text-gray-600 hover:text-gray-800 focus:outline-none">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to RBAC
          </button>
        </div>

        {/* Input Boxes */}
        <div className="mb-4">
          <label htmlFor="imageUrl" className="block text-gray-700 text-base font-semibold mb-2">
            Image URL
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isEditing ? '' : 'bg-gray-200 cursor-not-allowed'}`}
            id="imageUrl"
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => isEditing && setImageUrl(e.target.value)}
            readOnly={!isEditing}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="redirectUrl" className="block text-gray-700 text-base font-semibold mb-2">
            Redirect Url
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${isEditing ? '' : 'bg-gray-200 cursor-not-allowed'}`}
            id="redirectUrl"
            type="text"
            placeholder="Redirect URL"
            value={redirectUrl || ''}
            onChange={(e) => isEditing && setRedirectUrl(e.target.value)}
            readOnly={!isEditing}
          />
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleEditClick}
            className="bg-blue-600 hover:bg-blue-800 w-20 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:shadow-outline mr-3"
            disabled={isEditing}
          >
            Edit
          </button>
          <button
            onClick={handleSaveClick}
            className={`bg-green-600 hover:bg-green-800 w-20 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:shadow-outline ${!saveButtonActive || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!saveButtonActive || loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
      </form>
    </div>
  );
}

export default Nfohyperlinks;
