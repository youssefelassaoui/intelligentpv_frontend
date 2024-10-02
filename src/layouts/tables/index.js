import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Cookies from "js-cookie"; // To get the token
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MeasureLineChart from "./MeasureLineChart";
import MeasureDataGrid from "./MeasureDataGrid";
import Footer from "examples/Footer";

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
    // Retrieve the token from cookies (or localStorage)
    const token = Cookies.get("authToken");
    if (!token) {
      throw new Error("Authentication token is missing");
    }

    const response = await axios.get("http://localhost:8080/api/plants", {
      headers: {
        Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
      },
    });

    const rawData = response.data;

    // Filter the data based on the plantName and the date range
    const filteredData = rawData.filter((item) => {
      const date = new Date(item.key.datetime);
      const plantMatches = item.plantName.substring(0, 3) === plantName.substring(0, 3); // Compare first 3 characters of plant name
      return plantMatches && date >= new Date(startDate) && date <= new Date(endDate);
    });

    // Extract labels in the format "Nov 23", "Nov 24", etc., and dayEnergy, totalStringPower
    const labels = filteredData.map((item) =>
      new Date(item.key.datetime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ); // x-axis: "Nov 23", "Nov 24"
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
  const [selectedTab, setSelectedTab] = useState("GSBP");
  const [startDate1, setStartDate1] = useState(getLastNDays(7)); // Default to last 7 days
  const [endDate1, setEndDate1] = useState(new Date().toISOString().split("T")[0]); // Today's date
  const [startDate2, setStartDate2] = useState(getLastNDays(7)); // Default to last 7 days
  const [endDate2, setEndDate2] = useState(new Date().toISOString().split("T")[0]); // Today's date
  const [chartData1, setChartData1] = useState(null);
  const [chartData2, setChartData2] = useState(null);

  // Map tab names to plant names
  const plantTabMapping = {
    GSBP: "GSBP",
    "Hospital Universitario Reina Sofía": "Hospital Universitario Reina Sofía",
    "Musée Mohammed VI d'art moderne et contemporain":
      "Musée Mohammed VI d'art moderne et contemporain",
  };

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFetchData1 = async () => {
    const data = await fetchPlantData(plantTabMapping[selectedTab], startDate1, endDate1);
    if (data) {
      setChartData1({
        labels: data.labels,
        datasets: [
          {
            label: "Day Energy (kWh)",
            data: data.dayEnergyData,
            borderColor: "#3e95cd",
            backgroundColor: "#3e95cd",
            fill: false,
          },
        ],
        fullLabels: data.fullLabels, // For tooltips
      });
    }
  };

  const handleFetchData2 = async () => {
    const data = await fetchPlantData(plantTabMapping[selectedTab], startDate2, endDate2);
    if (data) {
      setChartData2({
        labels: data.labels,
        datasets: [
          {
            label: "Total String Power (kW)",
            data: data.totalStringPowerData,
            borderColor: "#8e5ea2",
            backgroundColor: "#8e5ea2",
            fill: false,
          },
        ],
        fullLabels: data.fullLabels, // For tooltips
      });
    }
  };

  // Fetch data when tab or date range changes
  useEffect(() => {
    if (selectedTab && startDate1 && endDate1) {
      handleFetchData1();
    }
  }, [selectedTab, startDate1, endDate1]);

  useEffect(() => {
    if (selectedTab && startDate2 && endDate2) {
      handleFetchData2();
    }
  }, [selectedTab, startDate2, endDate2]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={7} pb={7}>
        <Grid container spacing={3}>
          {/* Tab Selection */}
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={selectedTab}
                    onChange={handleChange}
                    aria-label="plant tabs"
                    textColor="inherit"
                    TabIndicatorProps={{ style: { backgroundColor: "#A2CA71" } }}
                  >
                    <Tab value="GSBP" label="GSBP" />
                    <Tab
                      value="Hospital Universitario Reina Sofía"
                      label="Hospital Universitario Reina Sofía"
                    />
                    <Tab
                      value="Musée Mohammed VI d'art moderne et contemporain"
                      label="Musée Mohammed VI d'art moderne et contemporain"
                    />
                  </Tabs>
                </Box>
              </MDBox>
            </Card>
          </Grid>

          {/* Day Energy Chart with Filters */}
          <Grid item xs={12} md={6}>
            <Card>
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
                  {chartData1 && (
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
                                // Display full datetime on hover using fullLabels
                                return `${chartData1.fullLabels[tooltipItem.dataIndex]}: ${
                                  tooltipItem.raw
                                } kWh`;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Date",
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
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Total String Power Chart with Filters */}
          <Grid item xs={12} md={6}>
            <Card>
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
                  {chartData2 && (
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
                                // Display full datetime on hover using fullLabels
                                return `${chartData2.fullLabels[tooltipItem.dataIndex]}: ${
                                  tooltipItem.raw
                                } kW`;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Date",
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
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Other Components */}
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <MeasureLineChart plantId={selectedTab} />
            </Grid>

            <Grid item xs={12} md={6}>
              <MeasureDataGrid plantId={selectedTab} />
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
