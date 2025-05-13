import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaClock } from 'react-icons/fa';

const EmployeeOnboardingHome = () => {
  const navigate = useNavigate();
  const [statusCounts, setStatusCounts] = useState({
    newJoinersCount: 0,
    pendingVerificationCount: 0,
    assetToAllocateCount: 0
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/onboarding/onboarding-status`)
      .then(res => res.json())
      .then(data => setStatusCounts(data.data))
      .catch(err => console.error('Failed to fetch status counts:', err));

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/onboarding/onboarding-details`)
      .then(res => res.json())
      .then(data => setUsers(data.data))
      .catch(err => console.error('Failed to fetch user details:', err));
  }, []);

  const renderStatus = (value) => {
    const completeStatuses = ['Completed', 'Allocated', 'Verified', 'Submitted', 'Sent', 'Signed'];
    const isComplete = completeStatuses.includes(value);
    const Icon = isComplete ? FaCheckCircle : FaClock;
    const color = isComplete ? 'text-green-600' : 'text-orange-500';
    return <span className={`flex items-center ${color}`}><Icon className="mr-1" /> {value}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome, HR Team 👋</h1>
        <button
          onClick={() => navigate('/onboarding/add')}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Add New Joinee
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-sm text-gray-500">New Joinees</h2>
          <p className="text-2xl font-bold">{statusCounts.newJoinersCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-sm text-gray-500">Pending Verifications</h2>
          <p className="text-2xl font-bold">{statusCounts.pendingVerificationCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-sm text-gray-500">Assets to Allocate</h2>
          <p className="text-2xl font-bold">{statusCounts.assetToAllocateCount}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full table-auto text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Offer Letter</th>
              <th className="px-4 py-2">Form Submission</th>
              <th className="px-4 py-2">Verification</th>
              <th className="px-4 py-2">NDA</th>
              <th className="px-4 py-2">User Setup</th>
              <th className="px-4 py-2">Assets</th>
              <th className="px-4 py-2">Gotra</th>
              <th className="px-4 py-2">Notify</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t">
                <td className="px-4 py-2">{user?.onboarding?.hrFilledInfo?.name || '-'}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{renderStatus(user.offerLetterStatus || 'Pending')}</td>
                <td className="px-4 py-2">{renderStatus(user.formStatus || 'Pending')}</td>
                <td className="px-4 py-2">{renderStatus(user.verificationStatus || 'Pending')}</td>
                <td className="px-4 py-2">{renderStatus(user.ndaStatus || 'Pending')}</td>
                <td className="px-4 py-2">{renderStatus(user.userSetupStatus || 'Pending')}</td>
                <td className="px-4 py-2">
  {/* Uncomment the below condition when real status data is available */}
  {/*
  const isEligibleForAllocation =
    ['Completed', 'Sent'].includes(user.offerLetterStatus) &&
    ['Completed', 'Submitted'].includes(user.formStatus) &&
    ['Verified'].includes(user.verificationStatus) &&
    ['Signed'].includes(user.ndaStatus) &&
    ['Completed'].includes(user.userSetupStatus);
  */}

  {/* Replace `true` with `isEligibleForAllocation` when ready */}
  {true ? (
    <button
      className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
      onClick={() => navigate(`/onboarding/allocate/${user._id}`)}
    >
      Allocate
    </button>
  ) : (
    <span className="text-xs text-gray-400 italic">Complete steps first</span>
  )}
</td>

                <td className="px-4 py-2">{renderStatus(user.gotraStatus || 'Pending')}</td>
                <td className="px-4 py-2">{renderStatus(user.notifyStatus || 'Pending')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeOnboardingHome;
