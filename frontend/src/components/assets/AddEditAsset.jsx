import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import {
  FETCH_TYPES_URL,
  FETCH_CATEGORIES_URL,
  FETCH_TYPES_BASED_ON_CAT_URL, 
  CREATE_TYPE_URL,
  CREATE_CATEGORY_URL,
  CREATE_ASSET_URL,
  FETCH_SINGLE_ASSET_URL,
  UPDATE_ASSET_URL
} from '../../utils/urlConstants';

const AddEditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const typesFromState = location.state?.types || [];
  const categoriesFromState = location.state?.categories || [];

  const [serialNumber, setSerialNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState(categoriesFromState);

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);

  const [newTypeName, setNewTypeName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [assetCode, setAssetCode] = useState('');
  const [dateOfPurchase, setDateOfPurchase] = useState('');
  const [assetName, setAssetName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');

  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState(false);
  const [showAddMerchantModal, setShowAddMerchantModal] = useState(false);

  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantPhone, setNewMerchantPhone] = useState('');
  const [newMerchantEmail, setNewMerchantEmail] = useState('');
  const [newMerchantContactPerson, setNewMerchantContactPerson] = useState('');
  const [newMerchantAddress, setNewMerchantAddress] = useState('');
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [loadingMerchant, setLoadingMerchant] = useState(false);



  // For Editing the Asset Data
  useEffect(() => {
    if (id) {
      axios.get(FETCH_SINGLE_ASSET_URL(id))
        .then(res => {
          const asset = res.data;
          setSerialNumber(asset.data.serialNumber || '');
          setRemarks(asset.data.remarks || '');
          setSelectedType(asset.data.type || null);
          setAssetCode(asset.data.assetCode || '');
          setDateOfPurchase(asset.data.dateOfPurchase ? asset.data.dateOfPurchase.slice(0,10) : '');
          setAssetName(asset.data.assetName || '');
          setBrandName(asset.data.brandName || '');
          setModelNumber(asset.data.modelNumber || '');
          setWarrantyExpiryDate(asset.data.warrantyExpiryDate ? asset.data.warrantyExpiryDate.slice(0,10) : '');
          setSelectedMerchantId(asset.data.merchantId?._id || asset.data.merchantId || '');
        })
        .catch(err => console.error('Failed to fetch asset:', err));
    }
  }, [id]);

  useEffect(() => {
    // if (!types.length) fetchTypes();
    if (!categories.length) fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      setTypes([]);
      setSelectedType(null);
    }
  }, [selectedCategoryId]);


  useEffect(() => {
  const fetchMerchants = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/assets/merchants`, { withCredentials: true });
      if (res.data?.data) {
        setMerchants(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch merchants:', err);
    }
  };

  fetchMerchants();
}, []);

  const fetchTypes = async () => {
    const res = await axios.get(FETCH_TYPES_URL);
    setTypes(res.data.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get(FETCH_CATEGORIES_URL);
    setCategories(res.data.data);
  };

  const handleAddAsset = async () => {
  try {
    
    if (
      !assetName ||
      !serialNumber ||
      !selectedCategoryId ||
      !selectedType ||
      !assetCode ||
      !dateOfPurchase ||
      !warrantyExpiryDate ||
      !brandName ||
      !modelNumber ||
      !selectedMerchantId
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoadingAsset(true); // start spinner

    const payload = {
      assetCode,
      dateOfPurchase,
      assetName,
      brandName,
      modelNumber,
      serialNumber,
      warrantyExpiryDate,
      type: selectedType._id,
      merchantId: selectedMerchantId, 
      remarks
    };

    if (id) {
      await axios.put(UPDATE_ASSET_URL(id), payload, { withCredentials: true });
    } else {
      await axios.post(CREATE_ASSET_URL, payload, { withCredentials: true });
    }

    navigate("/assets");
  } catch (err) {
    console.error("Error saving asset:", err);
  } finally {
    setLoadingAsset(false); // stop spinner
  }
};


  const handleAddCategory = async () => {
  if (!newCategoryName.trim()) return;

  try {
    const res = await axios.post(CREATE_CATEGORY_URL, { name: newCategoryName });

    const newCat = res.data.data;

    // ✅ Update dropdown list
    setCategories((prev) => [...prev, newCat]);

    // ✅ Auto-select the new category
    setSelectedCategoryId(newCat._id);

    // ✅ Reset modal state
    setNewCategoryName('');
    setShowAddCategoryModal(false);  // 🔥 closes modal
  } catch (err) {
    console.error("Error creating category:", err);
  }
};


  const handleAddType = async () => {
  if (!newTypeName.trim() || !selectedCategoryId) return;

  try {
    await axios.post(CREATE_TYPE_URL, {
      name: newTypeName,
      category: selectedCategoryId,
    });

    // ✅ Fetch updated types but keep current category
    const res = await axios.get(FETCH_TYPES_BASED_ON_CAT_URL(selectedCategoryId));
    setTypes(res.data.data);

    // ✅ Auto-select the type we just added
    const added = res.data.data.find((t) => t.name === newTypeName);
    if (added) setSelectedType(added);

    // ✅ Close modal and reset
    setShowAddTypeModal(false);
    setNewTypeName('');
  } catch (err) {
    console.error("Error creating type:", err);
  }
};


  const handleAddMerchant = async () => {
  try {
    setLoadingMerchant(true); // start spinner
    const res = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/assets/merchants`,
      {
        name: newMerchantName,
        phone: newMerchantPhone,
        email: newMerchantEmail,
        contactPerson: newMerchantContactPerson,
        address: newMerchantAddress,
      },
      { withCredentials: true }
    );

    const newMerchant = res.data.data;
    setMerchants((prev) => [...prev, newMerchant]);
    setSelectedMerchantId(newMerchant._id);

    // reset form
    setNewMerchantName('');
    setNewMerchantPhone('');
    setNewMerchantEmail('');
    setNewMerchantContactPerson('');
    setNewMerchantAddress('');
    setShowAddMerchantModal(false);
  } catch (err) {
    console.error("Error creating merchant:", err);
  } finally {
    setLoadingMerchant(false); // stop spinner
  }
};


  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add / Update Asset</h2>

