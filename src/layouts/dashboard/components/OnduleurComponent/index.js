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
  const [selectedPlant, setSelectedPlant] = useState("Hospital Universitario Reina Sofía");

  const handleChipClick = (plant) => {
    if (selectedPlant !== plant) {
      setSelectedPlant(plant);
    }
  };

  const renderOnduleurs = () => {
    if (!selectedPlant || !onduleurImages[selectedPlant]) {
      return null;
    }

    const { images, names } = onduleurImages[selectedPlant];

    return images.map((imgSrc, index) => (
      <Grid item xs={12} sm={6} md={4} key={`${selectedPlant}-${index}`}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <img
            src={imgSrc}
            alt={`Onduleur ${names[index]}`}
            style={{ width: "100%", maxHeight: "150px", objectFit: "contain" }}
          />
          <Typography variant="body2" sx={{ mt: 1, fontSize: "12px" }}>
            {names[index]}
          </Typography>
        </Box>
      </Grid>
    ));
  };

  return (
    <MDBox mt={3}>
      <Card>
        <MDBox
          mx={2}
          mt={-3}
          py={3}
          px={2}
          borderRadius="lg"
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ backgroundColor: "#B0BEC5", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
        >
          <Typography variant="h6" color="white !important">
            Onduleurs by Plant
          </Typography>
        </MDBox>

        <MDBox p={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" flexWrap="wrap" mb={3}>
                {Object.keys(onduleurImages).map((plant) => (
                  <Chip
                    key={plant}
                    label={plant}
                    onClick={() => handleChipClick(plant)}
                    style={{
                      backgroundColor: selectedPlant === plant ? "#16325B" : "#78B7D0",
                      color: "#fff",
                      marginRight: "10px",
                      marginBottom: "10px",
                      border: selectedPlant === plant ? "2px solid #1B5E20" : "none",
                    }}
                  />
                ))}
              </Box>
            </Grid>

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
