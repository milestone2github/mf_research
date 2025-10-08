import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AssignClients = () => {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const navigate = useNavigate();

	const [fes, setFEs] = useState([]);
	const [clients, setClients] = useState([]);
	const [selectedFE, setSelectedFE] = useState(null);
	const [selectedClient, setSelectedClient] = useState(null);
	const [customSlot, setCustomSlot] = useState({ start: "", end: "" });
	const [loading, setLoading] = useState(false);
	const [optimizeCurrentRoute, setOptimizeCurrentRoute] = useState(true); // toggle state

	const animatedComponents = makeAnimated();

	useEffect(() => {
		const fetchFEs = async () => {
			try {
				const res = await axios.get(`${baseUrl}/api/route-plan/fe/list`);
				setFEs(res.data || []);
			} catch (err) {
				console.error(err);
				toast.error("Failed to load Field Executives");
			}
		};

		const fetchClients = async () => {
			try {
				const res = await axios.get(
					`${baseUrl}/api/route-plan/clients/unassigned/all-time`
				);
				setClients(res.data.unassignedMeetings || []);
			} catch (err) {
				console.error(err);
				toast.error("Failed to load clients");
			}
		};

		fetchFEs();
		fetchClients();
	}, [baseUrl]);

	const toDatetimeLocal = (utcString) => {
		const date = new Date(utcString);
		const pad = (n) => n.toString().padStart(2, "0");
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate()
		)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	};

	const formatLocalDateTime = (utcString) => {
		const date = new Date(utcString);
		return date.toLocaleString("en-GB", {
			day: "2-digit",
			month: "long",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const clientOptions = clients.map((c) => ({
		value: c._id,
		label: `${c.clientId.name} (${c.clientId.contactNumber}) - ${new Date(
			c.availability.start
		).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		})}`,
		availabilityStart: toDatetimeLocal(c.availability.start),
		availabilityEnd: toDatetimeLocal(c.availability.end),
	}));

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!selectedFE || !selectedClient) {
			toast.error("FE and client selection required");
			return;
		}

		const slotStart = customSlot.start;
		const slotEnd = customSlot.end;

		if (!slotStart || !slotEnd) {
			toast.error("Start and end times are required");
			return;
		}

		try {
			setLoading(true);
			const startUTC = new Date(slotStart);
			const endUTC = new Date(slotEnd);

			await axios.post(`${baseUrl}/api/route-plan/assign-client`, {
				feId: selectedFE,
				visitId: selectedClient.value,
				slotStart: startUTC.toISOString(),
				slotEnd: endUTC.toISOString(),
				optimizeCurrentRoute: optimizeCurrentRoute,
			});

			toast.success("Client assigned successfully!");

			setClients((prev) => prev.filter((c) => c._id !== selectedClient.value));
			setSelectedClient(null);
			setSelectedFE(null);
			setCustomSlot({ start: "", end: "" });
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || "Failed to assign client");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl relative">
			<button
				type="button"
				onClick={() => navigate(-1)}
				className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
			>
				← Back
			</button>

			<h1 className="text-2xl font-bold mb-6 text-center">
				Assign Client to FE
			</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block mb-1 font-medium">Field Executive</label>
					<select
						value={selectedFE || ""}
						onChange={(e) => setSelectedFE(e.target.value)}
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
						required
					>
						<option value="">-- Select FE --</option>
						{fes.map((fe) => (
							<option key={fe._id} value={fe._id}>
								{fe.name} ({fe.employeeId})
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block mb-1 font-medium">Client</label>
					<Select
						components={animatedComponents}
						options={clientOptions}
						value={selectedClient}
						onChange={setSelectedClient}
						placeholder="Select client"
						isClearable
					/>
				</div>

				<div className="flex items-center gap-2 mt-2">
					<input
						type="checkbox"
						checked={optimizeCurrentRoute}
						onChange={() => setOptimizeCurrentRoute((prev) => !prev)}
						id="optimizeToggle"
					/>
					<label htmlFor="optimizeToggle" className="text-sm">
						Optimize route based on FE's current location
					</label>
				</div>

				{selectedClient && (
					<div className="space-y-2">
						<button
							type="button"
							className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg shadow-sm hover:bg-blue-200 transition"
							onClick={() =>
								setCustomSlot({
									start: selectedClient.availabilityStart,
									end: selectedClient.availabilityEnd,
								})
							}
						>
							Recommended Time:{" "}
							{formatLocalDateTime(selectedClient.availabilityStart)} –{" "}
							{formatLocalDateTime(selectedClient.availabilityEnd)}
						</button>

						<div className="grid grid-cols-2 gap-4 mt-2">
							<div>
								<label className="block font-medium">Custom Start</label>
								<input
									type="datetime-local"
									value={customSlot.start}
									onChange={(e) =>
										setCustomSlot((prev) => ({
											...prev,
											start: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
								/>
							</div>
							<div>
								<label className="block font-medium">Custom End</label>
								<input
									type="datetime-local"
									value={customSlot.end}
									onChange={(e) =>
										setCustomSlot((prev) => ({ ...prev, end: e.target.value }))
									}
									className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
								/>
							</div>
						</div>
					</div>
				)}

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
				>
					{loading ? "Assigning..." : "Assign Client"}
				</button>
			</form>

			<ToastContainer />
		</div>
	);
};