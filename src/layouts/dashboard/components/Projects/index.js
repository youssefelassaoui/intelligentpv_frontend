import React, { useState } from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from "react-leaflet";
import L from "leaflet";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import IconButton from "@mui/material/IconButton";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

const { BaseLayer } = LayersControl;

// Function to create the custom Google Maps-like marker icon for the current location
const createCustomIcon = () => {
  const html = `
    <div style="
      position: relative;
      width: 20px;
      height: 20px;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        background-color: #4285F4;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 24px;
        height: 24px;
        background-color: rgba(66, 133, 244, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `;
  return L.divIcon({
    html,
    iconSize: [24, 24],
    className: "custom-icon",
  });
};

// Function to create a custom icon for the chips locations using the centralemarker.png image
const centralMarkerIcon = new L.Icon({
  iconUrl: "/centralemarker.png",
  iconSize: [40, 40], // Adjust the size as needed
  iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -40], // Point from which the popup should open relative to the iconAnchor
});

// Custom component to handle getting the user's location and centering the map
function LocateButton({ setLocation }) {
  const map = useMap();

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 13); // Use flyTo for smooth animation
          setLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <IconButton
      onClick={handleLocate}
      sx={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        backgroundColor: "white !important",
        color: "white", // Make the icon color white
        borderRadius: "50%", // Make the background round
        width: "40px", // Ensure it's a perfect circle
        height: "40px", // Ensure it's a perfect circle
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)", // Add some subtle shadow
        "&:hover": {
          backgroundColor: "lightgray",
        },
      }}
    >
      <MyLocationIcon sx={{ color: "black" }} /> {/* Set icon color to black */}
    </IconButton>
  );
}

// Define PropTypes for LocateButton
LocateButton.propTypes = {
  setLocation: PropTypes.func.isRequired,
};

// Array containing the locations for the chips and markers
const locations = [
  { name: "GSBP", coords: [32.21871170284963, -7.932738392356194] },
  { name: "Hospital Universitario Reina Sofia", coords: [37.86801376135351, -4.797821061278386] },
  {
    name: "Musée Mohammed VI d'art moderne et contemporain",
    coords: [34.015280626543785, -6.8325097270472055],
  },
];

// Custom component for the chips to fly to specific locations
function LocationChips() {
  const map = useMap();

  const handleFlyTo = (coords) => {
    map.flyTo(coords, 18);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        position: "absolute",
        top: 10,
        left: 150, // Adjusted position to the right
        zIndex: 1000,
      }}
    >
      {locations.map((location) => (
        <Chip
          key={location.name}
          label={location.name}
          onClick={() => handleFlyTo(location.coords)}
          sx={{
            cursor: "pointer",
            color: "black",
            backgroundColor: "white !important", // Solid white background by default
            border: "1px solid white", // Border to match the background
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)", // Add shadow to the chips
            "&:hover": {
              backgroundColor: "lightgray", // Subtle hover effect
            },
          }}
        />
      ))}
    </Stack>
  );
}

function Projects() {
  const [location, setLocation] = useState(null);

  return (
    <Card>
      <MDBox
        height="400px"
        sx={({ borders: { borderRadius } }) => ({
          borderRadius: borderRadius.lg,
          overflow: "hidden",
          position: "relative",
        })}
      >
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <LayersControl position="bottomleft">
            <BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>
            <BaseLayer name="Satellite">
              <TileLayer
                url="https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=QCJjsLjC3wi0UX43hcRA"
                attribution='&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors'
              />
            </BaseLayer>
          </LayersControl>
          {location && (
            <Marker position={location} icon={createCustomIcon()}>
              <Popup>Your current location</Popup>
            </Marker>
          )}
          <LocationChips /> {/* Chips to fly to specific locations */}
          <LocateButton setLocation={setLocation} /> {/* Button to get current location */}
          {locations.map((location) => (
            <Marker key={location.name} position={location.coords} icon={centralMarkerIcon}>
              <Popup>{location.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </MDBox>
    </Card>
  );
}

export default Projects;