<form
  onSubmit={(e) => {
    e.preventDefault();
    handleAddAsset();
  }}>

      <div className="mb-4">
      <label className="block mb-1 font-medium">Asset Name</label>
      <input value={assetName} onChange={(e) => setAssetName(e.target.value)} required className="w-full border px-3 py-2 rounded" />
    </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Serial Number<span className="text-red-500"></span></label>
        <input
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4">
  <label className="block mb-1 font-medium text-green-600">
    Category <span className="text-red-500"></span>
  </label>
  <select
    value={selectedCategoryId}
    onChange={async (e) => {
      const value = e.target.value;

      if (value === "__add_new__") {
        setShowAddCategoryModal(true); // open modal
        return;
      }

      setSelectedCategoryId(value);
      setSelectedType(null);

      if (value) {
        try {
          const res = await axios.get(FETCH_TYPES_BASED_ON_CAT_URL(value));
          setTypes(res.data.data || []);
        } catch (err) {
          console.error("Failed to fetch types by category:", err);
          setTypes([]);
        }
      } else {
        setTypes([]);
      }
    }}
    required
    className="w-full border px-3 py-2 rounded"
  >
    {/* Placeholder */}
    <option value="">Select Category</option>

    {/* Add New Category option */}
    <option value="__add_new__" className="text-green-600 font-semibold">
      + Add New Category
    </option>

    
    {categories
      .filter((cat) => cat.name.toLowerCase() !== "select category")
      .map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
  </select>
</div>




      <div className="mb-4 relative">
        <label className="block mb-1 font-medium text-green-600">Type<span className="text-red-500"></span></label>
        <button
         type="button"
          onClick={() => setTypeDropdownOpen(prev => !prev)}
          className="w-full border px-3 py-2 rounded text-left"
        >
          {selectedType?.name || 'Select Type'}
        </button>
        {typeDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border shadow rounded max-h-60 overflow-y-auto">
            <div
              onClick={() => {
                setShowAddTypeModal(true);
                setTypeDropdownOpen(false);
              }}
              type="button"
              className="px-4 py-2 text-green-600 font-semibold hover:bg-gray-100 cursor-pointer border-b"
            >
              + Add New Type
            </div>
            {types.map((type) => (
              <div
                key={type._id}
                onClick={() => {
                  setSelectedType(type);
                  setTypeDropdownOpen(false);
                }}
                type="button"
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {type.name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-4">
      <label className="block mb-1 font-medium">Asset Code</label>
      <input value={assetCode} onChange={(e) => setAssetCode(e.target.value)} required className="w-full border px-3 py-2 rounded" />
    </div>

    <div className="mb-4">
      <label className="block mb-1 font-medium">Date of Purchase</label>
      <input type="date" value={dateOfPurchase} onChange={(e) => setDateOfPurchase(e.target.value)} required className="w-full border px-3 py-2 rounded" />
    </div>

    <div className="mb-4">
      <label className="block mb-1 font-medium">Warranty Expiry Date</label>
      <input type="date" value={warrantyExpiryDate} onChange={(e) => setWarrantyExpiryDate(e.target.value)} required className="w-full border px-3 py-2 rounded" />
    </div>

    

    <div className="mb-4">
      <label className="block mb-1 font-medium">Brand Name</label>
      <input value={brandName} onChange={(e) => setBrandName(e.target.value)} required className="w-full border px-3 py-2 rounded" />
    </div>

    <div className="mb-4">
      <label className="block mb-1 font-medium">Model Number</label>
      <input value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} required className="w-full border px-3 py-2 rounded" />
    </div>


    <div className="mb-4 relative">
  <label  className="block mb-1 font-medium text-green-600">Merchant</label>
  <button
    type="button"
    onClick={() => setMerchantDropdownOpen(prev => !prev)}
    className="w-full border px-3 py-2 rounded text-left"
  >
    {merchants.find(m => m._id === selectedMerchantId)?.name || 'Select Merchant'}
  </button>

  {merchantDropdownOpen && (
    <div className="absolute z-10 mt-1 w-full bg-white border shadow rounded max-h-60 overflow-y-auto">
      <div
        onClick={() => {
          setShowAddMerchantModal(true);
          setMerchantDropdownOpen(false);
        }}
        type="button"
        className="px-4 py-2 text-green-600 font-semibold hover:bg-gray-100 cursor-pointer border-b"
      >
        + Add New Merchant
      </div>
      {merchants.map((m) => (
        <div
          key={m._id}
          onClick={() => {
            setSelectedMerchantId(m._id);
            setMerchantDropdownOpen(false);
          }}
          role="button"
          tabIndex={0}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          {m.name}
        </div>
      ))}
    </div>
  )}
</div>


      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-600">Remarks (optional)</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate('/assets')}
          className="px-4 py-2 border rounded"
        >
          Close
        </button>
       <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center"
        disabled={loadingAsset}
      >
        {loadingAsset ? (
          <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          id ? 'Update' : 'Add'
        )}
      </button>

      </div>

      
</form>
      {showAddTypeModal && (
        <Modal onClose={() => setShowAddTypeModal(false)} title="Add New Type">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Type Name</label>
              <input
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddType();
                  }
                }}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAddTypeModal(false)}
                type="button"
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
              <button
                onClick={handleAddType}
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </Modal>
      )}

    {showAddCategoryModal && (
  <Modal onClose={() => setShowAddCategoryModal(false)} title="Add New Category">
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Category Name</label>
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCategory();
            }
          }}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter category name"
        />
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <button
          onClick={() => setShowAddCategoryModal(false)}
          type="button"
          className="px-4 py-2 border rounded"
        >
          Close
        </button>
        <button
          onClick={handleAddCategory}
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add
        </button>
      </div>
    </div>
  </Modal>
)}




      {showAddMerchantModal && (
  <Modal onClose={() => setShowAddMerchantModal(false)} title="Add New Merchant">
    <form
      onSubmit={(e) => {
        e.preventDefault();

        // Optional manual check (for extra safety)
        if (
          !newMerchantName.trim() ||
          !newMerchantPhone.trim() ||
          !newMerchantEmail.trim() ||
          !newMerchantContactPerson.trim() ||
          !newMerchantAddress.trim()
        ) {
          alert("Please fill in all fields before adding the merchant.");
          return;
        }

        handleAddMerchant();
      }}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
    >
    <div>
      <label className="block mb-1 font-medium">Name<span className="text-red-500"></span></label>
      <input
        required
        value={newMerchantName}
        onChange={(e) => setNewMerchantName(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium">Phone</label>
      <input
        required
        type="tel"
        pattern="[0-9]{10}"
        title="Phone number must be exactly 10 digits"
        value={newMerchantPhone}
        onChange={(e) => setNewMerchantPhone(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium">Email</label>
      <input
          required
        type="email"
        value={newMerchantEmail}
        onChange={(e) => setNewMerchantEmail(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium">Contact Person</label>
      <input
        required
        value={newMerchantContactPerson}
        onChange={(e) => setNewMerchantContactPerson(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium">Address</label>
      <textarea
        required
        value={newMerchantAddress}
        onChange={(e) => setNewMerchantAddress(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        rows={2}
      />
    </div>

    <div className="flex justify-end gap-3 pt-3">
      <button
        type="button" 
        onClick={() => setShowAddMerchantModal(false)}
        className="px-4 py-2 border rounded"
      >
        Close
      </button>
      <button
        type="submit"
        disabled={loadingMerchant}
        className="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center"
      >
        {loadingMerchant ? (
          <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          'Add'
        )}
      </button>
    </div>
  </form>
</Modal>

)}
    </div>
  );
};

export default AddEditAsset;
