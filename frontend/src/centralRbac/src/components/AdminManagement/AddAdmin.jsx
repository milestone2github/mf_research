import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RBAC_BASE_URL } from "../../utils/urlConstants";

function AddAdmin({ isOpen, onClose, setAdmins, admins, navigate }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${RBAC_BASE_URL}/users`);
        if (response.data.success) {
          setUsers(response.data.data.filter((user) => !admins.some((admin) => admin._id === user._id)));
        } else {
          setError(response.data.message || "Could not fetch users.");
          console.error("Error fetching users:", response.data.message);
          toast.error(response.data.message || "Could not fetch users.", 
            { position: "top-right", autoClose: 3000, transition: Slide,
        });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Could not fetch users.");
        toast.error("Could not fetch users.", 
            { position: "top-right", autoClose: 3000, transition: Slide,
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, admins]);

  const handleAddAdmin = async () => {
    if (!selectedUserId) {
        toast.warn("Please select a user to promote.", 
            { position: "top-right", autoClose: 3000, transition: Slide,
        });
        return;
    }

    try {
        const response = await axios.patch(`${RBAC_BASE_URL}/admin/${selectedUserId}`);

        if (response.data.success || response.data.message) {
            const updatedUser = response.data.user || response.data.data;
            setAdmins((prevAdmins) => [...prevAdmins, updatedUser]);
            onClose();
            setSelectedUserId("");
            navigate("/rbac/admin");
            toast.success(`User ${updatedUser.name} promoted to Admin successfully!`, {
                position: "top-right",
                autoClose: 3000,
                transition: Slide,
            });
        } else {
            console.error("Error adding admin:", response.data.message);
            toast.error(response.data.message || "Could not add admin.", {
                position: "top-right",
                autoClose: 3000,
                transition: Slide,
            });
        }
    } catch (error) {
        console.error("Error adding admin:", error);
        toast.error(error.response?.data?.message || "Could not add admin.", {
            position: "top-right",
            autoClose: 3000,
            transition: Slide,
        });
    }
};

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-10 inset-0 overflow-y-auto"
      style={{ alignItems: "flex-start", paddingTop: "2rem" }}
    >
        <ToastContainer />
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div
          className="inline-block align-bottom border-2 border-gray-400 bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
          style={{
            maxWidth: "90%",
            width: "600px",
            height:"280px"
          }}
        >
          <div className="bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h2 className="text-xl leading-6 font-medium text-white py-4" id="modal-headline">
               Add Admin  🔰 ÷
                </h2>
                {loading ? (
                  <p className="text-gray-300">Loading users...</p>
                ) : error ? (
                  <p className="text-red-400">{error}</p>
                ) : (
                  <div >
                    <label
                      htmlFor="userSelect"
                      className="block text-lg font-medium text-gray-300 mb-1 w-full"
                    >
                      Select User:
                    </label>
                    <select
                      id="userSelect"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-4 block w-full py-3 px-3 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-gray-300"
                      style={{ maxHeight: "12rem", overflowY: "auto" }}
                    >
                      <option value="">-- Select a User --</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} -- ({user.email})
                        </option>
                      ))}
                    </select>
                    {users.length === 0 && (
                      <p className="text-gray-500 mt-4">
                        No users available to add as admin.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-8 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-base"
              onClick={handleAddAdmin}
              disabled={loading || !selectedUserId || users.length === 0}
            >
              Add 
            </button>
            <button
              type="button"
              className="mt-3 w-full mr-3 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-base"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAdmin;