import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import { Card, Grid, Typography, Chip } from "@mui/material";
import { Sparklines, SparklinesLine } from "react-sparklines"; // For sparklines
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Individual Plant Stock-like Card Component
const PlantStockLikeCard = ({ plant, capacity, change, sparklineData }) => {
  const isPositive = change >= 0;
  const lineColor = isPositive ? "#4CAF50" : "#F44336"; // Dynamic line color

  return (
    <MDBox
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      mb={1.5}
      p={1.5}
      sx={{
        borderBottom: "1px solid #ccc",
        backgroundColor: "white", // Background color matching other cards
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
        minWidth: "100%", // Full width for stacking
      }}
    >
      {/* Plant Name and Arrow */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "14px" }}>
          {plant}
        </Typography>
        {/* Arrow for comparison */}
        {isPositive ? (
          <ArrowUpwardIcon style={{ color: "#4CAF50", fontSize: "16px" }} />
        ) : (
          <ArrowDownwardIcon style={{ color: "#F44336", fontSize: "16px" }} />
        )}
      </MDBox>

      {/* Sparkline Chart and Capacity + Change */}
      <MDBox display="flex" alignItems="center">
        {/* Chart */}
        <Sparklines data={sparklineData} width={80} height={20}>
          <SparklinesLine
            color={lineColor} // Use dynamic line color here
            style={{
              fill: "none",
              strokeWidth: "1",
              filter: "brightness(1.2)", // Brighten the curve
            }}
          />
        </Sparklines>

        {/* Capacity and Percentage Change */}
        <MDBox ml={2} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="caption" color="textPrimary" mb={1}>
            {capacity} kW
          </Typography>
          {/* Percentage Change with Chip */}
          <Chip
            icon={
              isPositive ? (
                <ArrowUpwardIcon style={{ color: "white" }} />
              ) : (
                <ArrowDownwardIcon style={{ color: "white" }} />
              )
            }
            label={`${isPositive ? "+" : ""}${change}%`}
            sx={{
              backgroundColor: lineColor, // Use dynamic line color for chip background
              color: "white",
              fontSize: "10px",
              height: "20px", // Smaller chip height
            }}
          />
        </MDBox>
      </MDBox>
    </MDBox>
  );
};

PlantStockLikeCard.propTypes = {
  plant: PropTypes.string.isRequired,
  capacity: PropTypes.number.isRequired,
  change: PropTypes.number.isRequired,
  sparklineData: PropTypes.arrayOf(PropTypes.number).isRequired,
};

// Main Component to render the Plant Stock Cards
const PlantStockCards = () => {
  const [plantData, setPlantData] = useState(null);

  // Fetch plant energy data (Mocked for now)
  const fetchPlantEnergyData = async () => {
    const mockData = {
      "Hospital Universitario Reina Sofía": {
        capacity: 228.37,
        change: 0.17,
        sparkline: [50, 55, 60, 65, 70, 75, 80],
      },
      GSBP: {
        capacity: 153.85,
        change: 0.56,
        sparkline: [40, 45, 50, 55, 60, 65, 70],
      },
      "Musée Mohammed VI d'art moderne": {
        capacity: 92.89,
        change: -0.86,
        sparkline: [60, 65, 55, 50, 45, 40, 35],
      },
    };
    setPlantData(mockData);
  };

  useEffect(() => {
    fetchPlantEnergyData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={2}>
        {plantData && (
          <Grid container spacing={1} direction="column">
            <Grid item>
              <PlantStockLikeCard
                plant="Hospital Universitario Reina Sofía"
                capacity={plantData["Hospital Universitario Reina Sofía"].capacity}
                change={plantData["Hospital Universitario Reina Sofía"].change}
                sparklineData={plantData["Hospital Universitario Reina Sofía"].sparkline}
              />
            </Grid>
            <Grid item>
              <PlantStockLikeCard
                plant="GSBP"
                capacity={plantData.GSBP.capacity}
                change={plantData.GSBP.change}
                sparklineData={plantData.GSBP.sparkline}
              />
            </Grid>
            <Grid item>
              <PlantStockLikeCard
                plant="Musée Mohammed VI d'art moderne"
                capacity={plantData["Musée Mohammed VI d'art moderne"].capacity}
                change={plantData["Musée Mohammed VI d'art moderne"].change}
                sparklineData={plantData["Musée Mohammed VI d'art moderne"].sparkline}
              />
            </Grid>
          </Grid>
        )}
      </MDBox>
    </Card>
  );
};

export default PlantStockCards;
