import React, { useEffect, useState } from "react";
import axios from "axios";

const MFSIPLeaderboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [error, setError] = useState("");

  // Fetch API data
  const fetchData = async (month = "", year = "") => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (month) params.append("month", parseInt(month)); // no leading zeros
      if (year) params.append("year", parseInt(year));

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/leaderboard/performance/sip-audit?${params.toString()}`,
        { withCredentials: true }
      );

      const apiData = res.data.data || [];
      setData(apiData);
      setFilteredData(apiData);
    } catch (err) {
      console.error("Error fetching SIP leaderboard:", err);
      setError("Failed to fetch SIP leaderboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch — default last 24 months
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch only when BOTH month and year are selected
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchData(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  // Month & Year dropdowns
  const months = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());


  if (error)
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">MF SIP Leaderboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled hidden>Month</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled hidden>Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {(selectedMonth || selectedYear !== currentYear.toString()) && (
            <button
              type="button"
                onClick={() => {
                setSelectedMonth("");
                setSelectedYear(currentYear.toString());
                fetchData("", currentYear.toString());
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
                Clear Filters
            </button>
            )}
      </div>

      {/* Table */}
      <div className="relative shadow-xl rounded-2xl bg-white w-full max-w-6xl overflow-x-auto">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <span className="text-gray-600 font-medium">Loading...</span>
          </div>
        )}
        <table className="min-w-full text-sm text-gray-700 border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              {[
                "Month",
                "Points",
                "SIP Incentive Points",
                "Streak",
                "SIP Registrations",
                "SIP Cancellations",
                "SWP Registrations",
                "SWP Cancellations",
                "AUM",
              ].map((header, i) => (
                <th
                  key={i}
                  className="py-3 px-4 text-center font-semibold text-gray-800 border-b whitespace-nowrap min-w-[120px]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-gray-50 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.month}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.points.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.sipIncentivePoints}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.streak}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.sipRegistrations.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.sipCancellations.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.swpRegistrations.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.swpCancellations.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">{row.aum.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No data found for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MFSIPLeaderboard;
