import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AddVisit = () => {
	const [clients, setClients] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [loadingClients, setLoadingClients] = useState(false);
	const [formData, setFormData] = useState({
		clientId: "",
		visitingAddress: "",
		availabilityStart: "",
		availabilityEnd: "",
		locationCoordinates: "",
		purposeOfVisit: "",
		visitType: "",
		priority: "",
	});

	const [loading, setLoading] = useState(false);
	const [addressSuggestions, setAddressSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const navigate = useNavigate();
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const typingTimeoutRef = useRef(null);
	const searchTimeoutRef = useRef(null);

	// Set default start/end times (9 AM - 6 PM today)
	useEffect(() => {
		const today = new Date();
		const y = today.getFullYear();
		const m = String(today.getMonth() + 1).padStart(2, "0");
		const d = String(today.getDate()).padStart(2, "0");

		const defaultStart = `${y}-${m}-${d}T09:00`;
		const defaultEnd = `${y}-${m}-${d}T18:00`;

		setFormData((prev) => ({
			...prev,
			availabilityStart: prev.availabilityStart || defaultStart,
			availabilityEnd: prev.availabilityEnd || defaultEnd,
		}));
	}, []);

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const fetchClients = async (search = "") => {
		try {
			setLoadingClients(true);
			const res = await axios.get(`${baseUrl}/api/route-plan/clients/list`, {
				params: { search },
			});
			setClients(res.data.clientList || []);
		} catch (err) {
			console.error("Error fetching clients:", err);
			toast.error("Failed to fetch clients");
		} finally {
			setLoadingClients(false);
		}
	};

	// client list on page load
	useEffect(() => {
		fetchClients();
	}, []);

	const handleClientDropdownOpen = () => {
		setDropdownOpen((prev) => !prev);
	};

	const handleClientSearch = (e) => {
		const value = e.target.value;
		setSearchTerm(value);

		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

		searchTimeoutRef.current = setTimeout(() => {
			fetchClients(value);
		}, 600);
	};

	const handleClientSelect = async (clientId) => {
		setDropdownOpen(false);
		setFormData((prev) => ({ ...prev, clientId }));

		const selectedClient = clients.find((c) => c.clientId === clientId);
		if (!selectedClient) return;

		if (selectedClient.address) {
			setFormData((prev) => ({
				...prev,
				visitingAddress: selectedClient.address,
				locationCoordinates: "",
			}));

			try {
				const coordRes = await axios.get(`${baseUrl}/api/route-plan/client/getCoordinatesFromAddress`, {
					params: { address: selectedClient.address },
				});
				if (coordRes.data.coordinates) {
					setFormData((prev) => ({
						...prev,
						locationCoordinates: coordRes.data.coordinates.join(", "),
					}));
				}
			} catch (err) {
				console.error("Failed to auto-fetch coordinates:", err);
			}
		} else {
			setFormData((prev) => ({
				...prev,
				visitingAddress: "",
				locationCoordinates: "",
			}));
		}
	};

	const handleAddressInput = (e) => {
		const value = e.target.value;
		setFormData((prev) => ({ ...prev, visitingAddress: value }));

		// Clear old timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}
		if (value.length < 3) {
			setAddressSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		typingTimeoutRef.current = setTimeout(async () => {
			try {
				const res = await axios.post(`${baseUrl}/api/route-plan/client/searchAddress`, {
					searchedAddress: value,
				});
				setAddressSuggestions(res.data.suggestions || []);
				setShowSuggestions(true);
			} catch (err) {
				console.error("Error fetching address suggestions:", err);
			}
		}, 1000);
	};


	const handleSelectSuggestion = (s) => {
		setFormData((prev) => ({
			...prev,
			visitingAddress: s.address,
			locationCoordinates: s.coordinates ? s.coordinates.join(", ") : "",
		}));
		setAddressSuggestions([]);
		setShowSuggestions(false);
	};

	const handleClearSelection = () => {
		if (!formData.clientId && !formData.visitingAddress && !formData.locationCoordinates && !formData.purposeOfVisit) {
			return; // nothing to clear
		}

		setFormData((prev) => ({
			...prev,
			clientId: "",
			visitingAddress: "",
			locationCoordinates: "",
			purposeOfVisit: "",
			startTime: prev.startTime,
			endTime: prev.endTime,
		}));
		setDropdownOpen(false);
	};


	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const payload = {
				...formData,
				priority: Number(formData.priority),
				locationCoordinates: formData.locationCoordinates
					? formData.locationCoordinates.split(",").map(Number)
					: undefined,
			};

			const res = await axios.post(`${baseUrl}/api/route-plan/clients/add-visit`, payload);

			toast.success(res.data.message || "Visit added successfully!", {
				position: "bottom-center",
				autoClose: 3000,
			});

			// Reset form
			setFormData({
				clientId: "",
				visitingAddress: "",
				availabilityStart: "",
				availabilityEnd: "",
				locationCoordinates: "",
				purposeOfVisit: "",
				visitType: "",
				priority: "",
			});
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || "Failed to add visit", {
				position: "bottom-center",
				autoClose: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto  p-6 bg-white shadow-lg  border border-gray-200 rounded-2xl relative">
			{/* Back Button */}
			<button
				type="button"
				onClick={() => navigate(-1)}
				className="absolute left-4 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
			>
				← Back
			</button>

			{/* Clear Button (Right) */}
			<button
				type="button"
				onClick={handleClearSelection}
				disabled={
					!formData.clientId &&
					!formData.visitingAddress &&
					!formData.locationCoordinates &&
					!formData.purposeOfVisit
				}
				className={`absolute right-4 px-3 py-1 rounded-lg text-sm shadow-sm transition-all duration-300 ease-out
                      ${!formData.clientId &&
						!formData.visitingAddress &&
						!formData.locationCoordinates &&
						!formData.purposeOfVisit
						? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-0 translate-y-[-10px]"
						: "bg-red-100 hover:bg-red-200 text-red-600 opacity-100 translate-y-0"
					}
    `}
			>
				Clear Selection
			</button>


			<h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
				Add New Visit
			</h2>

			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Select Client */}
				<div className="relative">
					<label className="text-black block font-medium mb-1">Select Client</label>
					<div
						className="border rounded-lg px-3 py-2 bg-white cursor-pointer focus:ring focus:ring-blue-300"
						onClick={handleClientDropdownOpen}
					>
						{formData.clientId
							? clients.find((c) => c.clientId === formData.clientId)?.name || "-- Select Client --"
							: "-- Select Client --"}
					</div>

					{dropdownOpen && (
						<div className="absolute z-10 bg-white border rounded-lg shadow-lg w-full mt-1 max-h-72 overflow-y-auto">
							<div className="p-2 sticky top-0 bg-white border-b">
								<input
									type="text"
									placeholder="Search by name or number..."
									value={searchTerm}
									onChange={handleClientSearch}
									className="w-full px-2 py-1 border rounded-md"
								/>
							</div>

							{loadingClients ? (
								<div className="p-3 text-center text-gray-500 text-sm">Loading clients...</div>
							) : clients.length > 0 ? (

								clients.map((c) => {
									const raw = c.mobile || "";
									const formatted =
										raw.startsWith("+91") ? raw : raw.startsWith("91") ? `+${raw}` : `+91${raw}`;
									return (
										<div
											key={c.clientId}
											onClick={() => handleClientSelect(c.clientId)}
											className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
										>
											<strong>{c.name}</strong> ({formatted})
										</div>
									);
								})
							) : (
								<div className="p-3 text-center text-gray-500 text-sm">No clients found</div>
							)}
						</div>
					)}
				</div>

				{/* Visiting Address */}
				<div className="relative">
					<label className="text-black block font-medium mb-1">Visiting Address</label>
					<input
						type="text"
						name="visitingAddress"
						value={formData.visitingAddress}
						onChange={handleAddressInput}
						placeholder={
							formData.visitingAddress
								? "Edit visiting address"
								: "No Address Found !! Please enter Client visiting address"
						}
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
						autoComplete="off"
					/>

					{/* Suggestions dropdown */}
					{showSuggestions && addressSuggestions.length > 0 && (
						<ul className="absolute z-10 w-full bg-white border rounded-lg shadow-md max-h-60 overflow-y-auto">
							{addressSuggestions.map((s, idx) => (
								<li
									key={idx}
									className="p-2 hover:bg-blue-50 cursor-pointer"
									onClick={() => handleSelectSuggestion(s)}
								>
									<span className="text-sm font-semibold text-gray-600">{s.address}</span>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Start + End Time */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-black block font-medium mb-1">Start Time</label>
						<input
							type="datetime-local"
							name="availabilityStart"
							value={formData.availabilityStart}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
						/>
					</div>
					<div>
						<label className="text-black block font-medium mb-1">End Time</label>
						<input
							type="datetime-local"
							name="availabilityEnd"
							value={formData.availabilityEnd}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
						/>
					</div>
				</div>

				{/* Priority + Location Coordinates */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="text-black block font-medium mb-1">Priority</label>
						<select
							name="priority"
							value={formData.priority}
							onChange={handleChange}
							className="w-full px-3 py-2.5 h-[44px] border rounded-lg focus:ring focus:ring-blue-300"
						>
							<option value="">-- Select Priority --</option>
							<option value="1">Highest</option>
							<option value="2">High</option>
							<option value="3">Medium</option>
							<option value="4">Low</option>
							<option value="5">Lowest</option>
						</select>
					</div>
					<div>
						<label className="text-black block font-medium mb-1"> Location Coordinates (optional) </label>
						<input
							type="text"
							name="locationCoordinates"
							value={formData.locationCoordinates}
							onChange={handleChange}
							placeholder="e.g. 77.22, 28.11"
							className="w-full px-3 py-2.5 h-[44px] border rounded-lg focus:ring focus:ring-blue-300"
						/>
					</div>
				</div>

				{/* Visit Type + Purpose of Visit */}
				<div className="space-y-4">
					<div>
						<label className="text-black block font-medium mb-1">Visit Type</label>
						<select
							name="visitType"
							value={formData.visitType}
							onChange={handleChange}
							className="w-full px-3 py-2.5 h-[44px] border rounded-lg focus:ring focus:ring-blue-300"
						>
							<option value="">-- Select Type --</option>
							<option value="Collection">Collection</option>
							<option value="Handover">Handover</option>
							<option value="Exchange">Exchange</option>
						</select>
					</div>


					<div>
						<label className="text-black block font-medium mb-1">Purpose of Visit</label>
						<textarea
							name="purposeOfVisit"
							value={formData.purposeOfVisit}
							onChange={handleChange}
							required
							rows={2}
							className="w-full px-3 py-2.5 border rounded-lg focus:ring focus:ring-blue-300 resize-y"
							placeholder="Enter detailed purpose of visit"
						></textarea>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
				>
					{loading ? "Adding..." : "Add Visit"}
				</button>
			</form>

			<ToastContainer />
		</div>
	);
};