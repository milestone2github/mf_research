// Fetch Longitude, Latitude of given Client's Address
import axios from "axios";
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getLocationCoordinates = async (address) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return [lng, lat]; // store as [Long, Lat]
    } else {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    return null;
  }
}