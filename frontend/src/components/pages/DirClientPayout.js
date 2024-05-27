import React, { useState, useEffect } from "react";
import axios from "axios";
// import * as XLSX from "xlsx";
// import "./styles.css"; // Ensure you have some basic CSS for styling
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";

const DirClientPayouts = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(null)
  const [load, setLoad] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });

  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  const gettotalsum = async () => {
    try {
      setLoad(true)
      let sum = 0
      console.log(data);
      data.forEach((item)=>{
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
    if(!permissions.find(perm => perm === 'Direct Client Payout')){ return; }
    setLoading(true);
    axios
      .get(
        "https://milestone-api.azurewebsites.net/api/InsurancePayoutData?code=C3iSrLJO-5W4iJY0PPjc2ke-1Nf2jWA3ehJ2vqMbqFrdAzFuWuE-Ag==&mode=dir"
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

  const requestEarlyRelease = (
    id,
    leadID,
    leadName,
    Associate_Name,
    insuranceType,
    Merged_Referral_Fee,
    Referral_Amount,
    payoutReleaseDate
  ) => {
    const apiUrl = "http://127.0.0.1:5000"; // This should be the correct URL of your server
    const baseUrl =
      "https://milestone-api.azurewebsites.net/api/InsuranceEarlyPayout?code=ALwp8tdA-jpWhKhmbT7rfd1XG8ZA3jSypCsMHPoSho4cAzFu4WX-Cw==";

    // Construct the query parameters
    const queryParams = new URLSearchParams({
      id,
      Lead_Name: leadName, // Update parameter names as needed
      Associate_Name,
      Associate_Payout: Merged_Referral_Fee,
      Associate_Payout1: Referral_Amount,
    }).toString();

    console.log(baseUrl, "&", queryParams);
    const emailData = {
      subject: "Request for Early Payout Release",
      message_body: `
        <p>Dear Sir/Madam,</p>
        <p>I am requesting an early release of payout for the following record:</p>
        <p>Lead Name: ${leadName}</p>
        <p>Lead ID: ${leadID}</p>
        <p>Insurance Type: ${insuranceType}</p>
        <p>Refferal Payout %: ${Merged_Referral_Fee}%</p>
        <p>Refferal Payout ₹: ₹ ${Referral_Amount}</p>
        <p>Payout Release Date: ${payoutReleaseDate}</p>
        <p><a href="${baseUrl}&${queryParams}">Approve Early Payout</a></p>
        <p>Please process the payout at your earliest convenience.</p>
        <p>Regards,<br/>Milestone Team</p>
      `,
      to_email: "error@niveshonline.com",
    };

    axios
      .post(`${apiUrl}/api/send_mail`, emailData)
      .then((response) => {
        console.log("Email sent:", response.data.message);
      })
      .catch((error) => {
        console.error(
          "Error sending email:",
          error.response ? error.response.data.message : error.message
        );
      });
  };

  if(!permissions.find(perm => perm === 'Direct Client Payout')) 
    return (<AccessDenied />)

  if (loading) return <div className="  h-[80vh] flex justify-center items-center"><div class="loader"></div> 
  </div>
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
       <div className=" flex justify-between">
          <h1 className="text-2xl font-semibold">Dir Client Payouts</h1>
        { load ? <p>Calclating</p>: total ? <p className=" text-xl flex items-center">Overall Payout : 
         &nbsp; <MdOutlineCurrencyRupee/>{String(total).slice(0,8)}</p>  : <p>Total : Error Occured while Calculating</p>}
        </div>
      <table className="main-table w-full">
        <thead className=" whitespace-nowrap">
          <tr  className=" bg-black text-white ">
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
          {data
            .filter(
              (item) =>
                !filterDate ||
                new Date(item["Payout_Release_Date"])
                  .toISOString()
                  .substring(0, 10) <= filterDate
            )
            .map((item, index) => (
              <tr  key={index} className="detail-row text-sm text-center border-b-[1px] border-solid border-black ">
                <td className=" p-4 text-left w-[11rem]">{item["Insurance_Lead_Name"]}</td>
                <td>{item["Lead_ID"]}</td>
                <td className=" px-[2rem]">{item["Merged_Referral_Fee"]}%</td>
                <td>₹ {item["Referral_Amount"]}</td>
                <td className=" text-center w-[10rem]  ">{item["Insurance_Type"]}</td>
                <td>{item["Payout_Release_Date"]}</td>
                <td style={{ color: item.statusDetails.color , textAlign:"center" , fontWeight:"700" }}>
                  {item.statusDetails.status}
                </td>
                <button className=" bg-blue-500 rounded  p-3 m-3 text-white"
                  onClick={() =>
                    requestEarlyRelease(
                      item["id"], // Assuming item.id is the ID of the record
                      item["Lead_ID"],
                      item["Insurance_Lead_Name"], // Lead Name
                      item["Associate_Name"], // Lead ID
                      item["Insurance_Type"], // Insurance Type
                      item["Merged_Referral_Fee"], // Associate Payout percentage
                      item["Referral_Amount"], // Associate Payout1 amount
                      item["Payout_Release_Date"] // Payout Release Date
                    )
                  }
                >
                  Request Early Release
                </button>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default DirClientPayouts;
