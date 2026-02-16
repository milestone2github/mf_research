import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';


const EmployeeOnboardingHome = () => {
  const navigate = useNavigate();
  const [statusCounts, setStatusCounts] = useState({
    newJoinersCount: 0,
    pendingVerificationCount: 0,
    assetToAllocateCount: 0,
  });
  const [users, setUsers] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteName, setDeleteName] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [verifying, setVerifying] = useState({ userId: null, action: null });
  const [retryZohoId, setRetryZohoId] = useState(null);
  const [retryGotraId, setRetryGotraId] = useState(null);
  const [retryNotifyId, setRetryNotifyId] = useState(null);



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
  const normalized = value?.toLowerCase();

  let Icon = FaClock;
  let color = 'text-orange-500';
  let label = value;

  if (['completed', 'allocated', 'verified', 'submitted', 'sent', 'signed'].includes(normalized)) {
    Icon = FaCheckCircle;
    color = 'text-green-600';
  }

  if (normalized === 'in_progress') {
    Icon = FaClock;
    label = 'In progress';
    color = 'text-green-400'; // Light green
  }

  if (normalized === 'failed') {
    Icon = () => <span className="text-red-600 font-bold text-lg">✖</span>; // Red cross emoji
    label = 'Failed';
    color = 'text-red-600';
  }

  if (normalized === 'skipped') {
  Icon = FaClock;
  label = 'Skipped';
  color = 'text-gray-400';
}

  return (
    <span className={`flex items-center ${color}`}>
      <Icon className="mr-1" /> {label}
    </span>
  );
};

const handleSpringVerifyAction = async (userId, action) => {
  try {
    setVerifying({ userId, action });
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/onboarding/spring-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // assuming you're storing the token
      },
      body: JSON.stringify({ userId, action }),
    });

    const result = await res.json();

    if (res.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.message || "Failed to process action");
    }
  } catch (err) {
    console.error("Spring Verify Error:", err);
    toast.error("Unexpected error");
  } finally {
    setVerifying({ userId: null, action: null });
  }
};



  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome, HR Team 👋</h1>
        <button
          onClick={() => navigate('/onboarding/select-type')}
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
              <th className="px-4 py-2">NDA</th>
              <th className="px-6 py-2 w-40">Verification</th>
              <th className="px-4 py-2">User Setup</th>
              <th className="px-4 py-2">Gotraka</th>
              <th className="px-4 py-2">Assets</th>
              <th className="px-4 py-2">Notify</th>
              <th className='px-4 py-2'>Actions</th>
              <th className="px-4 py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
  {users.map(user => {
    const onboarding = user?.onboarding || {};
    const formStatus = user.onboarding?.userFilledInfo?.submittedAt ?"Submitted" : 'Pending';

    const offerGenerated = onboarding?.offerLetter?.generated;
    const ndaSigned = onboarding?.nda?.signed;
    const zohoStatus = onboarding?.zohoSetup?.status || 'pending';

    const isEligibleForAllocation =
      offerGenerated &&
      formStatus === 'Submitted' &&
      ndaSigned ;

    return (
      <tr key={user._id} className="border-t">
        <td className="px-4 py-2">{onboarding?.hrFilledInfo?.name || '-'}</td>
        <td className="px-4 py-2">
          {user.onboarding?.hrFilledInfo?.personalEmail || '-'}
        </td>

        <td className="px-4 py-2">{renderStatus(offerGenerated ? 'Completed' : 'Pending')}</td>
        <td className="px-4 py-2">{renderStatus(formStatus)}</td>

        {/* NDA status  */}
        <td className="px-4 py-2">
          {renderStatus(ndaSigned ? 'Completed' : 'Pending')}
        </td>

        <td className="px-6 py-2 w-40">
  {offerGenerated &&
  formStatus === 'Submitted' &&
  onboarding?.backgroundCheck?.status === 'pending' ? (
    <div className="flex border border-gray-300 rounded overflow-hidden">
      <button
        disabled={verifying.userId === user._id}
        onClick={() => handleSpringVerifyAction(user._id, 'verify')}
        className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 w-full border-r border-gray-300 disabled:opacity-50"
      >
        {verifying.userId === user._id && verifying.action === 'verify'
          ? 'Verifying...'
          : 'Verify'}
      </button>
      <button
        disabled={verifying.userId === user._id}
        onClick={() => handleSpringVerifyAction(user._id, 'skip')}
        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full disabled:opacity-50"
      >
        {verifying.userId === user._id && verifying.action === 'skip'
          ? 'Skipping...'
          : 'Skip'}
      </button>
    </div>
  ) : (
    renderStatus(onboarding?.backgroundCheck?.status || 'pending')
  )}
</td>
       


        
        
                {/* Zoho user status with retry */}
        <td className="px-4 py-2">
          {zohoStatus === 'failed' ? (
            <button
                disabled={retryZohoId === user._id}
                onClick={async () => {
                  setRetryZohoId(user._id);
                  try {
                    const res = await fetch(
                      `${process.env.REACT_APP_API_BASE_URL}/api/onboarding/retry-zoho-setup/${user._id}`,
                      { method: 'POST' }
                    );
                    const result = await res.json();

                    if (res.ok) {
                      toast.success(result.message);
                    } else {
                      toast.error(result.message);
                    }
                  } catch {
                    toast.error("Retry failed");
                  } finally {
                    setRetryZohoId(null);
                  }
                }}
                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
              >
                {retryZohoId === user._id ? "Retrying..." : "Retry"}
              </button>

          ) : (
            renderStatus(zohoStatus)
          )}
        </td>


        {/* Gotra */}
        <td className="px-4 py-2">
        {onboarding?.gotra?.status === 'failed' ? (
          <button
          disabled={retryGotraId === user._id}
          onClick={async () => {
            setRetryGotraId(user._id);
            try {
              const res = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/api/onboarding/retry-gotra/${user._id}`,
                { method: 'POST' }
              );
              const result = await res.json();

              if (res.ok) {
                toast.success(result.message);
              } else {
                toast.error(result.message);
              }
            } catch {
              toast.error('Retry failed');
            } finally {
              setRetryGotraId(null);
            }
          }}
          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
        >
          {retryGotraId === user._id ? "Retrying..." : "Retry"}
        </button>
        ) : (
          renderStatus(onboarding?.gotra?.status || 'pending')
        )}
      </td>

        <td className="px-4 py-2">
  {onboarding?.hasAssestAllocated ? (
    renderStatus('Allocated')
  ) : isEligibleForAllocation ? (
    <button
      className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
      onClick={() => navigate(`/onboarding/allocate/${user._id}`)}
    >
      Allocate
    </button>
  ) : (
    renderStatus('Pending')
  )}
</td>


        

        {/* Notify: show only after eligible */}
        <td className="px-4 py-2">
          {onboarding?.hasNotifiedToAll?.status === 'failed' ? (
            <button
              disabled={retryNotifyId === user._id}
              onClick={async () => {
                setRetryNotifyId(user._id);
                try {
                  const res = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/api/onboarding/retry-notify/${user._id}`,
                    { method: 'POST' }
                  );
                  const result = await res.json();

                  if (res.ok) {
                    toast.success(result.message);
                  } else {
                    toast.error(result.message);
                  }
                } catch {
                  toast.error('Retry failed');
                } finally {
                  setRetryNotifyId(null);
                }
              }}
              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              {retryNotifyId === user._id ? "Retrying..." : "Retry"}
            </button>
          ) : (
            renderStatus(onboarding?.hasNotifiedToAll?.status || 'pending')
          )}
        </td>

        <td className="px-4 py-2">
          {!ndaSigned ? (
            <button
              onClick={() => {
                setDeleteId(user._id);
                setDeleteName(user.onboarding?.hrFilledInfo?.name || '');
                setConfirmInput('');
                setShowModal(true);
              }}
              className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-50 text-sm"
            >
              Delete
            </button>
          ) : (
            <button
              disabled
              title="Delete disabled after NDA completion"
              className="text-gray-400 border border-gray-300 px-2 py-1 rounded text-sm cursor-not-allowed"
            >
              Delete
            </button>
          )}
        </td>

         {/* {Edit Hr form} */}
         <td className="px-4 py-2"> 
          {!ndaSigned ? (
          <button
            onClick={() => navigate(`/onboarding/edit/${user._id}`)}
            className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-50 text-sm"
          >
            Edit
          </button>
        ) : (
          <button
            disabled
            title="Edit disabled after NDA completion"
            className="text-gray-400 border border-gray-300 px-2 py-1 rounded text-sm cursor-not-allowed"
          >
            Edit
          </button>
        )}

        </td>
      </tr>
    );
  })}
