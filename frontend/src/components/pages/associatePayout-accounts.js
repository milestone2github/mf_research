import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";

const AssociatePayoutAccounts = () => {
  const [originalData, setOriginalData] = useState([]);
  const [data, setData] = useState({});
  const [total, setTotal] = useState(null);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });
  const [buttonStates, setButtonStates] = useState({}); // Add state for button status

  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  useEffect(() => {
    if (originalData.length) {
      let filteredData = originalData.filter(function (item) {
        return !filterDate ||
          new Date(item["Payout_Release_Date"])
            .toISOString()
            .substring(0, 10) <= filterDate
      });
      setData(groupData(filteredData));
    }
  }, [originalData, filterDate]);

  const gettotalsum = async () => {
    try {
      setLoad(true);
      let sum = 800;
      const arrdata = Object.entries(data).flat();
      arrdata.forEach((item) => {
        if (item.totalPayout) {
          sum = sum + item.totalPayout;
        }
      });
      setLoad(false);
      setTotal(sum);
    } catch (error) {
      setLoad(false);
      setTotal(null);
    }
  };
  useEffect(() => {
    gettotalsum(data);
  }, [data]);
  useEffect(() => {
    if (!permissions.find(perm => perm === 'Associate Payout Accounts')) { return; }
    setLoading(true);
    axios
      .get(
        "https://milestone-api.azurewebsites.net/api/InsurancePayoutData?code=C3iSrLJO-5W4iJY0PPjc2ke-1Nf2jWA3ehJ2vqMbqFrdAzFuWuE-Ag==&mode=ass"
      )
      .then((response) => {
        console.log(response.data);
        setOriginalData(response.data);
        setData(groupData(response.data));
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
          processableCount: 0,
          highestStatus: statusDetails,
        };
      }
      acc[curr["Associate Name"]].data.push({ ...curr, statusDetails });
      acc[curr["Associate Name"]].totalPayout += parseFloat(
        curr["Associate_Payout1"] || 0
      );
      acc[curr["Associate Name"]].entryCount++;
      if (statusDetails.priority <= 1) {
        acc[curr["Associate Name"]].processableCount++;
      }
      if (
        statusDetails.priority <
        acc[curr["Associate Name"]].highestStatus.priority
      ) {
        acc[curr["Associate Name"]].highestStatus = statusDetails;
      }
      return acc;
    }, {});
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
    event.stopPropagation();
    setExpanded(expanded === name ? null : name);
  };

  const handleDownloadExcel = (associatesData, event) => {
    if (event) event.stopPropagation(); // Prevent row toggle

    console.log("Received data for Excel processing:", associatesData);

    // Validate the overall structure of associatesData
    if (!Array.isArray(associatesData)) {
      console.error(
        "Invalid or missing associatesData: Expected an array but got:",
        typeof associatesData
      );
      return;
    }

    // First, group by Associate Name and filter to include only priority 1
    const groupedByAssociate = associatesData.reduce((acc, assoc) => {
      if (!assoc || typeof assoc !== "object") {
        console.error("Error: Invalid associate data", assoc);
        return acc;
      }

      const key = assoc["Associate Name"];
      if (!acc[key]) {
        acc[key] = {
          data: [],
          totalPriorityOnePayout: 0,
          firstRecord: null,
        };
      }

      console.log("Processing record:", assoc);

      // Check if the record meets the priority condition
      if (
        assoc.statusDetails &&
        assoc.statusDetails.priority === 1 &&
        assoc.Associate_Payout1
      ) {
        acc[key].data.push(assoc);
        acc[key].totalPriorityOnePayout += parseFloat(assoc.Associate_Payout1);
        if (!acc[key].firstRecord) {
          acc[key].firstRecord = assoc; // Save the first record for additional details
        }
      }

      return acc;
    }, {});

    console.log("Grouped data by associate:", groupedByAssociate);

    // Convert the grouped data into the format needed for the spreadsheet
    const priorityOneAggregates = Object.values(groupedByAssociate)
      .filter((assocGroup) => assocGroup.totalPriorityOnePayout > 0)
      .map((assoc) => ({
        Client_Code: "MILESTONEP",
        Product_Code: "RPAY",
        Payment_Type: "",
        Payment_Ref_No: "",
        Payment_Date: "",
        Instrument_Date: "",
        Dr_Ac_No: "2111623031",
        Amount: assoc.totalPriorityOnePayout, // Sum of all Associate_Payout1 for priority 1
        Bank_Code_Indicator: "M",
        Beneficiary_Code: "",
        Beneficiary_Name: assoc.data[0].Associate_Account_Holder_Name,
        Beneficiary_Bank: "",
        Beneficiary_Branch_IFSC_Code: assoc.data[0].Associate_IFSC_Code,
        Beneficiary_Acc_No: assoc.data[0].Associate_Account_Number,
        Location: "",
        Print_Location: "",
        Instrument_Number: "",
        Ben_Add1: "",
        Ben_Add2: "",
        Ben_Add3: "",
        Ben_Add4: "",
        Beneficiary_Email: "",
        Beneficiary_Mobile: "",
        Debit_Narration: `Payout Mutual Fund ${assoc.data[0]["Associate Name"]}`,
        Credit_Narration: "",
        Payment_Details_1: "",
        Payment_Details_2: "",
        Payment_Details_3: "",
        Payment_Details_4: "",
        Enrichment_1: "Milestone Global Moneymart pvt ltd.",
        Enrichment_2: "",
        Enrichment_3: "",
        Enrichment_4: "",
        Enrichment_5: "",
        Enrichment_6: "",
        Enrichment_7: "",
        Enrichment_8: "",
        Enrichment_9: "",
        Enrichment_10: "",
        Enrichment_11: "",
        Enrichment_12: "",
        Enrichment_13: "",
        Enrichment_14: "",
        Enrichment_15: "",
        Enrichment_16: "",
        Enrichment_17: "",
        Enrichment_18: "",
        Enrichment_19: "",
        Enrichment_20: "",
      }));

    if (priorityOneAggregates.length === 0) {
      console.log(
        "No records met the criteria for inclusion in the Excel file."
      );
      return;
    }

    console.log("Aggregated data for Excel:", priorityOneAggregates);

    // Create the worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(priorityOneAggregates, {
      skipHeader: false,
    });
    const workbook = XLSX.utils.book_new();
    const headers = [
      "Client_Code",
      "Product_Code",
      "Payment_Type",
      "Payment_Ref_No",
      "Payment_Date",
      "Instrument Date",
      "Dr_Ac_No",
      "Amount",
      "Bank_Code_Indicator",
      "Beneficiary_Code",
      "Beneficiary_Name",
      "Beneficiary_Bank",
      "Beneficiary_Branch / IFSC Code",
      "Beneficiary_Acc_No",
      "Location",
      "Print_Location",
      "Instrument_Number",
      "Ben_Add1",
      "Ben_Add2",
      "Ben_Add3",
      "Ben_Add4",
      "Beneficiary_Email",
      "Beneficiary_Mobile",
      "Debit_Narration",
      "Credit_Narration",
      "Payment Details 1",
      "Payment Details 2",
      "Payment Details 3",
      "Payment Details 4",
      "Enrichment_1",
      "Enrichment_2",
      "Enrichment_3",
      "Enrichment_4",
      "Enrichment_5",
      "Enrichment_6",
      "Enrichment_7",
      "Enrichment_8",
      "Enrichment_9",
      "Enrichment_10",
      "Enrichment_11",
      "Enrichment_12",
      "Enrichment_13",
      "Enrichment_14",
      "Enrichment_15",
      "Enrichment_16",
      "Enrichment_17",
      "Enrichment_18",
      "Enrichment_19",
      "Enrichment_20",
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Priority One Records");
    XLSX.writeFile(workbook, "PriorityOneRecords.xlsx");

    console.log("Excel file has been created with records.");
  };

  const downloadAllData = (action) => {
    const allAssociatesData = Object.values(data)
      .map((assoc) => assoc.data)
      .flat();
    if (action === "download") {
      handleDownloadExcel(allAssociatesData);
    } else if (action === "releasePayout") {
      handleReleasePayout(allAssociatesData);
    }
  };

  const downloadSingleAssociate = (associateName, action) => {
    const associateData = data[associateName];
    if (!associateData || !Array.isArray(associateData.data)) {
      console.error("Invalid or missing data for associate:", associateName);
      return;
    }

    const allAssociatesData = Object.values(data)
      .map((assoc) => assoc.data)
      .flat();

    const filteredData = allAssociatesData.filter(
      (assoc) => assoc.Associate.name === associateName
    );

    if (action === "download") {
      handleDownloadExcel(filteredData);
    } else if (action === "releasePayout") {
      handleReleasePayout(filteredData, associateName); // Pass associateName to handleReleasePayout
    }
  };

  const handleReleasePayout = async (data, associateName) => {
    try {
      if (!data || data.length === 0) {
        throw new Error("No data provided for payout release.");
      }

      const filteredRecords = data.filter((record) => {
        const priority = record.statusDetails.priority;
        const payoutDate = new Date(record["Payout_Release_Date"])
          .toISOString()
          .substring(0, 10);

        return priority === 1 && payoutDate <= filterDate;
      });

      const recordIds = filteredRecords.map((record) => record.id);

      // const response = await fetch('https://jsonplaceholder.typicode.com/posts')
      const response = await fetch(
        "https://milestone-api.azurewebsites.net/api/UpdateInsuracePayout_Accounts?code=zaCGvV0xsN5tMHJfSos0km4FRT3RH784csNXGRpC6P1bAzFu2Aj-6w==",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ record_ids: recordIds }),
        }
      );

      if (!response.ok) {
        const errorMessage = `Failed to release payout. Status: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      setButtonStates(prevState => ({
        ...prevState,
        [associateName]: { text: "Payout Released", color: "#60a5fa", disabled: true }
      }));

      console.log("Payout released successfully.");
    } catch (error) {
      console.error("Error releasing payout:", error.message);
    }
  };

  if (!permissions.find(perm => perm === 'Associate Payout Accounts'))
    return (<AccessDenied />);

  if (loading) return <div className="  h-[80vh] flex justify-center items-center"><div className="loader"></div>
  </div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className=" flex justify-between">
        <h1 className="text-2xl font-semibold">Associate Payout - Accounts</h1>
        {load ? <p>Calclating</p> : total ? <p className=" text-xl flex items-center">Overall Payout :
          &nbsp; <MdOutlineCurrencyRupee />{total}</p> : <p>Total : Error Occured while Calculating</p>}
      </div>
      <button className=" bg-blue-600 rounded text-white py-3 px-3 hover:bg-blue-700"
        onClick={() => downloadAllData("download")}
        style={{ float: "right" }}
      >
        Download Kotak CMS File
      </button>

      <label htmlFor="payoutDate">Set Payout Release Date : </label>
      <input
        className=" py-2 px-2 rounded outline-blue-500 border-[2px] border-solid border-slate-300"
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        style={{ margin: "10px 0" }}
      />
      <table className="main-table  w-full mt-4">
        <thead className=" bg-black text-white ">
          <tr >
            <th className=" pl-4 py-6">Toggle</th>
            <th>Associate Name</th>
            <th>Record Count</th>
            <th>Total Payout</th>
            <th>Main Record Status</th>
            <th>Download Excel</th>
            <th>Released Payout</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([name, details], index) => (
            <React.Fragment key={name}>
              <tr className="border-b-[1px] border-solid border-black rounded-2xl py-3 text-center  text-sm">
                <td className=" py-4 text-2xl cursor-pointer" onClick={(e) => toggleDetail(name, e)}>
                  {expanded === name ? "−" : "+"}
                </td>
                <td>{name}</td>
                <td>
                  {details.processableCount} / {details.entryCount}
                </td>
                <td>₹ {details.totalPayout.toFixed(2)}</td>
                <td className="" style={details.highestStatus.status === "In Cool off Period" ? { color: "blue", fontWeight: "700" } : { color: details.highestStatus.color, fontWeight: "700" }}>
                  {details.highestStatus.status}
                </td>
                <td>
                  <button className=" bg-slate-400 rounded whitespace-nowrap  p-3 m-3 text-white"
                    onClick={() => downloadSingleAssociate(name, "download")}
                  >
                    Download CMS File
                  </button>
                </td>
                <td>
                  <button
                    className="rounded whitespace-nowrap p-3 m-3 text-white"
                    style={{
                      backgroundColor: buttonStates[name]?.color || "#2563eb",
                      cursor: buttonStates[name]?.disabled ? "not-allowed" : "pointer"
                    }}
                    disabled={buttonStates[name]?.disabled}
                    onClick={() => downloadSingleAssociate(name, "releasePayout")}
                  >
                    {buttonStates[name]?.text || "Release Payout"}
                  </button>
                </td>
              </tr>
              {expanded === name && (
                <>
                  <tr className="detail-headers bg-gray-400 text-sm whitespace-nowrap  ">
                    <th style={{ paddingBlock: "1rem" }} >Lead Name</th>
                    <th>Lead ID</th>
                    <th>Associate Payout</th>
                    <th>Associate Payout1</th>
                    <th>Insurance Type</th>
                    <th>Payout Release Date</th>
                    <th>Status</th>
                  </tr>
                  {details.data
                    .filter(
                      (item) =>
                        !filterDate ||
                        new Date(item["Payout_Release_Date"])
                          .toISOString()
                          .substring(0, 10) <= filterDate
                    )
                    .map((item, index) =>
                      <tr key={index} className="detail-row bg-gray-200 text-sm text-center border-b-[1px] border-solid border-black  ">
                        <td className=" py-4 text-left pl-5" style={{ paddingBlock: "1.4rem" }}>{item["Insurance_Lead_Name"]}</td>
                        <td>{item["Lead_ID"]}</td>
                        <td>{item["Associate_Payout"]}%</td>
                        <td>₹ {item["Associate_Payout1"]}</td>
                        <td>{item["Insurance_Type"]}</td>
                        <td>{item["Payout_Release_Date"]}</td>
                        <td style={{ color: item.statusDetails.color }}>
                          {item.statusDetails.status}
                        </td>
                      </tr>
                    )}
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      
    </div>
  );
};

export default AssociatePayoutAccounts;
