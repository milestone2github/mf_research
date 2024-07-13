import React, { useState, useEffect } from 'react';
import { BsInfoCircleFill } from "react-icons/bs";

const backendUrl = process.env.REACT_APP_API_BASE_URL;

const taxStatusMap = new Map([
  ["INDIVIDUAL", "IND"],
  ["NRI - REPATRIABLE (NRO)", ""]
]);

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
    return jsonData.Status;
  } catch (error) {
    return null;
  }
};

const holdingMap = new Map([
  ["SINGLE", "SI"],
  ["JOINT", "JO"],
  ["ANYONE OR SURVIVOR", "AS"],
  [null, "N/A"]
]);

const determineBseStatus = async (item) => {
  const hasValidNominee = item["Nominee_1_Name"] || item["Nominee_2_Name"] || item["Nominee_3_Name"];
  const isPanValid = item["Primary_Holder_PAN_Aadhaar_Status"] === "VALID";
  const isAadhaarValid = item["Aadhaar_Updated"] === "Y"; // Assuming "Y" indicates valid Aadhaar
  const isBankValid = item["Bank1_Status"] || item["Bank2_Status"] || item["Bank3_Status"] || item["Bank4_Status"] || item["Bank5_Status"] === "VALID"; // Adjust according to actual keys
  const isKycValid = await fetchKycStatus(item["Primary_Holder_PAN"]) === "KYC Validated"; // Adjust according to actual keys

  return hasValidNominee && isPanValid && isBankValid && isKycValid ? "Active" : "Inactive";
};

function UccTable({ data, selectedOption, updateSelected }) {
  const [bseStatusMap, setBseStatusMap] = useState(new Map());

  useEffect(() => {
    const updateStatuses = async () => {
      const statusMap = new Map();
      for (const item of data) {
        const status = await determineBseStatus(item);
        statusMap.set(item._id, status);
      }
      setBseStatusMap(statusMap);
    };
    updateStatuses();
  }, [data]);

  const handleChange = (e) => {
    updateSelected(data.filter(item => item["_id"] === e.target.value)[0])
  };

  return (
    <table className='border border-gray-200 border-collapse text-sm text-left rounded-md'>
      <caption className="caption-top text-left mb-1 text-sm text-gray-800 font-medium">
        UCC
      </caption>
      <thead className='border-2 bg-slate-200'>
        <tr>
          <th className='p-1 pe-6 text-left text-nowrap'>Action</th>
          <th className='p-1 pe-8 text-left text-nowrap min-w-32'>Client Name</th>
          <th className='p-1 pe-8 text-left text-nowrap min-w-32'>Joint 1</th>
          <th className='p-1 pe-8 text-left text-nowrap '>Joint 2</th>
          <th className='p-1 pe-8 text-left'>Tax status</th>
          <th className='p-1 pe-8 text-left'>Holding</th>
          <th className='p-1 pe-8 text-left'>BSE Status</th>
          <th className='p-1 pe-8 text-left text-nowrap'>Bank Detail</th>
          <th className='p-1 pe-8 text-left'>Nominee</th>
        </tr>
      </thead>
      <tbody>{
        data?.map(item => (
          <tr key={item._id} className='border-b relative border-gray-200'>
            <td className='p-1 pe-6'>
              <label htmlFor={item._id} className={`cursor-pointer rounded ${item._id === selectedOption._id ? 'bg-blue-100 border-blue-200' : 'bg-gray-100 border-gray-200'} border h-full px-4 py-2 flex items-center`}>
                <input
                  type="radio"
                  className='cursor-pointer'
                  name="ucc"
                  id={item._id}
                  value={item["_id"]}
                  required={true}
                  checked={selectedOption._id === item["_id"]}
                  onChange={handleChange}
                />
              </label>
            </td>
            <td title={item["Primary_Holder_First_Name"]} className='pe-6 py-2 ellipsis max-w-44'>{item["Primary_Holder_First_Name"]}</td>
            <td className='p-1 pe-6 py-2 max-w-40'>{item["Second_Holder_First_Name"]}</td>
            <td className='p-1 pe-6 py-2 max-w-40'>{item["Third_Holder_First_Name"]}</td>
            <td className='p-1 pe-6 py-2'>{item["Tax_Status"]}</td>
            <td className='p-1 pe-6 py-2'>{holdingMap.get(item["Holding_Nature"])}</td>
            <td className='p-1 pe-6 py-2 relative'>
              <div className='flex items-center justify-between gap-x-4'>
                {bseStatusMap.get(item._id)}
                <span className='group h-fit p-0 flex items-center '>
                  <span className='text-blue-300 text-lg w-6 h-6 flex items-center justify-center '><BsInfoCircleFill /></span>
                  <div className="absolute right-0 bottom-0 w-max px-2 py-2 border hidden group-hover:block rounded-md bg-white text-sm shadow-md">
                    <p className='text-xs'>
                      Nominee: {item["Nominee_1_Name"] || item["Nominee_2_Name"] || item["Nominee_3_Name"] ? "Present" : "Not Present"}
                    </p>
                    <p className='text-xs'>
                      PAN Status: {item["Primary_Holder_PAN_Aadhaar_Status"] === "VALID" ? "Valid" : "Invalid"}
                    </p>
                    <p className='text-xs'>
                      Bank Status: {item["Bank1_Status"] || item["Bank2_Status"] || item["Bank3_Status"] || item["Bank4_Status"] || item["Bank5_Status"] === "VALID" ? "Valid" : "Invalid"}
                    </p>
                    <p className='text-xs'>
                      KYC Status: {bseStatusMap.get(item._id) === "Active" ? "Valid" : "Invalid"} {/* Adjust according to actual keys */}
                    </p>
                  </div>
                </span>
              </div>
            </td>
            <td className='p-1 pe-6 py-2'>{item["Bank_Name_1"] ? `${item["Bank_Name_1"]?.split(' ')[0]}/${item["Account_No_1"]?.toString().slice(-4)}` : 'N/A'}</td>
            <td className='p-1 py-2 relative'>
              <div className='flex items-center justify-between gap-x-4'>
                {item["Nominee_1_Name"] ||
                  item["Nominee_2_Name"] ||
                  item["Nominee_3_Name"] ? 'YES' : "NO"}
                <span className='group h-fit p-0 flex items-center '>
                  <span className='text-blue-300 text-lg w-6 h-6 flex items-center justify-center '><BsInfoCircleFill /></span>
                  <div className="absolute right-0 bottom-0 w-max px-2 py-2 border hidden group-hover:block rounded-md bg-white text-sm shadow-md">
                    {item["Nominee_1_Name"] ||
                      item["Nominee_2_Name"] ||
                      item["Nominee_3_Name"] ? <p className='text-xs text-green-700'>Nominees present</p>
                      : <p className='text-xs text-red-700'>No Nominees present</p>
                    }
                    <div className="mt-1 flex flex-col gap-y-2">
                      {item["Nominee_1_Name"] && <p className='border-t'>{item["Nominee_1_Name"]}</p>}
                      {item["Nominee_2_Name"] && <p className='border-t'>{item["Nominee_2_Name"]}</p>}
                      {item["Nominee_3_Name"] && <p className='border-t'>{item["Nominee_3_Name"]}</p>}
                    </div>
                  </div>
                </span>
              </div>
            </td>
          </tr>
        ))
      }
      </tbody>
    </table>
  );
}

export default UccTable;
