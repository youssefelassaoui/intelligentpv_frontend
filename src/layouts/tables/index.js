import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Line } from "react-chartjs-2";
import axios from "axios";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MeasureLineChartE from "./ElectricityMeasure";
import MeasureLineChartV from "./VoltageMeasure";
import Footer from "examples/Footer";
import PowerHeatmap from "./PowerHeatmap";
import XYChartLoader from "./XYChartLoader"; // The loader component
import StatusDataGrid from "./StatusDataGrid";
import { useParams, useNavigate } from "react-router-dom"; // Add useParams and useNavigate
import zoomPlugin from "chartjs-plugin-zoom";

// Helper function to get the date for the last N days
const getLastNDays = (n) => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - n);
  return pastDate.toISOString().split("T")[0]; // YYYY-MM-DD format
};

// Function to fetch plant data based on plantName and date range
const fetchPlantData = async (plantName, startDate, endDate) => {
  try {
    const response = await axios.get("http://gspb.ddns.net:8081/api/plants");
    const rawData = response.data;

    // Filter the data based on the plantName and the date range
    const filteredData = rawData.filter((item) => {
      const date = new Date(item.key.datetime);
      const plantMatches = item.plantName === plantName; // Direct comparison of plant name
      return plantMatches && date >= new Date(startDate) && date <= new Date(endDate);
    });

    // Sort data by datetime to ensure new values are on the right
    filteredData.sort((a, b) => new Date(a.key.datetime) - new Date(b.key.datetime));

    // Extract the x-axis labels (date + time) and values
    const labels = filteredData.map((item) =>
      new Date(item.key.datetime).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })
    ); // Show only day and month (e.g., "2 Oct")

    const fullLabels = filteredData.map((item) => new Date(item.key.datetime).toLocaleString()); // Full date and time for tooltips
    const dayEnergyData = filteredData.map((item) => item.dayEnergy || 0); // Day Energy data
    const totalStringPowerData = filteredData.map((item) => item.totalStringPower || 0); // Total String Power data

    return {
      labels,
      fullLabels,
      dayEnergyData,
      totalStringPowerData,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

function Tables() {
  const { systemName } = useParams(); // Get systemName from URL
  const navigate = useNavigate(); // For programmatic navigation
  const [selectedTab, setSelectedTab] = useState(systemName || "GSBP");
  const [startDate1, setStartDate1] = useState(getLastNDays(7)); // Default to last 7 days
  const [endDate1, setEndDate1] = useState(new Date().toISOString().split("T")[0]); // Today's date
  const [startDate2, setStartDate2] = useState(getLastNDays(7)); // Default to last 7 days
  const [endDate2, setEndDate2] = useState(new Date().toISOString().split("T")[0]); // Today's date
  const [chartData1, setChartData1] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [loading1, setLoading1] = useState(true); // Loading state for chart 1
  const [loading2, setLoading2] = useState(true); // Loading state for chart 2

  // Map tab names to plant names
  const plantTabMapping = {
    GSBP: "GSBP",
    "Hospital Universitario Reina Sofía": "Hospital Universitario Reina Sofía",
    "Musée Mohammed VI d'art moderne et contemporain":
      "Musée Mohammed VI d'art moderne et contemporain",
  };

  const plantIdMapping = {
    GSBP: 49951765, // Example plantId for GSBP
    "Hospital Universitario Reina Sofía": 36076361, // Example plantId for Hospital Universitario Reina Sofía
    "Musée Mohammed VI d'art moderne et contemporain": 33783322, // Example plantId for Musée Mohammed VI
  };

  useEffect(() => {
    if (systemName) {
      setSelectedTab(systemName); // Sync the tab with the URL parameter when URL changes
    }
  }, [systemName]);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    navigate(`/tables/${newValue}`); // Update the URL when the tab changes
  };

  const handleFetchData1 = async () => {
    setLoading1(true); // Start loading for chart 1
    const data = await fetchPlantData(plantTabMapping[selectedTab], startDate1, endDate1);
    if (data) {
      // Display data exactly as received from API
      setChartData1({
        labels: data.labels, // No reverse; new data is on the right
        datasets: [
          {
            label: "Day Energy (kWh)",
            data: data.dayEnergyData, // No reverse; data displayed as is
            borderColor: "#3e95cd",
            backgroundColor: "#3e95cd",
            fill: false,
          },
        ],
        fullLabels: data.fullLabels, // No reverse; data displayed as is
      });
    }
    setLoading1(false); // Stop loading for chart 1
  };

  const handleFetchData2 = async () => {
    setLoading2(true); // Start loading for chart 2
    const data = await fetchPlantData(plantTabMapping[selectedTab], startDate2, endDate2);
    if (data) {
      setChartData2({
        labels: data.labels, // No reverse; new data is on the right
        datasets: [
          {
            label: "Total String Power (kW)",
            data: data.totalStringPowerData, // No reverse; data displayed as is
            borderColor: "#8e5ea2",
            backgroundColor: "#8e5ea2",
            fill: false,
          },
        ],
        fullLabels: data.fullLabels, // No reverse; data displayed as is
      });
    }
    setLoading2(false); // Stop loading for chart 2
  };

  // Fetch data when tab or date range changes
  useEffect(() => {
    handleFetchData1();
  }, [selectedTab, startDate1, endDate1]);

  useEffect(() => {
    handleFetchData2();
  }, [selectedTab, startDate2, endDate2]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={7} pb={7}>
        <Grid container spacing={1}>
          {/* Tab Selection */}
          <Grid item xs={12}>
            <Card>
              <MDBox pt={1} px={3}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={selectedTab}
                    onChange={handleChange}
                    aria-label="plant tabs"
                    textColor="inherit"
                    TabIndicatorProps={{ style: { backgroundColor: "#A2CA71" } }}
                    sx={{
                      marginTop: "-4px", // Slightly move the tabs up
                      minHeight: "15px", // Adjust the height of the tabs container
                    }}
                  >
                    <Tab
                      value="GSBP"
                      label="GSBP"
                      sx={{
                        minHeight: "20px", // Ensure consistent tab height
                      }}
                    />
                    <Tab
                      value="Hospital Universitario Reina Sofía"
                      label="Hospital Universitario Reina Sofía"
                      sx={{
                        minHeight: "20px", // Ensure consistent tab height
                      }}
                    />
                    <Tab
                      value="Musée Mohammed VI d'art moderne et contemporain"
                      label="Musée Mohammed VI d'art moderne et contemporain"
                      sx={{
                        minHeight: "20px", // Ensure consistent tab height
                      }}
                    />
                  </Tabs>
                </Box>
              </MDBox>
            </Card>
          </Grid>

          {/* Day Energy Chart with Filters */}
          <Grid item xs={12} md={6}>
            <Card sx={{ width: "98%", marginLeft: "13px" }}>
              <MDBox p={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate1}
                      onChange={(e) => setStartDate1(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate1}
                      onChange={(e) => setEndDate1(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <MDBox mt={2}>
                  {loading1 ? (
                    <XYChartLoader sx={{ height: "150px !important" }} />
                  ) : chartData1 ? (
                    <Line
                      data={chartData1}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: `Day Energy (${selectedTab})`,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (tooltipItem) {
                                const date = chartData1.fullLabels[tooltipItem.dataIndex];
                                return `${date}: ${tooltipItem.raw} kWh`;
                              },
                            },
                          },
                          zoom: {
                            zoom: {
                              wheel: {
                                enabled: true, // Activate zoom with the mouse wheel
                              },
                              pinch: {
                                enabled: true, // Activate zoom by pinching
                              },
                              mode: "x", // Zoom in the x-axis direction
                            },
                            pan: {
                              enabled: true,
                              mode: "x",
                            },
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Date",
                            },
                            ticks: {
                              callback: function (val, index) {
                                return chartData1.labels[index]; // Display day and month on x-axis
                              },
                            },
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Day Energy (kWh)",
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p>No data available</p>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Total String Power Chart with Filters */}
          <Grid item xs={12} md={6}>
            <Card sx={{ width: "98%", marginLeft: "3px" }}>
              <MDBox p={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate2}
                      onChange={(e) => setStartDate2(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate2}
                      onChange={(e) => setEndDate2(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <MDBox mt={2}>
                  {loading2 ? (
                    <XYChartLoader />
                  ) : chartData2 ? (
                    <Line
                      data={chartData2}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: `Total String Power (${selectedTab})`,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (tooltipItem) {
                                const date = chartData2.fullLabels[tooltipItem.dataIndex];
                                return `${date}: ${tooltipItem.raw} kW`;
                              },
                            },
                          },
                          zoom: {
                            zoom: {
                              wheel: {
                                enabled: true, // Activate zoom with the mouse wheel
                              },
                              pinch: {
                                enabled: true, // Activate zoom by pinching
                              },
                              mode: "x", // Zoom in the x-axis direction
                            },
                            pan: {
                              enabled: true,
                              mode: "x",
                            },
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Date",
                            },
                            ticks: {
                              callback: function (val, index) {
                                return chartData2.labels[index]; // Display day and month on x-axis
                              },
                            },
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Total String Power (kW)",
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p>No data available</p>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Other Components */}
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} md={6}>
              <MeasureLineChartE plantId={plantIdMapping[selectedTab]} />
            </Grid>

            <Grid item xs={12} md={6}>
              <MeasureLineChartV plantId={plantIdMapping[selectedTab]} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <PowerHeatmap plantId={plantIdMapping[selectedTab]} />
            </Grid>
            <Grid item xs={12} md={5}>
              <StatusDataGrid plantId={plantIdMapping[selectedTab]} />
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
