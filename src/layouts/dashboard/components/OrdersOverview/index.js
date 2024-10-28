import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import required Chart.js components
import { fetchProductionEnergyData } from "layouts/dashboard/data/productionEnergyData"; // Import your data fetch function
import TextField from "@mui/material/TextField";

// Register the elements
ChartJS.register(ArcElement, Tooltip, Legend);

function OrdersOverview() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState(null);

  const getDateLastMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0]; // Returns date in YYYY-MM-DD format
  };

  const getDateToday = () => {
    const date = new Date();
    return date.toISOString().split("T")[0]; // Returns today's date in YYYY-MM-DD format
  };

  const handleFetchData = async (finalStartDate, finalEndDate) => {
    const data = await fetchProductionEnergyData();

    const filteredData = Object.entries(data)
      .filter(
        ([date]) =>
          new Date(date) >= new Date(finalStartDate) && new Date(date) <= new Date(finalEndDate)
      )
      .reduce((totals, [_, value]) => {
        for (const plant in value) {
          totals[plant] = (totals[plant] || 0) + value[plant];
        }
        return totals;
      }, {});

    const labels = Object.keys(filteredData);
    const dataset = {
      data: Object.values(filteredData).map((value) => value / 1000), // Convert to kW
      backgroundColor: labels.map((plantName) => getColorForPlant(plantName)),
      hoverOffset: 10,
    };

    setChartData({
      labels,
      datasets: [dataset],
    });
  };

  useEffect(() => {
    const finalStartDate = startDate || getDateLastMonth();
    const finalEndDate = endDate || getDateToday();

    handleFetchData(finalStartDate, finalEndDate);
  }, [startDate, endDate]);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate || ""}
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
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <MDBox mt={2}>
          {chartData && (
            <Pie
              data={chartData}
              options={{
                responsive: true,
                cutout: "70%",
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Total Energy Production (kw)", // Adding the title here
                    font: {
                      size: 12, // Customize font size if needed
                    },
                    padding: {
                      top: 4,
                      bottom: 10, // Adds space below the title
                    },
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
                  mode: "nearest",
                  animationDuration: 400,
                  borderWidth: 2,
                  borderColor: "rgba(0, 0, 0, 0.1)",
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
    "Musée Mohammed VI d'art moderne et contemporain": "#E4B1F0",
  };
  return colors[plantName] || "#E4B1F0";
}

export default OrdersOverview;
