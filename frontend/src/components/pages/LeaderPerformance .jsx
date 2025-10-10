import axios from "axios";
import { useEffect, useState } from "react";

const LeaderPerformance = ({ leadId }) => {
    // Automatically detect current month and year
    const currentDate = new Date();
    //   const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const currentYear = String(currentDate.getFullYear());

    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [loading, setLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState([]);

    //   /// Sample data (replace with API response)
    //   const allData = [
    //     { _id: "1", period_month: "2025-1", base_points_total_others: 50 },
    //     { _id: "2", period_month: "2025-3", base_points_total_others: 70 },
    //     { _id: "3", period_month: "2025-6", base_points_total_others: 110 },
    //     { _id: "4", period_month: "2025-10", base_points_total_others: 120 },
    //     { _id: "5", period_month: "2024-10", base_points_total_others: 95 },
    //     { _id: "6", period_month: "2023-7", base_points_total_others: 80 },
    //     { _id: "7", period_month: "2025-2", base_points_total_others: 50 },
    //     { _id: "8", period_month: "2025-3", base_points_total_others: 70 },
    //     { _id: "8", period_month: "2025-4", base_points_total_others: 110 },
    //     { _id: "10", period_month: "2025-9", base_points_total_others: 120 },
    //     { _id: "11", period_month: "2024-10", base_points_total_others: 95 },
    //     { _id: "12", period_month: "2025-11", base_points_total_others: 80 },
    //   ];

    const months = [
        { name: "All Months", value: "all" },
        { name: "January", value: "1" },
        { name: "February", value: "2" },
        { name: "March", value: "3" },
        { name: "April", value: "4" },
        { name: "May", value: "5" },
        { name: "June", value: "6" },
        { name: "July", value: "7" },
        { name: "August", value: "8" },
        { name: "September", value: "9" },
        { name: "October", value: "10" },
        { name: "November", value: "11" },
        { name: "December", value: "12" },
    ];

    const years = Array.from({ length: 6 }, (_, i) => currentYear - (5 - i)); // 2020 → 2025

    // Convert month number to name
    const getMonthName = (monthStr) => {
        const monthNum = parseInt(monthStr.split("-")[1], 10); // parse as number single-digit months
        return months[monthNum]?.name || "-";
    };

    async function fetchPerformance(){
        setLoading(true);
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/leaderboard/performance/leaderboard-audit?leadId=${leadId}`,
                { withCredentials: true }
            );

            let data = res.data?.data || [];

            // Filter by year
            data = data.filter((item) =>
                item.period_month ? item.period_month.startsWith(selectedYear) : true
            );

            // Filter by month if not 'all'
            if (selectedMonth !== "all") {
                data = data.filter(
                    (item) => item.period_month === `${selectedYear}-${selectedMonth}`
                );
            }

            setPerformanceData(data);
        } catch (err) {
            console.error("Error fetching leaderboard performance:", err);
            setPerformanceData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (leadId) fetchPerformance();
    }, [selectedMonth, selectedYear, leadId]);

    //   // Fetch filtered data
    //   useEffect(() => {
    //     setLoading(true);

    //    const fetchData = async () => {
    //       setTimeout(() => {
    //         // Filter by selected year and (optionally) month
    //         let filtered = allData.filter(
    //           (item) => item.period_month.startsWith(selectedYear)
    //         );

    //         if (selectedMonth !== "all") {
    //           filtered = filtered.filter(
    //             (item) => item.period_month === `${selectedYear}-${selectedMonth}`
    //           );
    //         }

    //         // Sort newest month first (optional)
    //         // filtered.sort((a, b) => (a.period_month < b.period_month ? 1 : -1));

    //         setPerformanceData(filtered);
    //         setLoading(false);
    //       }, 1000);
    //     };

    //     fetchData();
    //   }, [selectedMonth, selectedYear])


    return (
        <div className="w-full mx-auto bg-white rounded-2xl shadow-xl border-2 border-green-600 p-6 min-h-[80vh] transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-blue-100 pb-3 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">
                    Leader Performance
                </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
                {/* Month Filter */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 font-medium text-sm">
                        Select Month
                    </label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                    >
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Filter */}
                <div className="flex flex-col">
                    <label className="text-gray-600 mb-1 font-medium text-sm">
                        Select Year
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-inner">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-300 border-b border-gray-400 text-gray-800 text-sm uppercase tracking-wide">
                            <th className="py-3 px-5 font-semibold border-r border-gray-200">
                                Month
                            </th>
                            <th className="py-3 px-5 font-semibold">Points</th>
                        </tr>
                    </thead>

                    <tbody className="text-gray-700">
                        {loading ? (
                            performanceData.length > 0 ? performanceData : [...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-4 px-5 border-t border-gray-100">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="py-4 px-5 border-t border-gray-100">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </td>
                                </tr>
                            ))
                        ) : performanceData.length > 0 ? (
                            performanceData.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-indigo-50 transition`}
                                >
                                    <td className="py-3 px-5 font-medium text-gray-900">
                                        {getMonthName(item.period_month)}
                                    </td>
                                    <td className="py-3 px-5 text-indigo-600 font-semibold">
                                        {item.base_points_total_others}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="2"
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    No records found for selected period
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderPerformance;
