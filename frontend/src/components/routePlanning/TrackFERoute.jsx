import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { BASE_LOCATION_COORDINATES } from "../../utils/stringConstants";
import { IoBatteryHalf, IoBatteryFull  } from "react-icons/io5";
import { PiBatteryLowFill } from "react-icons/pi";
import { TbBatteryOff } from "react-icons/tb";
import { formatDateWithTime } from "../../utils/formatDate";

export const TrackFERoute = () => {
	const baseUrl = process.env.REACT_APP_API_BASE_URL;
	const googleApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
	const googleMapId = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID;
	const navigate = useNavigate();

	const [fes, setFEs] = useState([]);
	const [selectedFE, setSelectedFE] = useState("");
	const [feData, setFEData] = useState(null);
	const [map, setMap] = useState(null);
	// const [markers, setMarkers] = useState([]);

	const markersRef = useRef([]);

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

		// Clear previous markers before loading new data
		markersRef.current.forEach((m) => m.setMap(null));
		markersRef.current = [];
		setFEData(null);

		try {
			const res = await axios.get(`${baseUrl}/api/route-plan/fe/${feId}/track`);
			setFEData(res.data);
		} catch (err) {
			console.error(err);
			markersRef.current.forEach((m) => m.setMap(null));
			markersRef.current = [];

			const fe = fes.find((f) => f._id === feId);
			const feName = fe ? fe.name : feId;
			toast.warning(
				`No clients assigned to FE: ${feName}` || err.response?.data?.message
			);
			setFEData(null);
		}
	};

	// Load Google Maps script dynamically (with geometry library)
	useEffect(() => {
		const initMap = () => {
			const mapObj = new window.google.maps.Map(
				document.getElementById("map"),
				{
					center: BASE_LOCATION_COORDINATES,
					zoom: 12,
					mapId: googleMapId,
				}
			);
			setMap(mapObj);
		};

		if (!window.google) {
			const script = document.createElement("script");
			script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=geometry`;
			script.async = true;
			script.onload = initMap;
			document.body.appendChild(script);
		} else {
			initMap();
		}
	}, [googleApiKey, googleMapId]);

	// const markersRef = useRef([]);

	// Function to get distance using Google Maps geometry library
	const getDistanceInMeters = (lat1, lng1, lat2, lng2) => {
		if (!window.google || !window.google.maps || !window.google.maps.geometry) {
			console.warn("Google Maps geometry library not loaded.");
			return 999999;
		}
		const point1 = new window.google.maps.LatLng(lat1, lng1);
		const point2 = new window.google.maps.LatLng(lat2, lng2);
		return window.google.maps.geometry.spherical.computeDistanceBetween(
			point1,
			point2
		);
	};

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

			let feColor = "bg-blue-600";	// default color

			// Check distance to client (change to yellow if within 200m)
			if (feData.clientLocation) {
				const [clientLng, clientLat] = feData.clientLocation.coordinates;
				const distance = getDistanceInMeters(lat, lng, clientLat, clientLng);
				if (distance <= 200) {
					feColor = "bg-yellow-500";
				}
			}

			const feContent = document.createElement("div");
			feContent.className = `${feColor} text-white font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center shadow-lg ring-2 ring-opacity-50`;
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
		// setMarkers(newMarkers);
		markersRef.current = newMarkers;
	}, [feData, map]);

	const BatteryIndicator = (percentage) => {
		if (percentage == null) {
			return (
				<div className="flex flex-col items-center leading-tight">
					<span className="text-[9px] text-gray-600">Battery</span>
				</div>
			);
		}
		if (percentage <= 20)
			return (
				<div className="flex flex-col items-center leading-tight">
					<PiBatteryLowFill    size={32} className="text-red-600" />
				</div>
			);
		if (percentage <= 60)
			return (
				<div className="flex flex-col items-center leading-tight">
					<IoBatteryHalf size={32} className="text-yellow-500" />
				</div>
			);

		return (
			<div className="flex flex-col items-center leading-tight">
				<IoBatteryFull size={32} className="text-green-600" />
			</div>
		);
	};

	return (
		<div className="max-w-3xl mx-auto mt-2 p-6 bg-white shadow-lg rounded-xl">
			{/* ---------------- Header Row: Back + Title + Last Updated ---------------- */}			{/* ---------------- Header Row: Back + Title + Last Updated ---------------- */}
			<div className="grid grid-cols-3 items-center mb-3 h-12">
				<div className="flex items-center  h-full">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
					>
						← Back
					</button>
				</div>
				<h1 className="text-xl font-semibold text-center m-0  flex items-center justify-center h-full">
					Track FE Route
				</h1>

				{/* Last Updated */}
				<div className="text-right text-xs text-gray-600  flex items-center justify-end h-full px-1">
					{feData?.latestBattery?.timestamps ? (
						<>
							<span className="font-medium">Last updated:&nbsp;</span>
							<span className="italic">
								{formatDateWithTime(feData.latestBattery.timestamps)}
							</span>
						</>
					) : (
						<span className="text-gray-500 font-medium">Last Updated: N/A</span>
					)}
				</div>
			</div>

			{/* ---------------- FE Select + Battery + Refresh ---------------- */}
			<div className="flex items-center gap-4 mb-4">
				{/* Select FE */}
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

				{/* Battery Indicator (MIDDLE) */}
				<div className="flex items-center gap-1 min-w-[80px] h-[38px] border border-gray-400 px-2 rounded-lg">

					{/* Battery Icon + Label */}
					<div className="flex flex-col items-center justify-center leading-tight">
						{BatteryIndicator(feData?.latestBattery?.batteryPercentage)}
					</div>

					{/* Percentage OR N/A */}
					<span
						className={`text-xl font-medium ${feData?.latestBattery?.batteryPercentage == null
								? "text-gray-500"
								: feData.latestBattery.batteryPercentage <= 20
									? "text-red-600"
									: feData.latestBattery.batteryPercentage <= 60
										? "text-yellow-500"
										: "text-green-600"
							}`}
					>
						{feData?.latestBattery?.batteryPercentage == null
							? <TbBatteryOff size={32} className="text-gray-600" />
							: `${feData.latestBattery.batteryPercentage}%`}
					</span>

				</div>

				<button
					onClick={() => fetchFEData(selectedFE)}
					disabled={!selectedFE}
					className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					Refresh
				</button>
			</div>

			{/* Map */}
			<div id="map" className="w-full h-96 rounded-lg shadow-inner"></div>
		</div>
	);
};