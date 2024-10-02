import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaHistory,
  FaFile,
  FaFolder,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFilePdf,
  FaFileArchive,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";

const backendUrl = process.env.REACT_APP_API_BASE_URL;

function Workdrive() {
  const { userData } = useSelector((state) => state.user);
  const permissions = userData?.role?.permissions;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState([]);
  const [allData, setAllData] = useState([]);
  const [path, setPath] = useState(null);
  const [token, setToken] = useState(""); // Token for authentication
  const location = useLocation();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [noteData, setNoteData] = useState({
    clientName: "",
    date: "",
    note: "",
    error: "",
    proceeded: false,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // const getCookie = (name) => {
    //   const value = `; ${document.cookie}`;
    //   const parts = value.split(`; ${name}=`);
    //   if (parts.length === 2) return parts.pop().split(';').shift();
    // };

    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    // const filesData = getCookie('filesData');
    const filesData = params.get("files");
    const tokenParam = params.get("token");
    const pathData = params.get("path")?.split(",");

    if (success === "true" && filesData) {
      setIsAuthenticated(true);
      setItems(JSON.parse(decodeURIComponent(filesData)));
      setToken(tokenParam);
      setPath(JSON.parse(decodeURIComponent(pathData)));
      console.log(JSON.parse(decodeURIComponent(pathData)))
      fetchAllNotes();
    } else {
      handleLogin(); // Automatically handle login if not authenticated
    }
  }, [location]);

  useEffect(() => {
    if (items.length > 0 && allData.length > 0) {
      const updatedItems = [...items];
      for (let note of allData) {
        for (let item of updatedItems) {
          if (item.name === note.nameforproject && note.proceeded) {
            item.proceeded = true;
          }
        }
      }
      setItems(updatedItems);
    }
  }, [items, allData]);

  const fetchAllNotes = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/data/api/notes`);
      if (!response.ok) {
        throw new Error("Failed to fetch all data");
      }
      const data = await response.json();
      setAllData(data);
    } catch (error) {
      console.error(error);
      setAllData([]);
    }
  };

  const handleLogin = () => {
    window.location.href = `${backendUrl}/api/data/auth/zoho`;
  };

  const handleOpenNoteModal = (item) => {
    setSelectedItem(item);
    setShowNoteModal(true);
    setShowHistoryModal(false);
  };

  const handleOpenHistoryModal = (item) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
    setShowNoteModal(false);
    const itemHistory = allData.filter(
      (note) => note.nameforproject === item.name
    );
    setHistory(itemHistory);
  };

  const handleCloseModal = () => {
    setShowNoteModal(false);
    setShowHistoryModal(false);
    setSelectedItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteData({
      ...noteData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      console.error("No item selected");
      return;
    }
    const updatedNoteData = {
      ...noteData,
      nameforproject: selectedItem.name,
    };
    setHistory((prevHistory) => [...prevHistory, updatedNoteData]);

    try {
      const response = await fetch(`${backendUrl}/api/data/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNoteData),
      });

      if (!response.ok) {
        throw new Error("Failed to save note data");
      }

      setAllData((prevData) => [...prevData, updatedNoteData]);

      if (updatedNoteData.proceeded) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === selectedItem.id ? { ...item, proceeded: true } : item
          )
        );
      }

      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFolderClick = (value, name) => {
    const indexToRemove = path.findIndex(item => item.value === value && item.name === name);
    let updatedPath = path;
    if (indexToRemove !== -1) {
      updatedPath = path.slice(0, indexToRemove); // Keep everything before the matched item
    }
    const serializedPath = encodeURIComponent(JSON.stringify(updatedPath));
    window.location.href = `${backendUrl}/api/data/zoho/access?token=${token}&id=${value}&path=${serializedPath}&name=${name}`;
  };

  // Helper function to get the correct icon based on file type
  const getFileIcon = (item) => {
    const extension = item.type;
    switch (extension) {
      case 'writer':
        return <FaFileWord className="inline-block text-blue-500 mr-2 text-2xl" />;
      case 'sheet':
        return <FaFileExcel className="inline-block text-green-500 mr-2 text-2xl" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="inline-block text-orange-500 mr-2 text-2xl" />;
      case 'pdf':
        return <FaFilePdf className="inline-block text-red-500 mr-2 text-2xl" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FaFileArchive className="inline-block text-yellow-500 mr-2 text-2xl" />;
      case 'img':
        return <FaFileImage className="inline-block text-purple-500 mr-2 text-2xl" />;
      case 'video':
        return <FaFileVideo className="inline-block text-red-400 mr-2 text-2xl" />;
      case 'audio':
        return <FaFileAudio className="inline-block text-purple-400 mr-2 text-2xl" />;
      default:
        return <FaFile className="inline-block text-gray-500 mr-2 text-2xl" />;
    }
  };

  if (!permissions.find((perm) => perm === "Workdrive")) return <AccessDenied />;

  return (
    <div className="container mx-auto p-5">
      <div className="mt-5">
        <div>
          <div className="text-gray-800 mb-4 text-xl">
            {path && path.map((item, index) => (
              <span key={index}>
                {index > 0 && " > "}
                <button
                  onClick={() => handleFolderClick(item.value, item.name)}
                  className={`${index === path.length - 1 ? 'text-blue-600' : 'text-black'} hover:underline`}
                >
                  {item.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        <table className="table-fixed w-full border border-gray-300 shadow-lg rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border text-left border-gray-300">Name</th>
              <th className="w-1/12 px-4 py-2 text-center border border-gray-300">
                Type
              </th>
              <th className="w-2/12 px-4 py-2 text-center border border-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="bg-white hover:bg-gray-50 transition-all duration-150"
              >
                <td className="px-4 py-2 border border-gray-300">
                  {item.type === "folder" ? (
                    <a
                      href="#"
                      onClick={() => handleFolderClick(item.link, item.name)}
                      className="text-black-500 hover:underline"
                    >
                      <FaFolder className="inline-block text-blue-500 mr-2 text-2xl" />
                      {item.name}
                    </a>
                  ) : (
                    <a href={item.link} target="_blank" className="text-black-500 hover:underline">
                      {getFileIcon(item)}
                      {item.name}
                    </a>
                  )}
                  {item.proceeded && (
                    <span> <FaCheckCircle className="inline-block text-green-500 mr-2" /></span>
                  )}
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  <button
                    className={`bg-blue-400 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${item.proceeded ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    onClick={() => handleOpenNoteModal(item)}
                    disabled={item.proceeded}
                  >
                    Add Note
                  </button>
                  <button
                    className="ml-2 bg-white-300 text-orange-500 px-2 py-2 rounded-full transition-transform transform hover:scale-[1.20]"
                    onClick={() => handleOpenHistoryModal(item)}
                  >
                    <FaHistory />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal for "Add Note" */}
        {showNoteModal && selectedItem && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
              <h2 className="text-lg font-bold mb-4">
                Add Note for {selectedItem?.name}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={noteData.clientName}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={noteData.date}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Note</label>
                  <input
                    type="text"
                    name="note"
                    value={noteData.note}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">
                    Any Error
                  </label>
                  <input
                    type="text"
                    name="error"
                    value={noteData.error}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="proceeded"
                    checked={noteData.proceeded}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-semibold">
                    Mark as Proceeded
                  </span>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for history */}
        {showHistoryModal && selectedItem && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="bg-white p-8 rounded-lg shadow-lg w-auto overflow-auto">
              <h2 className="text-lg font-bold mb-4">
                History for {selectedItem?.name}
              </h2>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <table className="table-auto w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 border border-gray-300 w-1/6">
                        Name
                      </th>
                      <th className="px-4 py-2 border border-gray-300 w-1/4">
                        Date
                      </th>
                      <th className="px-4 py-2 border border-gray-300 w-1/5">
                        Note
                      </th>
                      <th className="px-4 py-2 border border-gray-300 w-1/5">
                        Error
                      </th>
                      <th className="px-4 py-2 border border-gray-300 w-1/12">
                        Proceeded
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((note, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border border-gray-300">
                          {note.clientName}
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          {note.date}
                        </td>
                        <td className="px-4 py-2 border border-gray-300 break-words max-w-xs">
                          {note.note}
                        </td>
                        <td className="px-4 py-2 border border-gray-300 break-words max-w-xs">
                          {note.error}
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-center">
                          {note.proceeded && (
                            <FaCheckCircle className="inline-block text-green-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                onClick={handleCloseModal}
                className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg mt-4"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Workdrive;
