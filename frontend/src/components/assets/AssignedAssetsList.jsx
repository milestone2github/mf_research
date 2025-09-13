import axios from "axios";
import { useEffect, useState } from "react";
import { FETCH_ASSIGNED_ASSETS } from "../../utils/urlConstants";
import { useNavigate } from "react-router-dom";

const AssignedAssetsList = () => {
	const [assets, setAssets] = useState([]);
	const [search, setSearch] = useState("");
	const [sortOrder, setSortOrder] = useState("desc");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const handler = setTimeout(() => {
			const params = {};
			if (search) params.q = search;
			if (sortOrder) params.sortBy = sortOrder;

			setLoading(true);
			axios
				.get(FETCH_ASSIGNED_ASSETS, { params })
				.then((res) => setAssets(res.data.data || []))
				.catch((err) => console.error("Error fetching assigned assets:", err))
				.finally(() => setLoading(false));
		}, 1000); // 1s debounce

		return () => clearTimeout(handler); // cancel previous timeout
	}, [search, sortOrder]);

	return (
		<div className="p-6">
			{/* Top action bar */}
			<div className="flex justify-between items-center mb-6">
				<button
					onClick={() => navigate("/assets")}
					className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
				>
					Back to Asset View
				</button>
				<div className="flex gap-2 ml-auto w-3/5">
					<input
						type="text"
						placeholder="Search by asset, user or remarks..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="border rounded-lg p-2 w-full"
					/>
					<select
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value)}
						className="border rounded-lg p-2 ml-auto"
					>
						<option value="desc">Newest First</option>
						<option value="asc">Oldest First</option>
					</select>
				</div>
			</div>

			{/* Data table */}
			<table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden">
				<thead className="bg-gray-100">
					<tr>
						<th className="p-3 text-left">User Name</th>
						<th className="p-3 text-left">Asset Name</th>
						<th className="p-3 text-left">Allocated By</th>
						<th className="p-3 text-left">Remarks</th>
						<th className="p-3 text-left">Allotment Date</th>
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td colSpan="5" className="p-8">
								<div className="flex items-center justify-center gap-3 text-gray-600">
									<span className="inline-block h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
									Loading assets...
								</div>
							</td>
						</tr>
					) : assets.length > 0 ? (
						assets.map((asset, idx) => (
							<tr key={idx} className="border-t hover:bg-gray-50">
								<td className="p-3">{asset.userName}</td>
								<td className="p-3">{asset.assetName}</td>
								<td className="p-3">{asset.updatedBy}</td>
								<td className="p-3">{asset.remarks}</td>
								<td className="p-3">
									{new Date(asset.allotmentDate).toLocaleDateString()}
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan="5" className="p-4 text-center text-gray-500">
								No assigned assets found.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

export default AssignedAssetsList;
