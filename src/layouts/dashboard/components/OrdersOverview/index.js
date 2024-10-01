import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import required Chart.js components
import { fetchProductionEnergyData } from "layouts/dashboard/data/productionEnergyData"; // Import your data fetch function
import TextField from "@mui/material/TextField"; // Import TextField
import Button from "@mui/material/Button"; // Import Button

// Register the elements
ChartJS.register(ArcElement, Tooltip, Legend);

function OrdersOverview() {
  const [startDate, setStartDate] = useState("2024-05-10");
  const [endDate, setEndDate] = useState("2024-05-20");
  const [chartData, setChartData] = useState(null);

  const handleFetchData = async () => {
    const data = await fetchProductionEnergyData();
    const filteredData = Object.entries(data)
      .filter(
        ([date]) => new Date(date) >= new Date(startDate) && new Date(date) <= new Date(endDate)
      )
      .reduce((totals, [key, value]) => {
        for (const plant in value) {
          totals[plant] = (totals[plant] || 0) + value[plant];
        }
        return totals;
      }, {});

    const labels = Object.keys(filteredData);
    const dataset = {
      data: Object.values(filteredData).map((value) => value / 1000), // Convert to kW
      backgroundColor: labels.map((plantName) => getColorForPlant(plantName)),
      hoverOffset: 10, // Increases the size of the segment when hovered
    };

    setChartData({
      labels,
      datasets: [dataset],
    });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
          {/* <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              onClick={handleFetchData}
              fullWidth
              sx={{
                backgroundColor: "green",
                color: "white !important",
                "&:hover": {
                  backgroundColor: "darkgreen",
                },
              }}
            >
              Update
            </Button>
          </Grid> */}
        </Grid>
        <MDBox mt={2}>
          {chartData && (
            <Pie
              data={chartData}
              options={{
                responsive: true,
                cutout: "70%", // Creates a donut chart with an empty center
                plugins: {
                  legend: {
                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)} kW`;
                      },
                    },
                  },
                },
                hover: {
                  mode: "nearest", // Apply hover to the nearest segment
                  animationDuration: 400, // Smooth animation when hovering
                  borderWidth: 2, // Border width on hover
                  borderColor: "rgba(0, 0, 0, 0.1)", // Slight shadow on hover
                },
              }}
            />
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

function getColorForPlant(plantName) {
  const colors = {
    "Hospital Universitario Reina Sofía": "#7695FF",
    GSBP: "#41B3A2",
    "Musée Mohammed VI d'art moderne et contemporain": "#D7C3F1",
  };
  return colors[plantName] || "#34A853";
}

export default OrdersOverview;
