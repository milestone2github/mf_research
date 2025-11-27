import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CreateClient = () => {
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		contactNumber: "",
		visitingAddress: "",
		availabilityStart: "",
		availabilityEnd: "",
		purposeOfVisit: "",
		priority: 0,
		locationCoordinates: "",
	});

	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

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
			let locCoords = null;
			if (formData.locationCoordinates) {
				const parts = formData.locationCoordinates
					.split(",")
					.map((n) => parseFloat(n.trim()));
				if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
					locCoords = parts;
				}
			}

			const payload = { ...formData, locationCoordinates: locCoords };

			const res = await axios.post(
				`${baseUrl}/api/route-plan/clients/create`,
				payload
			);

			toast.success(res.data.message || "Client created successfully!", {
				position: "top-right",
				autoClose: 3000,
			});

			setFormData({
				name: "",
				address: "",
				contactNumber: "",
				visitingAddress: "",
				availabilityStart: "",
				availabilityEnd: "",
				purposeOfVisit: "",
				priority: 0,
				locationCoordinates: "",
			});

      // Redirect to index page
			// setTimeout(() => {
			// 	navigate("/route-plan");
			// }, 5000);
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to create client.", {
				position: "top-right",
				autoClose: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl relative">
			{/* Back Button */}
			<button
				type="button"
				onClick={() => navigate(-1)}
				className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
			>
				← Back
			</button>

			<h2 className="text-2xl font-bold mb-4 text-center">Create Client</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block font-medium mb-1">Client Name</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<div>
					<label className="block font-medium mb-1">Address</label>
					<input
						type="text"
						name="address"
						value={formData.address}
						onChange={handleChange}
						required
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<div>
					<label className="block font-medium mb-1">Contact Number</label>
					<input
						type="text"
						name="contactNumber"
						value={formData.contactNumber}
						onChange={handleChange}
						maxLength={10}
						required
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<div>
					<label className="block font-medium mb-1">Visiting Address (optional)</label>
					<input
						type="text"
						name="visitingAddress"
						value={formData.visitingAddress}
						onChange={handleChange}
						// required
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block font-medium mb-1">Availability Start</label>
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
						<label className="block font-medium mb-1">Availability End</label>
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

				{/* Future Google Maps Placeholder */}
				{/* <MapPicker onLocationSelect={(coords) => setFormData(prev => ({...prev, locationCoordinates: coords.join(",")}))} /> */}

				<div>
					<label className="block font-medium mb-1">
						Location Coordinates (optional)
					</label>
					<input
						type="text"
						name="locationCoordinates"
						placeholder="longitude,latitude"
						value={formData.locationCoordinates}
						onChange={handleChange}
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
				>
					{loading ? "Creating..." : "Create Client"}
				</button>
			</form>

			<ToastContainer />
		</div>
	);
};