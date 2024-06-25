import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import AccessDenied from "./AccessDenied";
import PayoutConfirmModal from "../common/PayoutConfirmModal";

const AssociatePayout = () => {
  const navigate = useNavigate()
  const [total, setTotal] = useState(null)
  const [load, setLoad] = useState(false)
  const [data, setData] = useState({});
  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  const gettotalsum = async () => {
    try {
      setLoad(true)
      let sum = 0
      const arrdata = Object.entries(data).flat()
      arrdata.forEach((item) => {
        if (item.totalPayout) {
          sum = sum + item.totalPayout
        }
      })
      setLoad(false)
      setTotal(sum)
      console.log(sum);
    } catch (error) {
      setLoad(false)
      setTotal(null)
    }
  }
  useEffect(() => {
    gettotalsum(data)
  }, [data])

  const { userstate } = useSelector((state) => state.user)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null); // Track the expanded associate
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });
  const [buttonStates, setButtonStates] = useState({}); // Add state for button status

  const [isConfirmPayoutModalOpen, setIsConfimPayoutModalOpen] = useState(false)
  const [selectedPayoutItem, setSelectedPayoutItem] = useState(null)
  const [payoutModalError, setPayoutModalError] = useState(null)

  useEffect(() => {
    if (!permissions.find(perm => perm === 'Associate Payout')) { return; }
    setLoading(true);
    axios
      .get(
        "https://milestone-api.azurewebsites.net/api/InsurancePayoutData?code=C3iSrLJO-5W4iJY0PPjc2ke-1Nf2jWA3ehJ2vqMbqFrdAzFuWuE-Ag==&mode=ass", {
      }
      )
      .then((response) => {
        setData(groupData(response.data));
        let gData = groupData(response.data)
        gData.forEach(item => {
          console.log(item)
        });
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch data: " + error.message);
        setLoading(false);
      });
  }, []);

  const groupData = (rawData) => {
    return rawData.reduce((acc, curr) => {
      const statusDetails = getStatus(curr);
      if (!acc[curr["Associate Name"]]) {
        acc[curr["Associate Name"]] = {
          data: [],
          totalPayout: 0,
          entryCount: 0,
          processableCount: 0, // count of records with priority 2 or below
          highestStatus: statusDetails,
        };
      }
      acc[curr["Associate Name"]].data.push({ ...curr, statusDetails });
      acc[curr["Associate Name"]].totalPayout += parseFloat(
        curr["Associate_Payout1"] || 0
      );
      acc[curr["Associate Name"]].entryCount++;
      if (statusDetails.priority <= 1) {
        acc[curr["Associate Name"]].processableCount++; // Increment if priority is 2 or below
      }
      if (
        statusDetails.priority <
        acc[curr["Associate Name"]].highestStatus.priority
      ) {
        acc[curr["Associate Name"]].highestStatus = statusDetails;
      }
      return acc;
    }, []);
  };

  const getStatus = (record) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const releaseDate = new Date(record["Payout_Release_Date"]);
    releaseDate.setHours(0, 0, 0, 0);

    if (record.Payout_Approval !== "Approved") {
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

  const toggleDetail = (name, event) => {
    event.stopPropagation(); // Prevent triggering any parent event
    setExpanded(expanded === name ? null : name);
  };

  const requestEarlyRelease = (record) => {
    const baseUrl =
      "https://milestone-api.azurewebsites.net/api/InsuranceEarlyPayout?code=ALwp8tdA-jpWhKhmbT7rfd1XG8ZA3jSypCsMHPoSho4cAzFu4WX-Cw==";

    // Construct the query parameters
    const queryParams = new URLSearchParams({
      id: record.id,
      Lead_Name: record.Lead_Name, // Update parameter names as needed
      Associate_Name : record.Associate_Name,
      Associate_Payout: record.Associate_Payout,
      Associate_Payout1: record.Associate_Payout1,
    }).toString();

    console.log(baseUrl, "&", queryParams);
    const emailData = {
      subject: "Request for Early Payout Release",
      body: `
        <p>Dear Sir/Madam,</p>
        <p>I am requesting an early release of payout for the following record:</p>
        <p>Lead Name: ${record.Lead_Name}</p>
        <p>Lead ID: ${record.Lead_ID}</p>
        <p>Insurance Type: ${record.Insurance_Type}</p>
        <p>Associate Payout: ${record.Associate_Payout}%</p>
        <p>Associate Payout1: ₹ ${record.Associate_Payout1}</p>
        <p>Payout Release Date: ${record.Payout_Release_Date}</p>
        <p><a href="${baseUrl}&${queryParams}">Approve Early Payout</a></p>
        <p>Please process the payout at your earliest convenience.</p>
        <p>Regards,<br/>Milestone Team</p>
      `,
      toAddress: "error@niveshonline.com",
    };

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/send-mail`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(emailData)
    })
      .then((response) => {
        console.log("Email sent:", response.data?.message);

        setButtonStates(prevState => ({
          ...prevState,
          [record.id]: { text: "Request Sent", color: "#60a5fa", disabled: true }
        }));
      })
      .catch((error) => {
        console.error(
          "Error sending email:",
          error.response ? error.response.data.message : error.message
        );
      });
  };

  const handleProceedPayout = (name) => {
    if (name?.toLowerCase() !== selectedPayoutItem?.Lead_Name?.toLowerCase()) {
      setPayoutModalError('Lead name does not match!')
      return
    }

    requestEarlyRelease(selectedPayoutItem)
    setIsConfimPayoutModalOpen(false)
    setPayoutModalError(null)
    setSelectedPayoutItem(null)
  }

  if (!permissions.find(perm => perm === 'Associate Payout'))
    return (<AccessDenied />)

  if (loading) return <div className=" h-[80vh] flex justify-center items-center"><div class="loader"></div>
  </div>
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div>
        <div className=" flex justify-between">
          <h1 className="text-2xl font-semibold">Associate Payouts</h1>
          {load ? <p>Calclating</p> : total ? <p className=" text-xl flex items-center">Overall Payout :
            &nbsp; <MdOutlineCurrencyRupee />{total}</p> : <p>Total : Error Occured while Calculating</p>}
        </div>
        <div className=" rounded-2xl p-2 ">
          <table className="main-table  w-full mt-4">
            <thead className=" bg-black text-white ">
              <tr className="  bg-black text-white rounded-2xl ">
                <th className=" py-4 ">Toggle</th>
                <th>Associate Name</th>
                <th>Record Count</th>
                <th>Total Payout</th>
                <th>Main Record Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([name, details], index) => (
                <React.Fragment key={name}>
                  <tr className=" text-center  border-b-[1px] border-solid border-black">
                    <td className=" p-5 cursor-pointer text-lg" onClick={(e) => toggleDetail(name, e)}>
                      {expanded === name ? "−" : "+"}
                    </td>
                    <td>{name}</td>
                    <td>
                      {details.processableCount} / {details.entryCount}
                    </td>
                    <td>₹ {details.totalPayout.toFixed(2)}</td>
                    <td style={details.highestStatus.status === "In Cool off Period" ? { color: "blue", fontWeight: "700" } : { color: details.highestStatus.color, fontWeight: "700" }}>
                      {details.highestStatus.status}
                    </td>
                  </tr>
                  {expanded === name && (
                    <td colSpan="5" className="  rounded-md text-sm   ">
                      <tr style={{ padding: "0rem" }} className="detail-headers bg-gray-400 whitespace-nowrap overflow-x-auto w-full">
                        <th style={{ textAlign: "left", paddingBlock: "1rem" }}>Lead Name</th>
                        <th>Lead ID</th>
                        <th>Associate Payout</th>
                        <th>Associate Payout1</th>
                        <th>Insurance Type</th>
                        <th>Payout Release Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                      {details.data.map((item, index) => (
                        <tr key={index} className="lead bg-gray-200 text-center border-b-[1px] border-solid border-black overflow-x-auto w-full">
                          <td style={{ textAlign: "left", paddingLeft: "0.9rem" }}>{item["Insurance_Lead_Name"]}</td>
                          <td>{item["Lead_ID"]}</td>
                          <td>{item["Associate_Payout"]}%</td>
                          <td>₹ {item["Associate_Payout1"]}</td>
                          <td>{item["Insurance_Type"]}</td>
                          <td>{item["Payout_Release_Date"]}</td>

                          <td style={{ color: item.statusDetails.color }}>
                            {item.statusDetails.status}
                          </td>
                          <td className=" pr-3">
                            <button className=" whitespace-nowrap text-sm  rounded px-2 py-3 text-white"
                              style={{
                                backgroundColor: buttonStates[item["id"]]?.color || "#2563eb",
                                cursor: buttonStates[item["id"]]?.disabled ? "not-allowed" : "pointer"
                              }}
                              disabled={buttonStates[item["id"]]?.disabled}
                              onClick={() => {
                                setIsConfimPayoutModalOpen(true); 
                                setSelectedPayoutItem({
                                  id: item.id,
                                  Lead_ID: item.Lead_ID,
                                  Lead_Name: item.Insurance_Lead_Name,
                                  Insurance_Type: item.Insurance_Type,
                                  Associate_Name: item.Associate_Name,
                                  Associate_Payout: item.Associate_Payout,
                                  Associate_Payout1: item.Associate_Payout1,
                                  Payout_Release_Date: item.Payout_Release_Date,
                                })
                              }}
                            >
                              {buttonStates[item["id"]]?.text || "Request Early Release"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </td>

                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <PayoutConfirmModal
          isOpen={isConfirmPayoutModalOpen}
          title={'Enter lead name to request early release'}
          handleCancel={() => {
            setIsConfimPayoutModalOpen(false);
            setSelectedPayoutItem(null);
            setPayoutModalError(null)
          }}
          handleProceed={handleProceedPayout}
          error={payoutModalError}
        />
      </div>
    </>

  );
};

export default AssociatePayout;
