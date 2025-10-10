import axios from "axios";
import { useEffect, useState } from "react";

const LeaderPerformance = () => {
    // Automatically detect current month and year
    const currentDate = new Date();
    const currentYear = String(currentDate.getFullYear());

    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [loading, setLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState([]);

    const months = [
        { name: "All Months", value: "" },
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

    const years = Array.from({ length: 6 }, (_, i) => currentYear - (5 - i)).reverse(); // 2025 → 2020

    // Convert month number to name
    const getMonthName = (monthStr) => {
        const monthNum = parseInt(monthStr?.split("-")[1], 10); // parse as number single-digit months
        return months[monthNum]?.name || "-";
    };

    async function fetchPerformance() {
        setLoading(true);
        try {
            let apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/leaderboard/performance/mf-leader-audit`;

            // Build query parameters
            const searchParams = new URLSearchParams();
            if (selectedYear) searchParams.append('year', selectedYear);
            if (selectedMonth && selectedMonth !== 'all') searchParams.append('month', selectedMonth);
            const queryString = searchParams.toString();

            // append query string if available 
            if (queryString) {
                apiUrl += `?${queryString}`;
            }

            const res = await axios.get(
                apiUrl,
                { withCredentials: true }
            );

            let data = res.data?.data || [];
            setPerformanceData(data);
        } catch (err) {
            console.error("Error fetching leaderboard performance:", err);
            setPerformanceData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, [selectedMonth, selectedYear]);

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

            <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-inner">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-300 border-b border-gray-400 text-gray-800 text-sm uppercase tracking-wide">
                            {["Month", "Points"].map((header, i) => (
                                <th
                                    key={i}
                                    className={`py-3 px-5 font-semibold ${i === 0 ? "border-r border-gray-200" : ""
                                        }`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="text-gray-700">
                        {loading ? (
                            // Skeleton rows while loading
                            [...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[100, 60].map((w, j) => (
                                        <td key={j} className="py-4 px-5 border-t border-gray-100">
                                            <div className="h-4 bg-gray-200 rounded" style={{ width: w }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : performanceData.length > 0 ? (
                            // Data rows
                            performanceData.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-indigo-50 transition`}
                                >
                                    <td className="py-3 px-5 font-medium text-gray-900">
                                        {getMonthName(item.month)} - {selectedYear}
                                    </td>
                                    <td className="py-3 px-5 text-indigo-600 font-semibold">
                                        {item.leaderBonusPoints}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // No data message
                            <tr>
                                <td colSpan="2" className="text-center py-6 text-gray-500 italic">
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
