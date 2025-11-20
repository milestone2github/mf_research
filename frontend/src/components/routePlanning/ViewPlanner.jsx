import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdContentCopy } from "react-icons/md";

export const ViewPlanner = () => {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const navigate = useNavigate();
	const [fes, setFes] = useState([]);
	const [filters, setFilters] = useState({
		feName: "",
		employeeId: "",
		clientName: "",
		status: "",
		startDate: "",
		endDate: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [copiedVisitAddr, setCopiedVisitAddr] = useState(false);

	const fetchPlanner = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`${baseUrl}/api/route-plan/get-combined-list`,
				{
					params: filters,
				}
			);
			if (!res.data.success || !res.data.data?.length) {
				setMessage("No FE assignments found.");
				setFes([]);
			} else {
				setMessage("");
				setFes(res.data.data);
			}
		} catch (err) {
			console.error(err);
			setMessage("Error fetching data");
			setFes([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPlanner();
	}, []);

	const handleFilterChange = (e) => {
		setFilters({ ...filters, [e.target.name]: e.target.value });
	};

	const handleSearch = () => fetchPlanner();

	const handleClear = async () => {
		const cleared = {
			feName: "",
			employeeId: "",
			clientName: "",
			status: "",
			startDate: "",
			endDate: "",
		};
		setFilters(cleared);
		await fetchPlanner();
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") fetchPlanner();
	};

	const utcToLocal = (utc) => new Date(utc).toLocaleString();

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

	return (
		<div className="p-6 bg-gray-100 min-h-screen relative">
			<button
				type="button"
				onClick={() => navigate(-1)}
				className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
			>
				← Back
			</button>

			<h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
				FE Planner Dashboard
			</h2>

			{/* Filters */}
			<div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-3 items-end">
				<input
					className="border px-2 py-1 rounded w-48"
					placeholder="FE Name"
					name="feName"
					value={filters.feName}
					onChange={handleFilterChange}
					onKeyDown={handleKeyPress}
				/>
				<input
					className="border px-2 py-1 rounded w-48"
					placeholder="Employee ID"
					name="employeeId"
					value={filters.employeeId}
					onChange={handleFilterChange}
					onKeyDown={handleKeyPress}
				/>
				<input
					className="border px-2 py-1 rounded w-48"
					placeholder="Client Name"
					name="clientName"
					value={filters.clientName}
					onChange={handleFilterChange}
					onKeyDown={handleKeyPress}
				/>
				<input
					className="border px-2 py-1 rounded"
					type="date"
					name="startDate"
					value={filters.startDate}
					onChange={handleFilterChange}
					onKeyDown={handleKeyPress}
				/>
				<input
					className="border px-2 py-1 rounded"
					type="date"
					name="endDate"
					value={filters.endDate}
					onChange={handleFilterChange}
					onKeyDown={handleKeyPress}
				/>
				<select
					className="border px-2 py-1 rounded"
					name="status"
					value={filters.status}
					onChange={handleFilterChange}
				>
					<option value="">All</option>
					<option value="completed">Completed</option>
					<option value="pending">Pending</option>
					<option value="cancelled">Cancelled</option>
				</select>
				<button
					className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
					onClick={handleSearch}
				>
					Search
				</button>
				<button
					className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
					onClick={handleClear}
				>
					Clear
				</button>
			</div>

			{/* FE Cards */}
			{loading ? (
				<p>Loading...</p>
			) : message ? (
				<p className="text-center text-gray-600">{message}</p>
			) : (
				<div className="grid gap-6">
					{fes.map((fe) => (
						<div key={fe.feId._id} className="bg-white rounded shadow p-4">
							<div className="flex justify-between items-center mb-2">
								<div>
									<h3 className="text-xl font-semibold">
										{fe.feId.name} ({fe.feId.employeeId})
									</h3>
									<p className="text-sm text-gray-600">
										<span className="text-gray-700 font-medium">Contact:</span>{" "}
										{fe.feId.contactNumber || "-"}
									</p>
								</div>
								<p className="text-sm text-gray-600">
									<span className="text-gray-700 font-medium">Total Slots:</span>{" "}
									 {fe.bookedSlots.length}
								</p>
							</div>

							{/* Booked Slots Table */}
							{fe.bookedSlots.length ? (
								<div className="overflow-x-auto text-sm">
									<table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
										<thead className="bg-gray-100 text-gray-700">
											<tr>
												<th className="px-4 py-2 border whitespace-nowrap">Client</th>
												<th className="px-4 py-2 border whitespace-nowrap">Visiting Address</th>
												<th className="px-4 py-2 border whitespace-nowrap">Slot Start</th>
												<th className="px-4 py-2 border whitespace-nowrap">Slot End</th>
												<th className="px-4 py-2 border whitespace-nowrap">Status</th>
												<th className="px-4 py-2 border whitespace-nowrap">Priority</th>
												<th className="px-4 py-2 border whitespace-nowrap">Purpose of Visit</th>
												<th className="px-4 py-2 border whitespace-nowrap">FE Comments</th>
											</tr>
										</thead>
										<tbody>
											{fe.bookedSlots.map((slot) => (
												<tr key={slot._id} className="hover:bg-gray-100 bg-gray-50">
													<td className="p-2 border font-medium">
														<div className="flex flex-col">
															<span className="text-gray-900 font-mdedium">
																{slot.client?.name || "-"}
															</span>
															<span className="text-blue-700 text-xs mt-1 whitespace-nowrap">
																{formatContactNumber(slot.client?.contactNumber)}
															</span>
														</div>
													</td>
													<td className="px-4 py-2 border">
														<div className="text-xs flex items-center gap-1">
															<span title={slot.visit?.visitingAddress || "-"}>
																{truncate(slot.visit?.visitingAddress)}
															</span>

															<button
																onClick={() =>
																	copyText(slot.visit?.visitingAddress || "-", setCopiedVisitAddr)
																}
																className="text-blue-600 hover:text-blue-800"
																title="Copy address"
															>
																<MdContentCopy size={18} />
															</button>

															{copiedVisitAddr && (
																<span className="text-green-600 text-xs">Copied!</span>
															)}
														</div>
													</td>
													<td className="px-4 py-2 border">
														{utcToLocal(slot.start)}
													</td>
													<td className="px-4 py-2 border">
														{utcToLocal(slot.end)}
													</td>
													<td className="px-4 py-2 border whitespace-nowrap">
														{(() => {
															let status =
																slot.visit?.status ||
																(slot.visit?.isCompleted ? "completed" : "pending");

															let statusClasses = "";

															if (status === "completed") {
																statusClasses = "bg-green-200 text-green-700";
															} else if (status === "cancelled") {
																statusClasses = "bg-red-200 text-red-600";
															} else {
																statusClasses = "bg-yellow-200 text-yellow-600"; 
															}

															const label = status.charAt(0).toUpperCase() + status.slice(1);
															return (
																<span className={`px-3 py-2 rounded-full text-xs font-medium ${statusClasses}`}>
																	{label}
																</span>
															);
														})()}
													</td>

													<td className="px-4 py-2 border">
														{slot.visit?.priority || "-"}
													</td>
													<td className="px-4 py-2 border">
														{slot.visit?.purposeOfVisit || "-"}
													</td>
													<td className="px-4 py-2 border">
														{slot.visit?.feComments?.length ? (
															slot.visit.feComments.map((c, idx) => (
																<div
																	key={idx}
																	className="text-sm text-gray-700 mb-1"
																>
																	{c.text}{" "}
																	<span className="text-gray-400">
																		({utcToLocal(c.createdAt)})
																	</span>
																</div>
															))
														) : (
															<span className="text-gray-400">-</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<p className="text-gray-500 mt-2">No booked slots</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
