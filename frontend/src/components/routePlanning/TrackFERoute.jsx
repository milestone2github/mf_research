import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export const TrackFERoute = () => {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const googleApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
	const googleMapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
	const navigate = useNavigate();

	const [fes, setFEs] = useState([]);
	const [selectedFE, setSelectedFE] = useState("");
	const [feData, setFEData] = useState(null);
	const [map, setMap] = useState(null);
	const [markers, setMarkers] = useState([]);

	// Load FEs who have assigned clients today
	useEffect(() => {
		const fetchAssignedFEs = async () => {
			try {
				const res = await axios.get(`${baseUrl}/api/route-plan/fe/list`);
				setFEs(res.data || []);
			} catch (err) {
				console.error(err);
			}
		};
		fetchAssignedFEs();
	}, [baseUrl]);

	// Fetch FE details (FERoute + ClientMeeting)
	const fetchFEData = async (feId) => {
		if (!feId) return;

		try {
			const res = await axios.get(`${baseUrl}/api/route-plan/fe/${feId}/track`);
			setFEData(res.data);
		} catch (err) {
			console.error(err);

			// Clear map markers
			markers.forEach((m) => m.setMap(null));
			setMarkers([]);

			// Find selected FE name
			const fe = fes.find((f) => f._id === feId);
			const feName = fe ? fe.name : feId;

			// Show toast warning
			const msg =
				`No clients assigned to FE: ${feName}` || err.response?.data?.message;
			toast.warning(msg);

			// Reset FE data
			setFEData(null);
		}
	};
  
	// Load Google Maps script dynamically
	useEffect(() => {
		// Initialize map
		const initMap = () => {
			const mapObj = new window.google.maps.Map(
				document.getElementById("map"),
				{
					center: { lat: 28.7195327, lng: 77.1092925 }, // fallback to office
					zoom: 12,
					mapId: googleMapId,
				}
			);
			setMap(mapObj);
		};

		if (!window.google) {
			const script = document.createElement("script");
			script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
			script.async = true;
			script.onload = initMap;
			document.body.appendChild(script);
		} else {
			initMap();
		}
	}, [googleApiKey, googleMapId]);

	const markersRef = useRef([]);

	// Render markers when FE data changes
	useEffect(() => {
		if (!map || !feData) return;

		// Clear old markers
		markersRef.current.forEach((m) => m.setMap(null));
		markersRef.current = [];

		const newMarkers = [];

		// FE marker
		if (feData.feLocation) {
			const [lng, lat] = feData.feLocation.coordinates;
			const position = { lat, lng };

			const feContent = document.createElement("div");
			feContent.className =
				"bg-blue-600 text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center shadow-lg ring-2 ring-blue-300 ring-opacity-50";
			feContent.textContent = "FE";
			const feMarker = new window.google.maps.marker.AdvancedMarkerElement({
				map,
				position: position,
				content: feContent,
			});
			newMarkers.push(feMarker);
			map.setCenter(position);
		}

		// Client marker
		if (feData.clientLocation) {
			const [lng, lat] = feData.clientLocation.coordinates;
			const position = { lat, lng };

			const clientContent = document.createElement("div");
			clientContent.className =
				"bg-green-600 text-white font-medium text-sm px-3 py-1 rounded shadow-md";
			clientContent.textContent = "Client";

			const clientMarker = new window.google.maps.marker.AdvancedMarkerElement({
				map,
				position: position,
				content: clientContent,
			});
			newMarkers.push(clientMarker);
		}
		setMarkers(newMarkers);
	}, [feData, map]);

	return (
		<div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
			<div className="flex">
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
				<h1 className="mx-auto text-2xl font-bold mb-4 text-center">
					Track FE Route
				</h1>
			</div>

			<div className="flex items-center gap-4 mb-4">
				<select
					value={selectedFE}
					onChange={(e) => {
						setSelectedFE(e.target.value);
						fetchFEData(e.target.value);
					}}
					className="flex-1 px-3 py-2 border rounded-lg"
				>
					<option value="">-- Select Field Executive --</option>
					{fes.map((fe) => (
						<option key={fe._id} value={fe._id}>
							{fe.name} ({fe.employeeId})
						</option>
					))}
				</select>

				<button
					onClick={() => fetchFEData(selectedFE)}
					disabled={!selectedFE}
					className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					Refresh
				</button>
			</div>

			<div id="map" className="w-full h-96 rounded-lg shadow-inner"></div>
		</div>
	);
};