</tbody>


        </table>
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-gray-900 text-white p-6 rounded shadow-md w-full max-w-md text-left">
      <h2 className="text-xl font-semibold text-white mb-4 flex justify-center items-center gap-2">
  Confirm Delete <span>🗑️</span>
    </h2>
      <p className="mb-4">
        To confirm deletion of <span className="font-bold text-white">"{deleteName}"</span>,
        please type the name below:
      </p>

      <input
        type="text"
        placeholder="Type name to confirm"
        className="w-full px-4 py-2 rounded border border-gray-400 text-black focus:outline-none"
        value={confirmInput}
        onChange={(e) => setConfirmInput(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          toast.warning('Paste ❌ Not allowed. Please type the name manually.');
        }}
      />

      <p className="text-xs text-red-400 mt-1">Paste ❌ Not allowed. Please type the name manually.</p>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          Cancel
        </button>
        <button
          disabled={confirmInput.trim() !== deleteName.trim()}
          onClick={async () => {
            try {
              const res = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/api/onboarding/delete/${deleteId}`,
                { method: 'DELETE' }
              );
              const result = await res.json();
              if (res.ok) {
                toast.success(result.message || 'User deleted successfully');
                setUsers(users.filter(u => u._id !== deleteId));
              } else {
                toast.error(result.message || 'Failed to delete user');
              }
            } catch (err) {
              console.error(err);
              toast.error('Unexpected error');
            } finally {
              setShowModal(false);
            }
          }}
          className={`px-4 py-2 rounded text-white ${
            confirmInput.trim() === deleteName.trim()
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-red-400 cursor-not-allowed'
          }`}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default EmployeeOnboardingHome;
