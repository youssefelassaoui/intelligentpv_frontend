import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import { Card, Grid, Typography, Chip } from "@mui/material";
import { Sparklines, SparklinesLine } from "react-sparklines";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import axios from "axios"; // For API calls

// Plant ID mapping
const plantIdMapping = {
  GSBP: 49951765, // Plant ID for GSBP
  "Hospital Universitario Reina Sofía": 36076361, // Plant ID for Hospital Universitario Reina Sofía
  "Musée Mohammed VI d'art moderne et contemporain": 33783322, // Plant ID for Musée Mohammed VI
};

// Individual Plant Stock-like Card Component
const PlantStockLikeCard = ({ plant, capacity, change, sparklineData }) => {
  const isPositive = change >= 0;
  const lineColor = isPositive ? "#4CAF50" : "#F44336";

  return (
    <MDBox
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      mb={1.5}
      p={1.5}
      sx={{
        borderBottom: "1px solid #ccc",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        minWidth: "100%",
      }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "14px" }}>
          {plant}
        </Typography>
        {isPositive ? (
          <ArrowUpwardIcon style={{ color: "#4CAF50", fontSize: "16px" }} />
        ) : (
          <ArrowDownwardIcon style={{ color: "#F44336", fontSize: "16px" }} />
        )}
      </MDBox>

      <MDBox display="flex" alignItems="center">
        <Sparklines data={Array.isArray(sparklineData) ? sparklineData : []} width={80} height={20}>
          <SparklinesLine
            color={lineColor} // Use dynamic line color here
            style={{
              fill: "none",
              strokeWidth: "1",
              filter: "brightness(1.2)", // Brighten the curve
            }}
          />
        </Sparklines>

        <MDBox ml={2} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="caption" color="textPrimary" mb={1}>
            {capacity.toFixed(2)} kW
          </Typography>
          <Chip
            icon={
              isPositive ? (
                <ArrowUpwardIcon style={{ color: "white" }} />
              ) : (
                <ArrowDownwardIcon style={{ color: "white" }} />
              )
            }
            label={`${isPositive ? "+" : ""}${change.toFixed(2)}%`}
            sx={{
              backgroundColor: lineColor,
              color: "white",
              fontSize: "10px",
              height: "20px",
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

  // Function to fetch energy data for a single plant
  const fetchEnergyDataForPlant = async (plant, plantId) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/plants/energyData/${plantId}`);
      const { currentWeekEnergy, previousWeekEnergy, currentWeekDailyData } = response.data;

      return {
        capacity: currentWeekEnergy,
        change: ((currentWeekEnergy - previousWeekEnergy) / previousWeekEnergy) * 100,
        sparkline: Object.values(currentWeekDailyData),
      };
    } catch (error) {
      console.error(`Error fetching data for plant ${plant}:`, error);
      return null;
    }
  };

  // Fetch all plant energy data
  const fetchAllPlantEnergyData = async () => {
    const data = {};
    for (const plant in plantIdMapping) {
      const plantId = plantIdMapping[plant];
      const plantEnergyData = await fetchEnergyDataForPlant(plant, plantId);
      if (plantEnergyData) {
        data[plant] = plantEnergyData;
      }
    }
    setPlantData(data);
  };

  useEffect(() => {
    fetchAllPlantEnergyData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={2}>
        {plantData && (
          <Grid container spacing={1} direction="column">
            {Object.keys(plantData).map((plantKey) => (
              <Grid item key={plantKey}>
                <PlantStockLikeCard
                  plant={plantKey}
                  capacity={plantData[plantKey].capacity}
                  change={plantData[plantKey].change}
                  sparklineData={plantData[plantKey].sparkline}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>
    </Card>
  );
};

export default PlantStockCards;
