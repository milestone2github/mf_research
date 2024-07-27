import React, { useEffect, useState } from "react";
import { getFirstWord } from "../../utils/formatString";
import localforage from 'localforage'

const backendUrl = process.env.REACT_APP_API_BASE_URL;
const CACHE_PREFIX = 'KYC_'
const CACHE_EXPIRY_TIME = 3600 * 1000 // 1hr(in ms)
const MAX_CACHE_SIZE = 100;

localforage.config({
  name: 'MF Research',
  storeName: 'kycStatusCache'
});

// Function to get the cache order
const getCacheOrder = async () => {
  const cacheOrder = await localforage.getItem('cacheOrder');
  return cacheOrder || [];
};

// Function to update the cache order
const updateCacheOrder = async (cacheOrder) => {
  await localforage.setItem('cacheOrder', cacheOrder);
};

const KycStatusTable = ({ pan, name, ucc, setOverallKycStatus }) => {
  const [kycStatus1, setKycStatus1] = useState(null);
  const [kycStatus2, setKycStatus2] = useState(null);
  const [kycStatus3, setKycStatus3] = useState(null);
  const [currentUcc, setCurrentUcc] = useState(null);

  const statusColors = {
    "KYC Registered": "bg-yellow-500 text-white",
    "KYC Rejected": "bg-red-500 text-white",
    "KYC Validated": "bg-green-500 text-white",
  };

  const statusText = {
    "KYC Registered": "Registered",
    "KYC Rejected": "Rejected",
    "KYC Validated": "Validated",
  };

  const statusOrder = {
    "KYC Validated": 3,
    "KYC Registered": 2,
    "KYC Rejected": 1,
  };

  const fetchKycStatus = async (pan) => {
    try {
      const response = await fetch(`${backendUrl}/api/data/KYCStatusCheck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Pan: pan,
          detailCheck: "N",
          detailedOutput: "N",
        }),
      });
      const jsonData = await response.json();

      if (!response.ok || !jsonData) {
        return null;
      }

      return jsonData;
    } catch (error) {
      return null;
    }
  };

  const getKycStatus = async (pan) => {
    const cacheKey = `${CACHE_PREFIX}${pan}`;
  
    // Check if the KYC status is already in the cache
    const cachedItem = await localforage.getItem(cacheKey);
    const currentTime = Date.now();
  
    if (cachedItem && (currentTime - cachedItem.timestamp <= CACHE_EXPIRY_TIME)) {
      return cachedItem;
    }
  
    // If not in cache or cache expired, make the API call
    const status = await fetchKycStatus(pan);
  
    if (status) {
      status.timestamp = currentTime;
  
      // Get the current cache order
      let cacheOrder = await getCacheOrder();
  
      // If the cache size limit is reached, remove the oldest item
      if (cacheOrder.length >= MAX_CACHE_SIZE) {
        const oldestKey = cacheOrder.shift();
        await localforage.removeItem(oldestKey);
      }
  
      // Add the new item to the cache and update the order
      cacheOrder.push(cacheKey);
      await localforage.setItem(cacheKey, status);
      await updateCacheOrder(cacheOrder);
      return status;
    }
  };

  useEffect(() => {
    if (pan.length >= 10) {
      getKycStatus(pan).then(setKycStatus1);
    }
    else { setKycStatus1(null) }
  }, [pan])

  useEffect(() => {
    if (ucc !== currentUcc) {
      setCurrentUcc(ucc);
      if(pan !== ucc?.Primary_Holder_PAN) setKycStatus1(null);
      setKycStatus2(null);
      setKycStatus3(null);

      if (pan && pan !== ucc?.Primary_Holder_PAN) { getKycStatus(ucc.Primary_Holder_PAN).then(setKycStatus1); }
      if (ucc?.Second_Holder_PAN) { getKycStatus(ucc.Second_Holder_PAN).then(setKycStatus2); }
      if (ucc?.Third_Holder_PAN) { getKycStatus(ucc.Third_Holder_PAN).then(setKycStatus3); }
    }
  }, [ucc, currentUcc]);

  useEffect(() => {
    if (ucc?.Primary_Holder_First_Name) {
      const statuses = [kycStatus1, kycStatus2, kycStatus3].filter(Boolean).map(status => statusOrder[status.Status]);
      const overallStatus = Math.min(...statuses);
      const overallStatusText = Object.keys(statusOrder).find(key => statusOrder[key] === overallStatus);
      setOverallKycStatus(overallStatusText);
    }
  }, [kycStatus1, kycStatus2, kycStatus3, setOverallKycStatus, ucc]);

  return (
    <table className="border border-gray-200 border-collapse text-sm text-left rounded-md">
      {kycStatus1 && <caption className="caption-top text-left mb-1 text-sm text-gray-800 font-medium">
        KYC Status
      </caption>}
      <thead className="border-2 bg-gray-200 p-1">
        <tr>
          {kycStatus1 && <th className="p-1 pe-6 text-center text-nowrap">{getFirstWord(ucc?.Primary_Holder_First_Name || name)}</th>}
          {kycStatus2 && <th className="p-1 pe-6 text-center text-nowrap">{getFirstWord(ucc.Second_Holder_First_Name)}</th>}
          {kycStatus3 && <th className="p-1 pe-6 text-center text-nowrap">{getFirstWord(ucc.Third_Holder_First_Name)}</th>}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b relative border-gray-200">
          {kycStatus1 && (
            <td className="p-1 py-2 pe-6">
              <span className={`p-1 px-2 w-fit text-center rounded-md ${kycStatus1 && kycStatus1.Status ? statusColors[kycStatus1.Status] : 'bg-gray-200 text-gray-800'}`}>
                {kycStatus1 ? (statusText[kycStatus1.Status] || kycStatus1.Status) : "N/A"}
              </span>
            </td>
          )}
          {kycStatus2 && (
            <td className="p-1 py-2 pe-6">
              <span className={`p-1 px-2 text-center rounded-md ${kycStatus2 && kycStatus2.Status ? statusColors[kycStatus2.Status] : 'bg-gray-200 text-gray-800'}`}>
                {kycStatus2 ? (statusText[kycStatus2.Status] || kycStatus2.Status) : "N/A"}
              </span>
            </td>
          )}
          {kycStatus3 && (
            <td className="p-1 py-2 pe-6">
              <span className={`p-1 px-2 text-center rounded-md ${kycStatus3 && kycStatus3.Status ? statusColors[kycStatus3.Status] : 'bg-gray-200 text-gray-800'}`}>
                {kycStatus3 ? (statusText[kycStatus3.Status] || kycStatus3.Status) : "N/A"}
              </span>
            </td>
          )}
        </tr>
      </tbody>
    </table>
  );
};

export default KycStatusTable;
