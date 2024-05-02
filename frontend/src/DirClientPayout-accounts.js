import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
// import "./styles.css"; // Ensure you have some basic CSS for styling

const DirectClientPayouts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });

  useEffect(() => {
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

  const handleDownloadExcel = (event) => {
    if (event) event.stopPropagation(); // Prevent row toggle

    console.log("Received data for Excel processing:", data);

    // Filter records to include only priority 1
    const priorityOneRecords = data.filter(
      (assoc) => assoc.statusDetails && assoc.statusDetails.priority === 1
    );
    if (priorityOneRecords.length === 0) {
      console.log(
        "No records with priority 1 found for inclusion in the Excel file."
      );
      return;
    }

    console.log("Filtered data for Excel:", priorityOneRecords);

    // Convert the filtered data into the format needed for the spreadsheet
    const excelData = priorityOneRecords.map((assoc) => ({
      Client_Code: "MILESTONEP",
      Product_Code: "RPAY",
      Payment_Type: "",
      Payment_Ref_No: "",
      Payment_Date: "",
      Instrument_Date: "",
      Dr_Ac_No: "2111623031",
      Amount: assoc.Referral_Amount, // Sum of all Associate_Payout1 for priority 1
      Bank_Code_Indicator: "M",
      Beneficiary_Code: "",
      Beneficiary_Name: assoc.A_c_Holder_name,
      Beneficiary_Bank: "",
      Beneficiary_Branch_IFSC_Code: assoc.IFSC_Code,
      Beneficiary_Acc_No: assoc.A_c_Number,
      Location: "",
      Print_Location: "",
      Instrument_Number: "",
      Ben_Add1: "",
      Ben_Add2: "",
      Ben_Add3: "",
      Ben_Add4: "",
      Beneficiary_Email: "",
      Beneficiary_Mobile: "",
      Debit_Narration: `Payout Mutual Fund ${assoc["Lead_ID"]}`,
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

    console.log("Excel data to be written:", excelData);

    // Create the worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      skipHeader: false,
    });
    const workbook = XLSX.utils.book_new();
    const headers = [
      "Client_Code",
      "Product_Code",
      "Payment_Type",
      "Payment_Ref_No",
      "Payment_Date",
      "Instrument_Date",
      "Dr_Ac_No",
      "Amount",
      "Bank_Code_Indicator",
      "Beneficiary_Code",
      "Beneficiary_Name",
      "Beneficiary_Bank",
      "Beneficiary_Branch_IFSC_Code",
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
      "Payment_Details_1",
      "Payment_Details_2",
      "Payment_Details_3",
      "Payment_Details_4",
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

    console.log("Excel file has been created with priority 1 records.");
  };

  const handleReleasePayout = async (id) => {
    console.log("Releasing Payout...");

    try {
      // Send a POST request to your Flask endpoint with the list of filtered record IDs
      const response = await fetch(
        "https://milestone-api.azurewebsites.net/api/UpdateInsuracePayout_Accounts?code=zaCGvV0xsN5tMHJfSos0km4FRT3RH784csNXGRpC6P1bAzFu2Aj-6w==",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ record_ids: id }),
        }
      );

      // Check if response status is not okay
      if (!response.ok) {
        const errorMessage = `Failed to release payout. Status: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Log success message
      console.log("Payout released successfully.");
    } catch (error) {
      // Log and handle errors
      console.error("Error releasing payout:", error.message);
      // You can add additional error handling logic here, such as showing an error message to the user
    }
  };

  if (loading) return <div className="  h-[80vh] flex justify-center items-center"><div class="loader"></div> 
  </div>
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Direct Client Payouts - Accounts</h1>
      <label htmlFor="payoutDate text-lg">Set Payout Release Date :  </label>
      <input
       className=" py-2 px-2 rounded outline-blue-500 border-[2px] border-solid border-slate-300"
        type="date"
        value={filterDate}
        id="payoutDate"
        onChange={(e) => setFilterDate(e.target.value)}
        // style={{ margin: "10px 0" }}
      />
      <button  className=" bg-blue-600 rounded text-white py-3 px-3 hover:bg-blue-500" onClick={() => handleDownloadExcel()} style={{ float: "right" , transition:"0.5s" }}>
        Download Kotak CMS File
      </button>
      <table className="main-table w-full mt-4">
        <thead className="bg-black text-white">
          <tr>
            <th className=" text-left py-6 pl-4">Client Name</th>
            <th>Lead UCC</th>
            <th>Payout %</th>
            <th>Payout ₹</th>
            <th>Insurance Type</th>
            <th>Payout Date</th>
            <th>Status</th>
            <th className="">Action</th>
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
              <tr  key={index} className="border-b-[1px] border-solid border-black detail-row w-[50rem]  text-center text-sm  ">
                <td className=" py-5  w-[12rem] text-left pl-4">{item["Insurance_Lead_Name"]}</td>
                <td className=" w-[7rem] ">{item["Lead_ID"]}</td>
                <td className=" w-[7rem] ">{item["Merged_Referral_Fee"]}%</td>
                <td>₹ {item["Referral_Amount"]}</td>
                <td className="  w-[9rem] mx-6">{item["Insurance_Type"]}</td>
                <td>{item["Payout_Release_Date"]}</td>
                <td style={{ color: item.statusDetails.color }}>
                  {item.statusDetails.status}
                </td>
                <button  className=" bg-blue-500 rounded  p-3 m-3 text-white" onClick={() => handleReleasePayout(item["id"])}>
                  Released Payout
                </button>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default DirectClientPayouts;
