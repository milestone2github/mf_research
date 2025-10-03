import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const CreateFE = () => {
	const [formData, setFormData] = useState({
		name: "",
		contactNumber: "",
		status: "active",
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
			const res = await axios.post(
				`${baseUrl}/api/route-plan/fe/create`,
				formData
			);

			toast.success(
				res.data.message || "Field Executive created successfully!",
				{
					position: "bottom-center",
					autoClose: 3000,
				}
			);

			setFormData({ name: "", contactNumber: "", status: "active" });

			// redirect after 5 sec (unused now)
			// setTimeout(() => {
			// 	navigate("/route-plan");
			// }, 5000);
		} catch (err) {
			toast.error(
				err.response?.data?.message || "Failed to create Field Executive.",
				{
					position: "bottom-center",
					autoClose: 3000,
				}
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

			<h2 className="text-2xl font-bold mb-4 text-center">
				Create Field Executive
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block font-medium mb-1">Name</label>
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
					<label className="block font-medium mb-1">Status</label>
					<select
						name="status"
						value={formData.status}
						onChange={handleChange}
						className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
					>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
				>
					{loading ? "Creating..." : "Create"}
				</button>
			</form>

			{/* Toast Container */}
			<ToastContainer />
		</div>
	);
};