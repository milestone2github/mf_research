import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaHistory } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";

const backendUrl = process.env.REACT_APP_API_BASE_URL;

function WorkdriveForm() {
  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState([]);
  const [allData, setAllData] = useState([]); // Store all notes data locally
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [noteData, setNoteData] = useState({
    clientName: '',
    date: '',
    note: '',
    error: '',
    proceeded: false,
  });
  const [history, setHistory] = useState([]);
  const [openForms, setOpenForms] = useState({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const filesData = params.get('files');
    
    if (success === 'true' && filesData) {
      setIsAuthenticated(true);
      setItems(JSON.parse(decodeURIComponent(filesData)));

      // Fetch all history data only once
      fetchAllNotes();
    }
  }, [location]);
  useEffect(() => {
    if (items.length > 0 && allData.length > 0) {
      const updatedItems = [...items]; // Create a copy of items
  
      for (let i = 0; i < allData.length; i++) {
        const note = allData[i];
  
        // Find the corresponding item in the items array
        for (let j = 0; j < updatedItems.length; j++) {
          if (updatedItems[j].name === note.nameforproject && note.proceeded) {
            updatedItems[j].proceeded = true;
          }
        }
      }
  
      setItems(updatedItems); // Update the items state
    }
  }, [items, allData]);
  
  // Fetch all notes from the API
  const fetchAllNotes = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/data/api/notes`);
      if (!response.ok) {
        throw new Error('Failed to fetch all data');
      }
      const data = await response.json();
      
      setAllData(data); // Store all fetched data locally
    } catch (error) {
      console.error(error);
      setAllData([]); // In case of error, set an empty array
    }
  };
  const handleLogin = () => {
    window.location.href = `${backendUrl}/api/data/auth/zoho`;
  };
  // const fetchAllNotes = async () => {
  //   try {
  //     const response = await fetch(`${backendUrl}/api/data/api/notes`);
  //     if (!response.ok) {
    //       throw new Error('Failed to fetch all data');
  //     }
  //     const data = await response.json();
  //     setAllData(data); 
  //   } catch (error) {
    //     console.error(error);
  //   }
  // };
  
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);

    // Access history data from local storage instead of making another API call
    const itemHistory = allData.filter((note) => note.nameforproject === item.name);
    setHistory(itemHistory);
  };

  const handleProceeded = (item) => {
    // Use local data to check if an item has been proceeded
    const itemHistory = allData.filter((note) => note.nameforproject === item.name);
    const lastItem = itemHistory[itemHistory.length - 1];
    
    if (lastItem && lastItem.proceeded === true) {
      setItems((prevItems) =>
        prevItems.map((i) => (i.name === item.name ? { ...i, proceeded: true } : i))
      );
    }
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };
  
  const handleToggleForm = (id) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      handleProceeded(item);
      setSelectedItem(item);
      
      setNoteData({
        clientName: '',
        date: '',
        note: '',
        error: '',
        proceeded: false,
      });
    }
    setOpenForms((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteData({
      ...noteData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      console.error('No item selected');
      return;
    }
    
    const updatedNoteData = {
      ...noteData,
      nameforproject: selectedItem.name,
    };

    // Update local history state without fetching from backend
    setHistory((prevHistory) => [...prevHistory, updatedNoteData]);

    try {
      const response = await fetch(`${backendUrl}/api/data/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to save note data');
      }

      // Update local data after submission
      setAllData((prevData) => [...prevData, updatedNoteData]);
      
      if (updatedNoteData.proceeded) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === selectedItem.id ? { ...item, proceeded: true } : item
          )
        );
      }

      setOpenForms((prevState) => ({
        ...prevState,
        [selectedItem.id]: false,
      }));

      setNoteData({
        clientName: '',
        date: '',
        note: '',
        error: '',
        proceeded: false,
      });
    } catch (error) {
      console.error(error);
    }
  };
  if(!permissions.find(perm => perm === 'Workdrive')) 
    return (<AccessDenied />)
  
  return (
    <div className="container-workdrive">
      {!isAuthenticated ? (
        <div className="text-center mt-60">
          <button onClick={handleLogin} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Access Files
          </button>
        </div>
      ) : (
        <div className="mt-1">
          <h1 className="text-gray-900 mb-4 text-2xl font-semibold">Files/Folder</h1>
          <table className="table-auto w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-gray-300">S.No.</th>
                <th className="px-4 py-2 border border-gray-300">File Name</th>
                <th className="px-4 py-2 text-center border border-gray-300">Links</th>
                <th className="px-4 py-2 text-center border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td className="px-4 py-2 border border-gray-300 text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {item.proceeded && (
                        <FaCheckCircle className='inline-block text-green-500 mr-2'/>
                      )}
                      {item.name}
                    </td>
                    <td className="px-4 py-2 text-center border border-gray-300">
                      <a href={item.link} target="_blank" className="text-blue-500 hover:underline">
                        Open
                      </a>
                    </td>
                    <td className="px-4 py-2 text-center border border-gray-300">
                      <button
                        className={`bg-gray-800 text-white px-4 py-2 rounded ${item.proceeded ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleToggleForm(item.id)}
                        disabled={item.proceeded}
                      >
                        {openForms[item.id] ? 'Close Form' : 'Add Note'}
                      </button>
                      <button className="mx-2 bg-gray-800 text-white px-2 py-2 rounded" onClick={() => handleOpenModal(item)}>
                      <FaHistory />
                      </button>
                    </td>
                  </tr>
                  {openForms[item.id] && (
                    <tr>
                      <td colSpan="3" className="px-4 py-4">
                        <div className="p-3 bg-gray-300 rounded ml-auto" style={{ maxWidth: '450px' }}>
                          <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="mb-2">
                              <label className="block text-sm font-semibold">Client Name</label>
                              <input
                                type="text"
                                name="clientName"
                                value={noteData.clientName}
                                onChange={handleInputChange}
                                required
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                              />
                            </div>
                            <div className="mb-2">
                              <label className="block text-sm font-semibold">Date</label>
                              <input
                                type="date"
                                name="date"
                                value={noteData.date}
                                onChange={handleInputChange}
                                required
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                              />
                            </div>
                            <div className="mb-2">
                              <label className="block text-sm font-semibold">Note</label>
                              <input
                                type="text"
                                name="note"
                                value={noteData.note}
                                onChange={handleInputChange}
                                required
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                              />
                            </div>
                            <div className="mb-2">
                              <label className="block text-sm font-semibold">Any Error</label>
                              <input
                                type="text"
                                name="error"
                                value={noteData.error}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded px-3 py-2 w-full"
                              />
                            </div>
                            <div className="mb-3 flex items-center">
                              <input
                                type="checkbox"
                                name="proceeded"
                                checked={noteData.proceeded}
                                onChange={handleInputChange}
                                className="mr-2"
                              />
                              <label className="text-sm">Proceeded</label>
                            </div>
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
                              Submit
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>

                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className={`fixed inset-0 z-50 flex items-start justify-center ${showModal ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseModal}></div> {/* Modal backdrop */}

            <div className="bg-white rounded-lg shadow-lg z-50 p-6 max-w-2xl mx-auto relative mt-10" style={{maxWidth:"850px",minWidth:"800px"}}> {/* Added mt-10 for margin from the top */}
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-bold">History for {selectedItem?.name}</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 focus:outline-none text-3xl p-2">
                  &times;
                </button>
              </div>

              <div className="modal-body mt-4">
                {loading ? (
                  <div className="text-center">
                    <p>Loading...</p>
                  </div>
                ) : history.length > 0 ? (
                  <table className="table-auto w-full text-left border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border border-gray-300">Client Name</th>
                        <th className="px-4 py-2 border border-gray-300">Date</th>
                        <th className="px-4 py-2 border border-gray-300">Note</th>
                        <th className="px-4 py-2 border border-gray-300">Error</th>
                        <th className="px-4 py-2 border border-gray-300">Proceeded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 border border-gray-300">{entry.clientName || 'N/A'}</td>
                          <td className="px-4 py-2 border border-gray-300">{entry.date || 'N/A'}</td>
                          <td className="px-4 py-2 border border-gray-300 break-all">{entry.note || 'N/A'}</td>
                          <td className="px-4 py-2 border border-gray-300 break-all">{entry.error || 'N/A'}</td>
                          <td className="px-4 py-2 border border-gray-300">
                            {entry.proceeded ? (
                              <FaCheckCircle className="text-green-500"/>
                            ) : (
                              ''
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center">No history available for this project.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default WorkdriveForm;
