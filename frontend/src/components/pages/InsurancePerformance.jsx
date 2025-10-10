import axios from "axios";
import { useEffect, useState } from "react";

const InsurancePerformance = () => {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    async function fetchPerformance(leadId) {
        setLoading(true);
        try {
            let apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/leaderboard/performance/leaderboard-audit`;
            if (leadId) {
                apiUrl += `?leadId=${leadId}`;
            }
            const res = await axios.get(
                apiUrl,
                { withCredentials: true }
            );
            setData(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching performance:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Trigger API call at the mounting
    useEffect(() => {
        fetchPerformance();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPerformance(search);
    }

    return (
        <div className="w-full mx-auto bg-white rounded-2xl shadow-xl border-2 border-green-600 p-6 min-h-[80vh] transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-blue-100 pb-3 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">
                    Insurance Performance
                </h2>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6 flex items-center gap-3">
                <input
                    type="text"
                    placeholder="Search by Lead ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button type="submit" className="p-2 px-6 border rounded-md bg-blue-600 text-white">Search</button>
            </form>

            <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-inner">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-300 border-b border-gray-400 text-gray-800 text-sm uppercase tracking-wide">
                            {["S.No", "Lead ID", "Points", "Weight Factor", "Justification"].map((header, i) => (
                                <th
                                    key={i}
                                    className={`py-3 px-5 font-semibold ${i < 4 ? "border-r border-gray-200" : ""
                                        } ${i === 0 ? "w-[80px] text-center" : ""}`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="text-gray-700">
                        {loading ? (
                            // Skeleton loader while loading
                            [...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[40, 100, 80, 100, 160].map((w, j) => (
                                        <td key={j} className="py-4 px-5 border-t border-gray-100">
                                            <div
                                                className={`h-4 bg-gray-200 rounded ${j === 0 ? "mx-auto" : ""}`}
                                                style={{ width: w }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            // Data rows
                            data.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-blue-50 transition`}
                                >
                                    <td className="py-3 px-5 text-center font-medium">{idx + 1}</td>
                                    <td className="py-3 px-5 font-medium">{item.leadId}</td>
                                    <td className="py-3 px-5 text-blue-600 font-semibold">
                                        {item.points}
                                    </td>
                                    <td className="py-3 px-5 text-gray-700">{item.weightFactor}</td>
                                    <td className="py-3 px-5 text-gray-600">{item.justification}</td>
                                </tr>
                            ))
                        ) : (
                            // No data
                            <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InsurancePerformance;
