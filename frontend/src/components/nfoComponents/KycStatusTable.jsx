import React, { useEffect, useState } from "react";

const backendUrl = process.env.REACT_APP_API_BASE_URL;

const KycStatusTable = ({ ucc }) => {
  const [kycStatus1, setKycStatus1] = useState(null);
  const [kycStatus2, setKycStatus2] = useState(null);
  const [kycStatus3, setKycStatus3] = useState(null);

  const statusColors = {
    "KYC Registered": "bg-yellow-500 text-white",
    "KYC Rejected": "bg-red-500 text-white",
    "KYC Validated": "bg-green-500 text-white",
    // Add other statuses and their colors here
  };

  const statusText = {
    "KYC Registered": "Registered",
    "KYC Rejected": "Rejected",
    "KYC Validated": "Validated",
    // Add other status text replacements here
  };

  const fetchKycStatus = async (pan) => {
    console.log("Fetching KYC status for PAN:", pan); // Log PAN for which KYC status is being fetched
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
        console.log("Error fetching KYC status");
        return null;
      }

      console.log("KYC status fetched:", jsonData); // Log fetched KYC status
      return jsonData;
    } catch (error) {
      console.log("Internal server error while getting KYC status");
      return null;
    }
  };

  useEffect(() => {
    console.log("Selected UCC:", ucc); // Log selected UCC
    if (ucc?.Primary_Holder_First_Name) {
      fetchKycStatus(ucc.Primary_Holder_PAN).then(setKycStatus1);
      fetchKycStatus(ucc.Second_Holder_PAN).then(setKycStatus2);
      fetchKycStatus(ucc.Third_Holder_PAN).then(setKycStatus3);
    }
  }, [ucc]);

  return (
    <table className="border border-gray-200 border-collapse text-sm text-left rounded-md">
      {kycStatus1 && <caption className="caption-top text-left mb-1 text-sm text-gray-800 font-medium">
        KYC Status
      </caption>}
      <thead className="border-2 bg-gray-200 p-1">
        <tr>
          {kycStatus1 && <th className="p-1 pe-6 text-center text-nowrap">KYC Client</th>}
          {kycStatus2 && <th className="p-1 pe-6 text-center text-nowrap">KYC Joint1</th>}
          {kycStatus3 && <th className="p-1 pe-6 text-center text-nowrap">KYC Joint2</th>}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b relative border-gray-200">
          {kycStatus1 && (<td className="p-2">
            <div className={`p-1 text-center rounded-md ${kycStatus1 && kycStatus1.Status ? statusColors[kycStatus1.Status] : 'bg-gray-200 text-gray-800'}`}>
              {/* {console.log("KYC Client Status:", kycStatus1?.Status)} Log KYC Client Status */}
              {kycStatus1 ? (statusText[kycStatus1.Status] || kycStatus1.Status) : "N/A"}
            </div>
          </td>)}
          {kycStatus2 && (
            <td className="p-2">
              <div className={`p-1 text-center rounded-md ${kycStatus2 && kycStatus2.Status ? statusColors[kycStatus2.Status] : 'bg-gray-200 text-gray-800'}`}>
                {/* {console.log("KYC Joint1 Status:", kycStatus2?.Status)} Log KYC Joint1 Status */}
                {kycStatus2 ? (statusText[kycStatus2.Status] || kycStatus2.Status) : "N/A"}
              </div>
            </td>
          )}
          {kycStatus3 && (
            <td className="p-2">
              <div className={`p-1 text-center rounded-md ${kycStatus3 && kycStatus3.Status ? statusColors[kycStatus3.Status] : 'bg-gray-200 text-gray-800'}`}>
                {/* {console.log("KYC Joint2 Status:", kycStatus3?.Status)} Log KYC Joint2 Status */}
                {kycStatus3 ? (statusText[kycStatus3.Status] || kycStatus3.Status) : "N/A"}
              </div>
            </td>
          )}
        </tr>
      </tbody>
    </table>
  );
};

export default KycStatusTable;
