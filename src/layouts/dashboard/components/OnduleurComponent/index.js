import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MDBox from "components/MDBox"; // Assuming you are using MDBox for styling

// Onduleur image paths and names
const onduleurImages = {
  GSBP: {
    images: ["/SUN2000L-5KTL-removebg-preview.png"],
    names: ["SUN2000L-5KTL"],
  },
  "Hospital Universitario Reina Sofía": {
    images: [
      "/SUN2000-20KTL-M0-removebg-preview.png",
      "/SUN2000-60KTL-M0-removebg-preview.png",
      "/SUN2000-100KTL-M1-removebg-preview.png",
    ],
    names: ["SUN2000-20KTL-M0", "SUN2000-60KTL-M0", "SUN2000-100KTL-M1"],
  },
  "Musée Mohammed VI d'art moderne ": {
    images: ["/SUN2000-60KTL-M0-removebg-preview.png"],
    names: ["SUN2000-60KTL-M0"],
  },
};

function OnduleurComponent() {
  // State to keep track of selected plant
  const [selectedPlant, setSelectedPlant] = useState("Hospital Universitario Reina Sofía"); // Default selection is the second plant

  // Chip click handler (toggle selection)
  const handleChipClick = (plant) => {
    if (selectedPlant !== plant) {
      setSelectedPlant(plant); // Only update if a different plant is clicked
    }
  };

  // Rendering multiple onduleur images for selected plant
  // Rendering multiple onduleur images for selected plant
  const renderOnduleurs = () => {
    if (!selectedPlant || !onduleurImages[selectedPlant]) {
      return null; // If no plant is selected or it's invalid, render nothing
    }

    const { images, names } = onduleurImages[selectedPlant];

    return images.map((imgSrc, index) => (
      <Box key={`${selectedPlant}-${index}`} sx={{ textAlign: "center", mb: 3 }}>
        <img
          src={imgSrc}
          alt={`Onduleur ${names[index]}`}
          style={{ width: "100%", maxHeight: "150px", objectFit: "contain" }}
        />
        {/* Onduleur Name */}
        <Typography variant="body2" sx={{ mt: 1, fontSize: "12px" }}>
          {names[index]}
        </Typography>
      </Box>
    ));
  };

  return (
    <MDBox mt={3}>
      <Card>
        {/* Title with gradient background like in the table example */}
        <MDBox
          mx={2}
          mt={-3}
          py={3}
          px={2}
          borderRadius="lg"
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ backgroundColor: "#B0BEC5", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }} // Using a gray color and shadow
        >
          <Typography variant="h6" color="white !important">
            Onduleurs by Plant
          </Typography>
        </MDBox>

        <MDBox p={3}>
          <Grid container spacing={2}>
            {/* Chip Selection */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mb={3}>
                <Chip
                  label="GSBP"
                  onClick={() => handleChipClick("GSBP")}
                  style={{
                    backgroundColor: selectedPlant === "GSBP" ? "#16325B" : "#78B7D0",
                    color: "#fff",
                    marginRight: "10px",
                    border: selectedPlant === "GSBP" ? "2px solid #1B5E20" : "none",
                  }}
                />
                <Chip
                  label="Hospital Universitario Reina Sofía"
                  onClick={() => handleChipClick("Hospital Universitario Reina Sofía")}
                  style={{
                    backgroundColor:
                      selectedPlant === "Hospital Universitario Reina Sofía"
                        ? "#16325B"
                        : "#78B7D0",
                    color: "#fff",
                    marginRight: "10px",
                    border:
                      selectedPlant === "Hospital Universitario Reina Sofía"
                        ? "2px solid #1B5E20"
                        : "none",
                  }}
                />
                <Chip
                  label="Musée Mohammed VI d'art moderne "
                  onClick={() => handleChipClick("Musée Mohammed VI d'art moderne ")}
                  style={{
                    backgroundColor:
                      selectedPlant === "Musée Mohammed VI d'art moderne " ? "#16325B" : "#78B7D0",
                    color: "#fff",
                    border:
                      selectedPlant === "Musée Mohammed VI d'art moderne "
                        ? "2px solid #1B5E20"
                        : "none",
                  }}
                />
              </Box>
            </Grid>

            {/* Onduleur Images with Names */}
            <Grid item xs={12}>
              <Grid container spacing={3} justifyContent="center">
                {renderOnduleurs()}
              </Grid>
            </Grid>
          </Grid>
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default OnduleurComponent;
