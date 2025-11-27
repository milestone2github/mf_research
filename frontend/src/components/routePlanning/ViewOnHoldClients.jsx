import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdContentCopy } from "react-icons/md";
import { getPriorityLabel } from "../../utils/routeOptimPriorityLabel";

export const ViewOnHoldClients = () => {
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [scope, setScope] = useState("today"); // today or all-time
	const [copiedClientId, setCopiedClientId] = useState(null);
const [copiedVisitId, setCopiedVisitId] = useState(null);
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

	// const formatDateTime = (utcDate) => {
	// 	if (!utcDate) return "-";
	// 	const date = new Date(utcDate);
	// 	return date.toLocaleString();
	// };

	const formatDateTime = (utcDate) => {
    if (!utcDate) return "-";
    const d = new Date(utcDate);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 → 12

    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
};

	// Copy to clipboard helper
	const copyText = async (text, setState, id) => {
		try {
			await navigator.clipboard.writeText(text);
			setState(id);
			setTimeout(() => setState(null), 2000);
		} catch (err) {
			console.error("Copy failed:", err);
		}
	};

	const truncate = (str) => {
		if (!str) return "-";
		return str.length > 70 ? str.slice(0, 70) + "..." : str;
	};

	const formatContactNumber  = (num) => {
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

				<h1 className="text-2xl font-bold mb-4">On-Hold Clients</h1>

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

				{clients.length === 0 ? (
					<p className="text-gray-600">No on-hold clients</p>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
							<thead className="bg-gray-300">
								<tr>
									<th className="p-2 border whitespace-nowrap">Name</th>
									<th className="p-2 border whitespace-nowrap">Client Address</th>
									<th className="p-2 border whitespace-nowrap">Visit Address</th>
									<th className="p-2 border whitespace-nowrap">Availability</th>
									<th className="p-2 border whitespace-nowrap">Priority</th>
									<th className="p-2 border whitespace-nowrap">Purpose of Visit</th>
									<th className="p-2 border whitespace-nowrap">Status</th>
								</tr>
							</thead>
							<tbody>
								{clients.map((c) => {
									let status = "";
									let statusClasses = "";

									if (c.isCompleted) {
										status = "Completed";
										statusClasses = "bg-green-200 text-green-700";
									} else if (c.onHold) {
										status = "On Hold";
										statusClasses = "bg-orange-200 text-orange-600";
									} else {
										status = "Pending";
										statusClasses = "bg-yellow-200 text-yellow-600";
									}

									return (
										<tr key={c._id} className="hover:bg-gray-50">

											<td className="p-2 border font-medium">
												<div className="flex flex-col">
													<span className="text-gray-900 font-medium">
														{c.clientId?.name ? c.clientId?.name.toUpperCase() : "-"}
													</span>

													<span className="text-blue-700 text-xs mt-1 whitespace-nowrap">
														{formatContactNumber(c.clientId?.contactNumber)}
													</span>
												</div>
											</td>

											<td className="p-2 border text-xs">
												<div className="flex items-center gap-1">
													<span title={c.clientId?.address || "-"}>
														{truncate(c.clientId?.address)}
													</span>

													<button
														onClick={() =>
															copyText(c.clientId?.address || "-", setCopiedClientId, c._id)
														}
														className="text-blue-600 hover:text-blue-800"
	title="Copy address"
													>
														<MdContentCopy size={18} />
													</button>

													{copiedClientId === c._id && (
														<span className="text-green-600 text-xs">Copied!</span>
													)}
												</div>
											</td>

											{/* Visit Address with copy */}
											<td className="p-2 border text-xs">
												<div className="flex items-center gap-1">
													<span title={c.visitingAddress || "-"}>
														{truncate(c.visitingAddress)}
													</span>

													<button
														onClick={() =>
															copyText(c.visitingAddress || "-", setCopiedVisitId, c._id)
														}
														className="text-blue-600 hover:text-blue-800"
	title="Copy address"
													>
														<MdContentCopy size={18} />
													</button>

													{copiedVisitId === c._id && (
														<span className="text-green-600 text-xs">Copied!</span>
													)}
												</div>
											</td>
											<td className="p-2 border text-xs">
												{c.availability?.start &&
													`${formatDateTime(c.availability.start)} - ${formatDateTime(
														c.availability.end
													)}`}
											</td>
											<td className="p-2 border text-xs">{getPriorityLabel(c.priority)}</td>
											<td className="p-2 border text-xs">{c.purposeOfVisit ?? "-"}</td>

											<td className="p-2 border whitespace-nowrap">
												<span
													className={`px-3 py-2 rounded-full text-xs font-semibold ${statusClasses}`}
												>
													{status}
												</span>
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
