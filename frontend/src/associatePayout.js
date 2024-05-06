import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import * as XLSX from "xlsx";
// Ensure you have some basic CSS for styling
import { useSelector } from "react-redux";
import { MdOutlineCurrencyRupee } from "react-icons/md";

const AssociatePayout = () => {
  const navigate = useNavigate()
  const [total, setTotal] = useState(null)
  const [load, setLoad] = useState(false)
  const [data, setData] = useState({});
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
  //  const columns = [
  //    {
  //      name:"Toggle",
  //      selector:row=> <div>+</div>
  //    },
  //    {
  //     name:"Associate Name",
  //     selector:row=>row["Associate Name"]
  //    },
  //    {
  //     name:"Record Count",
  //     selector:row=><div>{row.}/{}</div>
  //    },
  //    {
  //     name:"Total Payout"
  //    },
  //    {
  //     name:"Main Record Status"
  //    }
  //  ]
  // useEffect(()=>{
  //   console.log(userstate);
  //    if(!userstate){
  //     navigate('/login')
  //    }
  // }, [userstate])
  useEffect(() => {
    setLoading(true);
    axios
      .get(
        "https://milestone-api.azurewebsites.net/api/InsurancePayoutData?code=C3iSrLJO-5W4iJY0PPjc2ke-1Nf2jWA3ehJ2vqMbqFrdAzFuWuE-Ag==&mode=ass", {
        // withCredentials: true
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

  // const handleDownloadExcel = (associatesData, event) => {
  //   if (event) event.stopPropagation(); // Prevent row toggle

  //   console.log("Received data for Excel processing:", associatesData);

  //   // Validate the overall structure of associatesData
  //   if (!Array.isArray(associatesData)) {
  //     console.error(
  //       "Invalid or missing associatesData: Expected an array but got:",
  //       typeof associatesData
  //     );
  //     return;
  //   }

  //   // First, group by Associate Name and filter to include only priority 1
  //   const groupedByAssociate = associatesData.reduce((acc, assoc) => {
  //     if (!assoc || typeof assoc !== "object") {
  //       console.error("Error: Invalid associate data", assoc);
  //       return acc;
  //     }

  //     const key = assoc["Associate Name"];
  //     if (!acc[key]) {
  //       acc[key] = {
  //         data: [],
  //         totalPriorityOnePayout: 0,
  //         firstRecord: null,
  //       };
  //     }

  //     console.log("Processing record:", assoc);

  //     // Check if the record meets the priority condition
  //     if (
  //       assoc.statusDetails &&
  //       assoc.statusDetails.priority === 1 &&
  //       assoc.Associate_Payout1
  //     ) {
  //       acc[key].data.push(assoc);
  //       acc[key].totalPriorityOnePayout += parseFloat(assoc.Associate_Payout1);
  //       if (!acc[key].firstRecord) {
  //         acc[key].firstRecord = assoc; // Save the first record for additional details
  //       }
  //     }

  //     return acc;
  //   }, {});

  //   console.log("Grouped data by associate:", groupedByAssociate);

  //   // Convert the grouped data into the format needed for the spreadsheet
  //   const priorityOneAggregates = Object.values(groupedByAssociate)
  //     .filter((assocGroup) => assocGroup.totalPriorityOnePayout > 0)
  //     .map((assoc) => ({
  //       Client_Code: "MILESTONEP",
  //       Product_Code: "RPAY",
  //       Payment_Type: "",
  //       Payment_Ref_No: "",
  //       Payment_Date: "",
  //       Instrument_Date: "",
  //       Dr_Ac_No: "2111623031",
  //       Amount: assoc.totalPriorityOnePayout, // Sum of all Associate_Payout1 for priority 1
  //       Bank_Code_Indicator: "M",
  //       Beneficiary_Code: "",
  //       Beneficiary_Name: assoc.data[0].Associate_Account_Holder_Name,
  //       Beneficiary_Bank: "",
  //       Beneficiary_Branch_IFSC_Code: assoc.data[0].Associate_IFSC_Code,
  //       Beneficiary_Acc_No: assoc.data[0].Associate_Account_Number,
  //       Location: "",
  //       Print_Location: "",
  //       Instrument_Number: "",
  //       Ben_Add1: "",
  //       Ben_Add2: "",
  //       Ben_Add3: "",
  //       Ben_Add4: "",
  //       Beneficiary_Email: "",
  //       Beneficiary_Mobile: "",
  //       Debit_Narration: `Payout Mutual Fund ${assoc.data[0]["Associate Name"]}`,
  //       Credit_Narration: "",
  //       Payment_Details_1: "",
  //       Payment_Details_2: "",
  //       Payment_Details_3: "",
  //       Payment_Details_4: "",
  //       Enrichment_1: "Milestone Global Moneymart pvt ltd.",
  //       Enrichment_2: "",
  //       Enrichment_3: "",
  //       Enrichment_4: "",
  //       Enrichment_5: "",
  //       Enrichment_6: "",
  //       Enrichment_7: "",
  //       Enrichment_8: "",
  //       Enrichment_9: "",
  //       Enrichment_10: "",
  //       Enrichment_11: "",
  //       Enrichment_12: "",
  //       Enrichment_13: "",
  //       Enrichment_14: "",
  //       Enrichment_15: "",
  //       Enrichment_16: "",
  //       Enrichment_17: "",
  //       Enrichment_18: "",
  //       Enrichment_19: "",
  //       Enrichment_20: "",
  //     }));

  //   if (priorityOneAggregates.length === 0) {
  //     console.log(
  //       "No records met the criteria for inclusion in the Excel file."
  //     );
  //     return;
  //   }

  //   console.log("Aggregated data for Excel:", priorityOneAggregates);

  //   // Create the worksheet and workbook
  //   const worksheet = XLSX.utils.json_to_sheet(priorityOneAggregates, {
  //     skipHeader: false,
  //   });
  //   const workbook = XLSX.utils.book_new();
  //   const headers = [
  //     "Client_Code",
  //     "Product_Code",
  //     "Payment_Type",
  //     "Payment_Ref_No",
  //     "Payment_Date",
  //     "Instrument Date",
  //     "Dr_Ac_No",
  //     "Amount",
  //     "Bank_Code_Indicator",
  //     "Beneficiary_Code",
  //     "Beneficiary_Name",
  //     "Beneficiary_Bank",
  //     "Beneficiary_Branch / IFSC Code",
  //     "Beneficiary_Acc_No",
  //     "Location",
  //     "Print_Location",
  //     "Instrument_Number",
  //     "Ben_Add1",
  //     "Ben_Add2",
  //     "Ben_Add3",
  //     "Ben_Add4",
  //     "Beneficiary_Email",
  //     "Beneficiary_Mobile",
  //     "Debit_Narration",
  //     "Credit_Narration",
  //     "Payment Details 1",
  //     "Payment Details 2",
  //     "Payment Details 3",
  //     "Payment Details 4",
  //     "Enrichment_1",
  //     "Enrichment_2",
  //     "Enrichment_3",
  //     "Enrichment_4",
  //     "Enrichment_5",
  //     "Enrichment_6",
  //     "Enrichment_7",
  //     "Enrichment_8",
  //     "Enrichment_9",
  //     "Enrichment_10",
  //     "Enrichment_11",
  //     "Enrichment_12",
  //     "Enrichment_13",
  //     "Enrichment_14",
  //     "Enrichment_15",
  //     "Enrichment_16",
  //     "Enrichment_17",
  //     "Enrichment_18",
  //     "Enrichment_19",
  //     "Enrichment_20",
  //   ];
  //   XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Priority One Records");
  //   XLSX.writeFile(workbook, "PriorityOneRecords.xlsx");

  //   console.log("Excel file has been created with records.");
  // };

  // const downloadAllData = (action) => {
  //   const allAssociatesData = Object.values(data)
  //     .map((assoc) => assoc.data)
  //     .flat();
  //   console.log("All Associates Data for Excel:", allAssociatesData);
  //   if (action === "download") {
  //     handleDownloadExcel(allAssociatesData);
  //   } else if (action === "releasePayout") {
  //     handleReleasePayout(allAssociatesData);
  //   }
  // };

  const requestEarlyRelease = (
    id,
    leadID,
    leadName,
    Associate_Name,
    insuranceType,
    associatePayout,
    associatePayout1,
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
      Associate_Payout: associatePayout,
      Associate_Payout1: associatePayout1,
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
        <p>Associate Payout: ${associatePayout}%</p>
        <p>Associate Payout1: ₹ ${associatePayout1}</p>
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

  // const handleReleasePayout = async (data) => {
  //   console.log("Releasing Payout...");

  //   try {
  //     // Check if data is empty or undefined
  //     if (!data || data.length === 0) {
  //       throw new Error("No data provided for payout release.");
  //     }

  //     // Filter records with priority 1 and payout release date before the filter date
  //     const filteredRecords = data.filter((record) => {
  //       const priority = record.statusDetails.priority;
  //       const payoutDate = new Date(record["Payout_Release_Date"])
  //         .toISOString()
  //         .substring(0, 10);
  //       // console.log(payoutDate);
  //       // console.log(filterDate);

  //       return priority === 1 && payoutDate <= filterDate;
  //     });

  //     // Extract the list of record IDs from the filtered data
  //     const recordIds = filteredRecords.map((record) => record.id);

  //     // Send a POST request to your Flask endpoint with the list of filtered record IDs
  //     const response = await fetch(
  //       "http://127.0.0.1:5000/api/associate-payout",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ record_ids: recordIds }),
  //       }
  //     );

  //     // Check if response status is not okay
  //     if (!response.ok) {
  //       const errorMessage = `Failed to release payout. Status: ${response.status} ${response.statusText}`;
  //       throw new Error(errorMessage);
  //     }

  //     // Log success message
  //     console.log("Payout released successfully.");
  //   } catch (error) {
  //     // Log and handle errors
  //     console.error("Error releasing payout:", error.message);
  //     // You can add additional error handling logic here, such as showing an error message to the user
  //   }
  // };

  if (loading) return <div className="  h-[80vh] flex justify-center items-center"><div class="loader"></div>
  </div>
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {userstate ? <div>
        <div className=" flex justify-between">
          <h1 className="text-2xl font-semibold">Associate Payouts</h1>
        { load ? <p>Calclating</p>: total ? <p className=" text-xl flex items-center">Overall Payout : 
         &nbsp; <MdOutlineCurrencyRupee/>{total}</p>  : <p>Total : Error Occured while Calculating</p>}
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
                            <button className=" whitespace-nowrap text-sm  bg-blue-500 rounded px-2 py-3 text-white"
                              onClick={() =>
                                requestEarlyRelease(
                                  item["id"], // Assuming item.id is the ID of the record
                                  item["Lead_ID"],
                                  item["Insurance_Lead_Name"], // Lead Name
                                  item["Associate_Name"], // Lead ID
                                  item["Insurance_Type"], // Insurance Type
                                  item["Associate_Payout"], // Associate Payout percentage
                                  item["Associate_Payout1"], // Associate Payout1 amount
                                  item["Payout_Release_Date"] // Payout Release Date
                                )
                              }
                            >
                              Request Early Release
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

      </div> : navigate('/login', { replace: true })}
    </>

  );
};

export default AssociatePayout;
