import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdContentCopy } from "react-icons/md";

export const ViewUnassignedClients = () => {
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [scope, setScope] = useState("today"); // today or all-time
	const [copiedClient, setCopiedClient] = useState(false);
	const [copiedVisit, setCopiedVisit] = useState(false);
	const navigate = useNavigate();
	const baseUrl = process.env.REACT_APP_API_BASE_URL;

	const fetchClients = async (selectedScope) => {
		try {
			setLoading(true);
			setError("");
			const endpoint =
				selectedScope === "all-time"
					? `${baseUrl}/api/route-plan/clients/unassigned/all-time`
					: `${baseUrl}/api/route-plan/clients/unassigned/today`;
			const res = await axios.get(endpoint);
			// unassigned meetings are returned as array of ClientMeeting
			setClients(res.data.unassignedMeetings || []);
		} catch (err) {
			console.error("Error fetching unassigned clients:", err);
			setError("Failed to fetch unassigned clients");
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
		return date.toLocaleString(); // converts UTC to local time
	};

	const copyText = async (text, setter) => {
		try {
			await navigator.clipboard.writeText(text);
			setter(true);
			setTimeout(() => setter(false), 2000);
		} catch (err) {
			console.error("Copy failed:", err);
		}
	};

	const truncate = (str) => {
		if (!str) return "-";
		return str.length > 70 ? str.slice(0, 70) + "..." : str;
	};

	const formatContactNumber = (num) => {
		if (!num) return "-";
		let n = num.toString().trim();
		n = n.replace(/\D/g, "");
		if (n.startsWith("91") && n.length === 12) {
			return `+91 ${n.slice(2)}`;
		}
		if (n.startsWith("91") && n.length > 12) {
			return `+91 ${n.slice(2)}`;
		}
		if (n.length === 10) {
			return n;
		}
		return num;
	};

	if (loading) return <p className="p-4">Loading...</p>;
	if (error) return <p className="p-4 text-red-500">{error}</p>;

	return (
		<div className="bg-gray-100 min-h-screen text-sm">
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

				<h1 className="text-2xl font-bold mb-4">Unassigned Client Visits</h1>

				{/* Scope Buttons */}
				<div className="mb-4 space-x-2">
					<button
						className={`px-2 py-1 rounded ${
							scope === "today"
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
						onClick={() => setScope("today")}
					>
						Today
					</button>
					<button
						className={`px-2 py-1 rounded ${
							scope === "all-time"
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
						onClick={() => setScope("all-time")}
					>
						All Time
					</button>
				</div>

				{/* Table */}
				{clients.length === 0 ? (
					<p className="text-gray-600">No unassigned client visits</p>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full border border-black rounded-lg text-sm">
							<thead className="bg-gray-300 border rounded-lg ">
								<tr>
									<th className="p-2 border whitespace-nowrap">Client Name</th>
									<th className="p-2 border whitespace-nowrap">Client Address</th>
									<th className="p-2 border whitespace-nowrap">Visit Address</th>
									<th className="p-2 border whitespace-nowrap">Availability</th>
									<th className="p-2 border whitespace-nowrap">Priority</th>
									<th className="p-2 border whitespace-nowrap">Actions</th>
								</tr>
							</thead>
							<tbody>
								{clients.map((meeting) => {
									const client = meeting.clientId || {};
									const visit = meeting; // this meeting is the unassigned visit
									return (
										<tr key={meeting._id} className="hover:bg-gray-50">
											<td className="p-2 border font-medium">
												<div className="flex flex-col">
													<span className="text-gray-900 font-medium">
														{client.name || "-"}
													</span>
													<span className="text-blue-700 text-xs mt-1 whitespace-nowrap">
														{formatContactNumber(client.contactNumber)}
													</span>
												</div>
											</td>
											<td className="p-2 border">
												<div className="flex items-center gap-1 text-xs">
													<span title={client.address || "-"}>
														{truncate(client.address)}
													</span>
													{/* Copy Button */}
													<button
														onClick={() => copyText(client.address || "-", setCopiedClient)}
														className="text-blue-600 hover:text-blue-800"
														title="Copy address"
													>
														<MdContentCopy size={18} />
													</button>

													{copiedClient && <span className="text-green-600 text-xs">Copied!</span>}
												</div>
											</td>

											<td className="p-2 border text-xs">
												<div className="flex items-center gap-1">
													<span title={visit.visitingAddress || "-"}>
														{truncate(visit.visitingAddress)}
													</span>
													<button
														onClick={() => copyText(visit.visitingAddress || "-", setCopiedVisit)}
														className="text-blue-600 hover:text-blue-800"
														title="Copy address"
													>
														<MdContentCopy size={18} />
													</button>
													{copiedVisit && <span className="text-green-600 text-xs">Copied!</span>}
												</div>
											</td>
											<td className="p-2 border text-xs">
												{visit.availability?.start &&
													`${formatDateTime(
														visit.availability.start
													)} - ${formatDateTime(visit.availability.end)}`}
											</td>
											<td className="p-2 border">{visit.priority ?? 0}</td>
											<td className="p-2 border">
												<button
													className="px-2 py-1 bg-green-500 text-white rounded"
													onClick={() =>
														navigate("/route-plan/assign-clients", {
															state: { clientMeetingId: visit._id },
														})
													}
												>
													Assign
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};
