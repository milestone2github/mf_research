import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import PayoutConfirmModal from "../common/PayoutConfirmModal";
import Toast from "../common/Toast";
import { updateToast } from "../../reducers/ToastSlice";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const DirClientPayouts = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0)
  const [load, setLoad] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });

  const [buttonStates, setButtonStates] = useState({}); // Add state for button status

  const [isConfirmPayoutModalOpen, setIsConfimPayoutModalOpen] = useState(false)
  const [selectedPayoutItem, setSelectedPayoutItem] = useState(null)
  const [payoutModalError, setPayoutModalError] = useState(null)
  const [loadingRelease, setLoadingRelease] = useState(false)
  const dispatch = useDispatch()

  const gettotalsum = async () => {
    try {
      setLoad(true)
      let sum = 0
      data.forEach((item) => {
        sum = sum + item.Referral_Amount
      })
      setLoad(false)
      setTotal(sum)
    } catch (error) {
      setLoad(false)
      setTotal(null)
    }
  }
  useEffect(() => {
    gettotalsum(data)
  }, [data])
  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `${apiBaseUrl}/api/payout/insurance-data?mode=dir`
      )
      .then((response) => {
        setData(
          response.data.map((item) => ({
            ...item,
            statusDetails: getStatus(item),
          }))
        );
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch data: " + error.message);
        setLoading(false);
      });
  }, []);

  const getStatus = (record) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = new Date(record["Payout_Release_Date"]);
    releaseDate.setHours(0, 0, 0, 0);

    if (record.Discount_Approval !== "Approved") {
      return { status: "Approval Pending", color: "red", priority: 4 };
    } else if (!record.Lead_Funnel.includes("Verified")) {
      return {
        status: "Pending Data Verification",
        color: "amber",
        priority: 3,
      };
    } else if (releaseDate > today) {
      return { status: "In Cool off Period", color: "yellow", priority: 2 };
    } else if (!record.Accounts_Release) {
      return { status: "Pending at Accounts", color: "orange", priority: 1 };
    }
    return { status: "Payout Released", color: "green", priority: 0 };
  };

  const requestEarlyRelease = async (
    id,
    leadID,
    leadName,
    Associate_Name,
    insuranceType,
    Merged_Referral_Fee,
    Referral_Amount,
    payoutReleaseDate
  ) => {
    setLoadingRelease(true);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/payout/early-release`,
        {
          id,
          leadID,
          leadName,
          associateName: Associate_Name,
          insuranceType,
          mergedReferralFee: Merged_Referral_Fee,
          referralAmount: Referral_Amount,
          payoutReleaseDate,
          associatePayout: Merged_Referral_Fee,
        },
        { withCredentials: true }
      );

      if (response.status !== 200) {
        throw new Error(response.data.error || "Something went wrong");
      }

      setButtonStates((prevState) => ({
        ...prevState,
        [id]: { text: "Request Sent", color: "#60a5fa", disabled: true },
      }));

      dispatch(updateToast({ type: "success", message: "Request sent" }));
    } catch (error) {
      console.error("Error sending request:", error.message);

      dispatch(
        updateToast({
          type: "error",
          message: "Error sending request for release",
        })
      );
    }
  };

  const handleProceedPayout = async (name) => {
    if (name?.toLowerCase() !== selectedPayoutItem?.leadName?.toLowerCase()) {
      setPayoutModalError("Client name does not match!");
      return;
    }

    let {
      id,
      leadID,
      leadName,
      Associate_Name,
      insuranceType,
      Merged_Referral_Fee,
      Referral_Amount,
      payoutReleaseDate,
    } = selectedPayoutItem;

    await requestEarlyRelease(
      id,
      leadID,
      leadName,
      Associate_Name,
      insuranceType,
      Merged_Referral_Fee,
      Referral_Amount,
      payoutReleaseDate
    );

    setLoadingRelease(false);
    setIsConfimPayoutModalOpen(false);
    setPayoutModalError(null);
    setSelectedPayoutItem(null);
  };


  if (loading) return <div className="  h-[80vh] flex justify-center items-center"><div class="loader"></div>
  </div>
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Toast />
      <div className=" flex justify-between">
        <h1 className="text-2xl font-semibold">Dir Client Payouts</h1>
        {load ? <p>Calclating...</p> : <p className=" text-xl flex items-center">Overall Payout :
          &nbsp; <MdOutlineCurrencyRupee />{total.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0
          })}</p>}
      </div>
      <table className="main-table w-full">
        <thead className=" whitespace-nowrap">
          <tr className=" bg-black text-white ">
            <th className="  text-left py-6 pl-4">Client Name</th>
            <th className="  text-left ">Lead UCC</th>
            <th>Payout %</th>
            <th>Payout ₹</th>
            <th>Insurance Type</th>
            <th>Payout Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="detail-row text-sm text-center border-b-[1px] border-solid border-black ">
              <td className=" p-4 text-left w-[11rem]">{item["Insurance_Lead_Name"]}</td>
              <td>{item["Lead_ID"]}</td>
              <td className=" px-[2rem]">{item["Merged_Referral_Fee"]}%</td>
              <td className="whitespace-nowrap">₹ {item["Referral_Amount"].toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0
              })}</td>
              <td className=" text-center w-[10rem]  ">{item["Insurance_Type"]}</td>
              <td>{item["Payout_Release_Date"]}</td>
              <td style={{ color: item.statusDetails.color, textAlign: "center", fontWeight: "700" }}>
                {item.statusDetails.status}
              </td>
              <button className="rounded  p-3 m-3 text-white"
                style={{
                  backgroundColor: buttonStates[item["id"]]?.color || "#2563eb",
                  cursor: buttonStates[item["id"]]?.disabled ? "not-allowed" : "pointer"
                }}
                disabled={buttonStates[item["id"]]?.disabled}
                onClick={() => {
                  setIsConfimPayoutModalOpen(true);
                  setSelectedPayoutItem({
                    id: item.id,
                    leadID: item.Lead_ID,
                    leadName: item.Insurance_Lead_Name,
                    insuranceType: item.Insurance_Type,
                    Associate_Name: item.Associate_Name,
                    Merged_Referral_Fee: item.Merged_Referral_Fee,
                    Referral_Amount: item.Referral_Amount,
                    payoutReleaseDate: item.Payout_Release_Date,
                  })
                }}
              >
                {buttonStates[item["id"]]?.text || "Request Early Release"}
              </button>
            </tr>
          ))}
        </tbody>
      </table>
      <PayoutConfirmModal
        isOpen={isConfirmPayoutModalOpen}
        title={'Enter client name to request early release'}
        handleCancel={() => {
          setIsConfimPayoutModalOpen(false);
          setSelectedPayoutItem(null);
          setPayoutModalError(null)
        }}
        handleProceed={handleProceedPayout}
        isLoading={loadingRelease}
        error={payoutModalError}
      />
    </div>
  );
};

export default DirClientPayouts;
