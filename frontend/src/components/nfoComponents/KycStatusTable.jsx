import React from 'react';

const KycStatusTable = ({ kycStatus }) => {
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
  return (
    <table className='border border-gray-200 border-collapse text-sm text-left rounded-md'>
      <caption className="caption-top text-left mb-1 text-sm text-gray-800 font-medium">
        KYC Field
      </caption>
      <thead className='border-2 bg-gray-200'>
        <tr>
          <th className='p-1 pe-6 text-center text-nowrap'>KYC Status</th>
        </tr>
      </thead>
      <tbody>
        <tr className={`border-b relative border-gray-200`}>
          <td className='p-2 '>
            <div className={`p-1 text-center rounded-md ${statusColors[kycStatus.Status] || 'bg-gray-200 text-gray-800'}`}> {statusText[kycStatus.Status] || kycStatus.Status}</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default KycStatusTable;
