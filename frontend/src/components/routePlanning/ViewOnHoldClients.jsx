import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const ViewOnHoldClients = () => {
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [scope, setScope] = useState("today"); // today or all-time
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const navigate = useNavigate();

	const fetchClients = async (selectedScope) => {
		try {
			setLoading(true);
			setError("");
			const res = await axios.get(
				`${baseUrl}/api/route-plan/clients/on-hold?scope=${selectedScope}`
			);
			setClients(res.data || []);
		} catch (err) {
			console.error("Error fetching on-hold clients:", err);
			setError("Failed to fetch on-hold clients");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClients(scope);
	}, [scope]);

	const formatDateTime = (utcDate) => {
		if (!utcDate) return "-";
		const date = new Date(utcDate);
		return date.toLocaleString();
	};

	if (loading) return <p className="p-4">Loading...</p>;
	if (error) return <p className="p-4 text-red-500">{error}</p>;

	return (
		<div className="bg-gray-100 min-h-screen">
			<div className="p-6 max-w-7xl mx-auto">
				{/* Back button */}
				<div className="mb-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
					>
						← Back
					</button>
				</div>

				<h1 className="text-2xl font-bold mb-4">On-Hold Clients</h1>

				{/* Scope Buttons */}
				<div className="mb-4 space-x-2">
					<button
						className={`px-4 py-2 rounded ${
							scope === "today"
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
						onClick={() => setScope("today")}
					>
						Today
					</button>
					<button
						className={`px-4 py-2 rounded ${
							scope === "all-time"
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
						onClick={() => setScope("all-time")}
					>
						All Time
					</button>
				</div>

				{clients.length === 0 ? (
					<p className="text-gray-600">No on-hold clients</p>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full border border-gray-200 rounded-lg">
							<thead className="bg-gray-100">
								<tr>
									<th className="p-2 border">Name</th>
									<th className="p-2 border">Contact</th>
									<th className="p-2 border">Address</th>
									<th className="p-2 border">Visit Address</th>
									<th className="p-2 border">Availability</th>
									<th className="p-2 border">Priority</th>
									<th className="p-2 border">Status</th>
								</tr>
							</thead>
							<tbody>
								{clients.map((c) => (
									<tr key={c._id} className="hover:bg-gray-50">
										<td className="p-2 border">{c.clientId?.name || "-"}</td>
										<td className="p-2 border">
											{c.clientId?.contactNumber || "-"}
										</td>
										<td className="p-2 border">{c.clientId?.address || "-"}</td>
										<td className="p-2 border">{c.visitingAddress || "-"}</td>
										<td className="p-2 border">
											{c.availability?.start &&
												`${formatDateTime(
													c.availability.start
												)} - ${formatDateTime(c.availability.end)}`}
										</td>
										<td className="p-2 border">{c.priority ?? 0}</td>
										<td className="p-2 border">
											{c.isCompleted
												? "Completed"
												: c.onHold
												? "On Hold"
												: "Pending"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};
