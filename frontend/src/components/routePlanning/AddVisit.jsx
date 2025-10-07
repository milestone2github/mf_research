import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AddVisit = () => {
	const [clients, setClients] = useState([]);
	const [formData, setFormData] = useState({
		clientId: "",
		visitingAddress: "",
		availabilityStart: "",
		availabilityEnd: "",
		locationCoordinates: "",
		purposeOfVisit: "",
		priority: 0,
	});
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const baseUrl = process.env.REACT_APP_API_BASE_URL;

	useEffect(() => {
		// Fetch existing clients for dropdown
		const fetchClients = async () => {
			try {
				const res = await axios.get(`${baseUrl}/api/route-plan/clients/list`);
				setClients(res.data.clientList || []);
			} catch (err) {
				console.error("Error fetching clients:", err);
				toast.error("Failed to fetch clients for dropdown");
			}
		};
		fetchClients();
	}, [baseUrl]);

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const payload = {
				...formData,
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
				priority: 0,
			});
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.message || "Failed to add visit for client",
				{ position: "bottom-center", autoClose: 3000 }
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl relative">
			{/* Back Button Top Left */}
			<button
				type="button"
				onClick={() => navigate(-1)}
				className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
			>
				← Back
			</button>

			<h2 className="text-2xl font-bold mb-4 text-center">Add New Visit</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block font-medium mb-1">Select Client</label>
					<select
						name="clientId"
						value={formData.clientId}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					>
						<option value="">-- Select Client --</option>
						{clients.map((c) => (
							<option key={c.clientId} value={c.clientId}>
								{c.name} ({c.contactNumber})
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block font-medium mb-1">Visiting Address</label>
					<input
						type="text"
						name="visitingAddress"
						value={formData.visitingAddress}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="block font-medium mb-1">Start Time</label>
						<input
							type="datetime-local"
							name="availabilityStart"
							value={formData.availabilityStart}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
						/>
					</div>
					<div>
						<label className="block font-medium mb-1">End Time</label>
						<input
							type="datetime-local"
							name="availabilityEnd"
							value={formData.availabilityEnd}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
						/>
					</div>
				</div>

				<div>
					<label className="block font-medium mb-1">
						Location Coordinates (optional: lng, lat)
					</label>
					<input
						type="text"
						name="locationCoordinates"
						value={formData.locationCoordinates}
						onChange={handleChange}
						placeholder="77.1025, 28.7041"
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<div>
					<label className="block font-medium mb-1">Purpose of Visit</label>
					<input
						type="text"
						name="purposeOfVisit"
						value={formData.purposeOfVisit}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<div>
					<label className="block font-medium mb-1">Priority</label>
					<input
						type="number"
						name="priority"
						value={formData.priority}
						onChange={handleChange}
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
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