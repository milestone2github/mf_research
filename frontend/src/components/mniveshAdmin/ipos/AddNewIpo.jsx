import React, { useEffect, useState } from "react";
import axios from "axios";
import { IPO_URL } from "../../../utils/urlConstants";
import { ERROR_WHILE_SAVING, IPO_CREATE_SUCCESSFUL, IPO_FETCH_ERROR, IPO_UPDATE_SUCCESSFUL } from "../../../utils/stringConstants";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../common/BackButton";

const AddNewIpo = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: "",
    open_date: "",
    close_date: "",
    lot_size: "",
    price: "",
    type: "",
    face_value: "",
    market_lot: "",
    minimum_order_quantity: "",
    listing_at: "",
    issue_size: "",
    allotment_date: "",
    initiation_refund: "",
    demat_account: "",
    listing_date: "",
    min_lot: "",
    max_lot: "",
    min_share: "",
    max_share: "",
    min_amount: "",
    max_amount: ""
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);


  // Data parser for price range and face value
  const parsePrice = (priceString) => {
    const match = priceString.match(/₹(\d+)\s*to\s*₹(\d+)/);
    return match ? [match[1], match[2]] : ["", ""];
  };
  
  const parseFaceValue = (faceValueString) => {
    const match = faceValueString.match(/₹(\d+)/);
    return match ? match[1] : "";
  };

   // Fetch IPO details
    useEffect(() => {
      if (slug) {
        const getIpoUrl = new URL(IPO_URL(slug), process.env.REACT_APP_API_BASE_URL).href;
        axios
          .get(getIpoUrl)
          .then((res) => {
            const ipo = res.data.data;
            const [minPrice, maxPrice] = ipo.price ? parsePrice(ipo.price) : ["", ""];
            const rawFaceValue = ipo.face_value ? parseFaceValue(ipo.face_value) : "";
            const rawIssueSize = ipo.issue_size ? ipo.issue_size.split(" Eq Shares")[0].replace(/,/g, "") : "";
            setFormData({
              company: ipo.company || "",
              open_date: ipo.open_date || "",
              close_date: ipo.close_date || "",
              lot_size: ipo.lot_size || "",
              price: ipo.price || "",
              min_price: minPrice,
              max_price: maxPrice,
              type: ipo.type || "",
              // face_value: ipo.face_value || "",
              face_value: rawFaceValue,
              market_lot: ipo.market_lot || "",
              minimum_order_quantity: ipo.minimum_order_quantity || "",
              listing_at: ipo.listing_at || "",
              // issue_size: ipo.issue_size || "",
              issue_size: rawIssueSize || "",
              allotment_date: ipo.allotment_date || "",
              initiation_refund: ipo.initiation_refund || "",
              demat_account: ipo.demat_account || "",
              listing_date: ipo.listing_date || "",
              min_lot: ipo.min_lot || "",
              max_lot: ipo.max_lot || "",
              min_share: ipo.min_share || "",
              max_share: ipo.max_share || "",
              min_amount: ipo.min_amount || "",
              max_amount: ipo.max_amount || ""              
            });
          })
          .catch((err) => console.error(IPO_FETCH_ERROR, err));
      }
    }, [slug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handlePriceChange = (e, type) => {
  //   const value = e.target.value;
  //   setFormData((prev) => {
  //     const [min, max] = prev.price_range ? prev.price_range.split(" to ") : ["", ""];
  //     return {
  //       ...prev,
  //       price_range: type === "min" ? `${value} to ${max}` : `${min} to ${value}`,
  //     };
  //   });
  // };

  // Price Range handler
  // const handlePriceChange = (e, type) => {
  //   const value = e.target.value;
  //   setFormData((prev) => {
  //     const [min, max] = parsePrice(prev.price || "₹0 to ₹0");
  //     return {
  //       ...prev,
  //       price: type === "min" ? `₹${value} to ₹${max} per equity share` : `₹${min} to ₹${value} per equity share`,
  //     };
  //   });
  // };

  
  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    if (type === "min") {
      setFormData((prev) => ({
        ...prev,
        min_price: value,
        price: `₹${value} to ₹${prev.max_price || ""} per equity share`
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        max_price: value,
        price: `₹${prev.min_price || ""} to ₹${value} per equity share`
      }));
    }
  };

  // const parsePrice = (priceString) => {
  //   const match = priceString.match(/₹(\d+)\s*to\s*₹(\d+)/);
  //   return match ? [match[1], match[2]] : ["", ""];
  // };

  // Face Value Price handler
  // const handleFaceValueChange = (e) => {
  //   const value = e.target.value;
  //   setFormData((prev) => ({
  //     ...prev,
  //     face_value: `₹${value} per share`,
  //   }));
  // };

  const handleFaceValueChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      face_value: value,
    }));
  };

  // const parseFaceValue = (faceValueString) => {
  //   const match = faceValueString.match(/₹(\d+)/);
  //   return match ? match[1] : "";
  // };

  // Submit formData
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formDataToSend = new FormData();
  
    // Format issue_size
    formDataToSend.append("issue_size", `${formData.issue_size} Eq Shares of ₹${formData.face_value}`);
  
    // Format dates to standard ISO format
    ["open_date", "close_date", "allotment_date", "initiation_refund", "demat_account", "listing_date"].forEach((dateField) => {
      if (formData[dateField]) {
        formDataToSend.append(dateField, new Date(formData[dateField]).toISOString());
      }
    });
  
    // // Format price
    // if (formData.min_price && formData.max_price) {
    //   formDataToSend.append("price", `₹${formData.min_price} to ₹${formData.max_price} per equity share`);
    // }
  
    // // Format face_value
    // formDataToSend.append("face_value", `₹${formData.face_value} per equity share`);
    
    // Format price and face_value
    formDataToSend.append("price", `₹${formData.min_price} to ₹${formData.max_price} per equity share`);
    formDataToSend.append("face_value", `₹${formData.face_value} per equity share`);
    
    // Format market_lot & minimum_order_quantity
    formDataToSend.append("market_lot", `${formData.market_lot} Shares`);
    formDataToSend.append("minimum_order_quantity", `${formData.minimum_order_quantity} Shares`);
  
    // Append the rest of the fields
    [
      "company",
      "lot_size",
      "type",
      "listing_at",
      "min_lot",
      "max_lot",
      "min_share",
      "max_share",
      "min_amount",
      "max_amount",
    ].forEach((field) => {
      if (formData[field]) {
        formDataToSend.append(field, formData[field]);
      }
    });

    console.log("UPDATED FORMDATA FIELDS SENDING TO BE: --> ", formDataToSend);
  
    try {
      if (slug) {
        const updateIpoUrl = new URL(IPO_URL(slug), process.env.REACT_APP_API_BASE_URL).href;
        await axios.put(updateIpoUrl, formDataToSend);
        alert(IPO_UPDATE_SUCCESSFUL);
      } else {
        const createIpoUrl = new URL(IPO_URL(""), process.env.REACT_APP_API_BASE_URL).href;
        await axios.post(createIpoUrl, formDataToSend);
        alert(IPO_CREATE_SUCCESSFUL);
      }
  
      navigate("../ipos");
    } catch (error) {
      setErrors([error.response?.data?.message || ERROR_WHILE_SAVING]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-md">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6">
        {slug ? 'Edit IPO' : 'Create New IPO'}
      </h2>

      {errors.length > 0 && (
        <div className="alert alert-danger mb-4 p-4 bg-red-200 text-red-600">
          {errors.map((error, index) => (
            <p key={index} className="font-semibold">
              * {error}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Issue Dates */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Open Date</label>
            <input
              type="date"
              name="open_date"
              value={formData.open_date ? formData.open_date.split("T")[0] : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Close Date</label>
            <input
              type="date"
              name="close_date"
              value={formData.close_date ? formData.close_date.split("T")[0] : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Lot Size</label>
            <input
              type="number"
              name="lot_size"
              value={formData.lot_size}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">Issue Price</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Price Range</label>
            <div className="flex gap-2">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
                <input
                  type="number"
                  name="min_price"
                  // value={formData.price ? parsePrice(formData.price)[0] : ""}
                  value={formData.min_price || ""}
                  onChange={(e) => handlePriceChange(e, "min")}
                  className="w-full p-3 pl-6 border border-gray-300 rounded-md"
                  placeholder="min price"
                  required
                />
              </div>
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
                <input
                  type="number"
                  name="max_price"
                  // value={formData.price ? parsePrice(formData.price)[1] : ""}
                  value={formData.max_price || ""}
                  onChange={(e) => handlePriceChange(e, "max")}
                  className="w-full p-3 pl-6 border border-gray-300 rounded-md"
                  placeholder="max price"
                  required
                />
              </div>
            </div>
          </div>


        </div>

        {/* IPO Type, Face Value */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">Face Value</label>
            <div className="flex items-center gap-2">
              <div className="relative w-80">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
                <input
                  type="number"
                  name="face_value"
                  // value={formData.face_value ? parseFaceValue(formData.face_value) : ""}
                  value={formData.face_value || ""}
                  onChange={handleFaceValueChange}
                  className="w-full pl-7 p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <span className="text-gray-600 whitespace-nowrap">per share</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Market Lot</label>
            <div className="flex items-center gap-2">
              <div className="relative w-80">
                <input
                  type="number"
                  name="market_lot"
                  value={formData.market_lot ? parseInt(formData.market_lot) || "" : ""}
                  onChange={handleInputChange}
                  className="w-full pl-7 p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <span className="text-gray-600 whitespace-nowrap">Shares</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Order Quantity</label>
            {/* <input
              type="number"
              name="minimum_order_quantity"
              value={formData.minimum_order_quantity ? parseInt(formData.minimum_order_quantity) || "" : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            /> */}
            <div className="flex items-center gap-2">
              <div className="relative w-80">
                <input
                  type="number"
                  name="minimum_order_quantity"
                  value={formData.minimum_order_quantity ? parseInt(formData.minimum_order_quantity) || "" : ""}
                  onChange={handleInputChange}
                  className="w-full pl-7 p-3 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <span className="text-gray-600 whitespace-nowrap">Shares</span>
            </div>
          </div>
        </div>

        {/* Remaining fields */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Listing At</label>
            <input
              type="text"
              name="listing_at"
              value={formData.listing_at}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              placeholder="BSE, NSE"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Size</label>
            <input
              type="number"
              name="issue_size"
              // value={formData.issue_size ? parseInt(formData.issue_size) || "" : ""}
              // value={formData.issue_size ? formData.issue_size.replace(/[^0-9]/g, "") : ""}
              value={formData.issue_size ? formData.issue_size.toString().split(" Eq Shares")[0].replace(/[^0-9]/g, "") : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        
        {/* Remaining fields continue here... */}

        {/* Allotment/Refund Dates */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Allotment Date</label>
            <input
              type="date"
              name="allotment_date"
              value={formData.allotment_date ? formData.allotment_date.split("T")[0] : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Initiation Refund</label>
            <input
              type="date"
              name="initiation_refund"
              value={formData.initiation_refund ? formData.initiation_refund.split("T")[0] : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Demat account and IPO Listing date */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Demat Account</label>
            <input
              type="date"
              name="demat_account"
              value={formData.demat_account ? formData.demat_account.split("T")[0] : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Listing Date</label>
            <input
              type="date"
              name="listing_date"
              value={formData.listing_date ? formData.listing_date.split("T")[0] : ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Minimum and Maximum Lots */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Lot</label>
            <input
              type="number"
              name="min_lot"
              value={formData.min_lot}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Lot</label>
            <input
              type="number"
              name="max_lot"
              value={formData.max_lot}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Minimum and Maximum Shares */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Share</label>
            <input
              type="number"
              name="min_share"
              value={formData.min_share}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Share</label>
            <input
              type="number"
              name="max_share"
              value={formData.max_share}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Minimum and Maximum Amount */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Amount</label>
            <input
              type="number"
              name="min_amount"
              value={formData.min_amount}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Amount</label>
            <input
              type="number"
              name="max_amount"
              value={formData.max_amount}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between mt-6">
          {/* <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
            onClick={() => window.history.back()}
          >
            Close
          </button> */}
          <button
            type="submit"
            className={`px-4 py-2 w-full ${loading ? "bg-gray-400" : "bg-blue-500"} text-white rounded-md`}
            disabled={loading}
          >
            {loading ? "Saving..." : slug ? "Update IPO" : "Create IPO"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewIpo;