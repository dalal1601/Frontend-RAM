import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCoordinates } from "../utils/geocode";
import { fetchCities } from "../utils/api";
import { useTheme } from "@mui/system"; 

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "/assets/marker.png", // icon URL
  iconSize: [32, 32], // size
  iconAnchor: [16, 32], //  anchor
  popupAnchor: [0, -32], //  popup position
});

const CityMap = () => {
  const [positions, setPositions] = useState([]);
  const { theme } = useTheme(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cities = await fetchCities();
        const coords = await Promise.all(
          cities.map(async (city) => {
            const result = await getCoordinates(city);
            return result ? { city, ...result } : null;
          })
        );
        setPositions(coords.filter((coord) => coord !== null));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Inline styles for light and dark modes
  const containerStyle = {
    width: "90%",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: `0 0 15px rgba(0, 0, 0, ${theme === "dark" ? "0.4" : "0.2"})`,
    backgroundColor: theme === "dark" ? "#333" : "#fff",
    color: theme === "dark" ? "#fff" : "#333",
    position: "relative",
  };

  const headerStyle = {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    color: theme === "dark" ? "#ff4500" : "#333",
    marginBottom: "20px",
    borderBottom: `2px solid ${theme === "dark" ? "#ff4500" : "#333"}`,
    paddingBottom: "10px",
  };

  const descriptionStyle = {
    textAlign: "center",
    fontSize: "1.2rem",
    color: theme === "dark" ? "#ddd" : "#666",
    marginBottom: "30px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Carte des villes d’escale</h1>
      <p style={descriptionStyle}>
      Visualisation des villes d’escale sur une carte.
      </p>
      <MapContainer center={[30, -10]} zoom={3} style={{ height: "80vh", width: "100%", borderRadius: "15px" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions.map((pos, idx) => (
          <Marker
            key={idx}
            position={[pos.lat, pos.lon]}
            icon={customIcon}
          >
            <Popup>{pos.city}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CityMap;
