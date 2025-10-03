import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

	const fetchPlanner = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`${baseUrl}/api/route-plan/get-combined-list`,
				{
					params: filters,
				}
			);
			setFes(res.data.data || []);
		} catch (err) {
			console.error(err);
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

	const utcToLocal = (utc) => new Date(utc).toLocaleString();

	return (
		<div className="p-6 bg-gray-100 min-h-screen relative">
			{/* Back button */}
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
					className="border p-2 rounded w-48"
					placeholder="FE Name"
					name="feName"
					value={filters.feName}
					onChange={handleFilterChange}
				/>
				<input
					className="border p-2 rounded w-48"
					placeholder="Employee ID"
					name="employeeId"
					value={filters.employeeId}
					onChange={handleFilterChange}
				/>
				<input
					className="border p-2 rounded w-48"
					placeholder="Client Name"
					name="clientName"
					value={filters.clientName}
					onChange={handleFilterChange}
				/>
				<input
					className="border p-2 rounded"
					type="date"
					name="startDate"
					value={filters.startDate}
					onChange={handleFilterChange}
				/>
				<input
					className="border p-2 rounded"
					type="date"
					name="endDate"
					value={filters.endDate}
					onChange={handleFilterChange}
				/>
				<select
					className="border p-2 rounded"
					name="status"
					value={filters.status}
					onChange={handleFilterChange}
				>
					<option value="">All</option>
					<option value="pending">Pending</option>
					<option value="completed">Completed</option>
				</select>
				<button
					className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
					onClick={handleSearch}
				>
					Search
				</button>
			</div>

			{/* FE Cards */}
			{loading ? (
				<p>Loading...</p>
			) : fes.length === 0 ? (
				<p>No FE assignments found.</p>
			) : (
				<div className="grid gap-6">
					{fes.map((fe) => (
						<div key={fe._id} className="bg-white rounded shadow p-4">
							<div className="flex justify-between items-center mb-2">
								<div>
									<h3 className="text-xl font-semibold">
										{fe.name} ({fe.employeeId})
									</h3>
									<p className="text-sm text-gray-500">Status: {fe.status}</p>
								</div>
								<div className="text-sm text-gray-600">
									Current Client:{" "}
									{fe.routeDetails?.currentClient?.name || "None"}
								</div>
							</div>

							{/* Booked Slots Table */}
							{fe.routeDetails?.bookedSlots?.length ? (
								<div className="overflow-x-auto">
									<table className="min-w-full border border-gray-200 rounded">
										<thead className="bg-gray-50 text-gray-700">
											<tr>
												<th className="px-4 py-2 border">Client</th>
												<th className="px-4 py-2 border">Address</th>
												<th className="px-4 py-2 border">Contact</th>
												<th className="px-4 py-2 border">Slot Start</th>
												<th className="px-4 py-2 border">Slot End</th>
												<th className="px-4 py-2 border">Status</th>
												<th className="px-4 py-2 border">FE Comments</th>
											</tr>
										</thead>
										<tbody>
											{fe.routeDetails.bookedSlots.map((slot) => (
												<tr key={slot._id} className="hover:bg-gray-50">
													<td className="px-4 py-2 border">
														{slot.client?.name}
													</td>
													<td className="px-4 py-2 border">
														{slot.client?.address}
													</td>
													<td className="px-4 py-2 border">
														{slot.client?.contactNumber}
													</td>
													<td className="px-4 py-2 border">
														{slot.visitDetails
															? utcToLocal(slot.visitDetails.availability.start)
															: utcToLocal(slot.start)}
													</td>
													<td className="px-4 py-2 border">
														{slot.visitDetails
															? utcToLocal(slot.visitDetails.availability.end)
															: utcToLocal(slot.end)}
													</td>
													<td className="px-4 py-2 border">
														{slot.visitDetails?.isCompleted
															? "Completed"
															: "Pending"}
													</td>
													<td className="px-4 py-2 border">
														{slot.visitDetails?.feComments?.length ? (
															slot.visitDetails.feComments.map((c, idx) => (
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
