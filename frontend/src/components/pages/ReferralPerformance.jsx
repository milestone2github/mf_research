import axios from "axios";
import { useEffect, useState } from "react";

const ReferralPerformance = () => {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    async function fetchReferralPerformance() {
        setLoading(true);
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/leaderboard/performance/referral?leadId=${search}`,
                { withCredentials: true }
            );

            setData(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching referral performance:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when component mounts or search changes
    useEffect(() => {
     fetchReferralPerformance();
    }, []);

    //   // Simulated backend fetch (you'll replace this with API call using `search` query)
    //   useEffect(() => {
    //     setLoading(true);
    //     const fetchData = async () => {
    //       // Simulate API delay
    //       setTimeout(() => {
    //         const allData = [
    //           {
    //             lead_id: "MPF13329",
    //             points: 15,
    //             justification: "Referral MPF13329 investment",
    //           },
    //            {
    //             lead_id: "MPF13329",
    //             points: 15,
    //             justification: "Referral MPF13329 investment",
    //           },
    //            {
    //             lead_id: "MPF13329",
    //             points: 15,
    //             justification: "Referral MPF13329 investment",
    //           },
    //           {
    //             lead_id: "MPF14452",
    //             points: 10,
    //             justification: "Referral MPF14452 insurance",
    //           },
    //         ];

    //         // Normally here you'd call your backend:
    //         // const res = await axios.get(`/api/referral-performance?search=${search}`);
    //         const filtered = allData.filter((item) =>
    //           item.lead_id.toLowerCase().includes(search.toLowerCase())
    //         );

    //         setData(filtered);
    //         setLoading(false);
    //       }, 1200);
    //     };

    //     fetchData();
    //   }, [search]);

    return (
        <div className="w-full mx-auto bg-white rounded-2xl shadow-xl border-2 border-green-600 p-6 min-h-[80vh] transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-blue-100 pb-3 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">
                    Referral Performance
                </h2>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex items-center gap-3">
                <input
                    type="text"
                    placeholder="🔍 Search by Lead ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-inner">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-300 border-b border-gray-400 text-gray-800 text-sm uppercase tracking-wide">
                            <th className="py-3 px-5 font-semibold border-r border-gray-200 w-[80px] text-center">
                                S.No
                            </th>
                            <th className="py-3 px-5 font-semibold border-r border-gray-200">
                                Lead ID
                            </th>
                            <th className="py-3 px-5 font-semibold border-r border-gray-200">
                                Points
                            </th>
                            <th className="py-3 px-5 font-semibold">Justification</th>
                        </tr>
                    </thead>

                    <tbody className="text-gray-700">
                        {loading ? (
                            data.length > 0 ? data : [...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-4 px-5 border-t border-gray-100 text-center">
                                        <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                                    </td>
                                    <td className="py-4 px-5 border-t border-gray-100">
                                        <div className="h-4 bg-gray-200 rounded w-24 shimmer"></div>
                                    </td>
                                    <td className="py-4 px-5 border-t border-gray-100">
                                        <div className="h-4 bg-gray-200 rounded w-16 shimmer"></div>
                                    </td>
                                    <td className="py-4 px-5 border-t border-gray-100">
                                        <div className="h-4 bg-gray-200 rounded w-48 shimmer"></div>
                                    </td>
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className={`border-t border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-blue-50 transition`}
                                >
                                    <td className="py-3 px-5 text-center text-gray-900 font-medium">
                                        {idx + 1}
                                    </td>
                                    <td className="py-3 px-5 font-medium text-gray-900">
                                        {item.lead_id}
                                    </td>
                                    <td className="py-3 px-5 text-blue-600 font-semibold">
                                        {item.points}
                                    </td>
                                    <td className="py-3 px-5 text-gray-600">
                                        {item.justification}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="text-center py-6 text-gray-500 italic"
                                >
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

export default ReferralPerformance;
