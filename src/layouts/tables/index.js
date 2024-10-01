import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Line } from "react-chartjs-2";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useParams } from "react-router-dom"; // Import useParams for dynamic routing
import axios from "axios";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MeasureLineChart from "./MeasureLineChart";
import MeasureDataGrid from "./MeasureDataGrid";
import Footer from "examples/Footer";

const fetchPlantData = async (plantName, startDate, endDate) => {
  try {
    const response = await axios.get("http://localhost:8080/api/plants");
    const rawData = response.data;

    const filteredData = rawData.filter((item) => {
      const date = new Date(item.key.datetime);
      return (
        date >= new Date(startDate) && date <= new Date(endDate) && item.plantName === plantName
      );
    });

    const labels = filteredData.map((item) => item.key.datetime.split("T")[1].split(".")[0]);
    const dayEnergyData = filteredData.map((item) => item.dayEnergy || 0);
    const totalStringPowerData = filteredData.map((item) => item.totalStringPower || 0);

    const rows = filteredData.map((item, index) => ({
      id: index,
      datetime: item.key.datetime,
      dayEnergy: item.dayEnergy || 0,
      totalStringPower: item.totalStringPower || 0,
    }));

    return {
      labels,
      dayEnergyData,
      totalStringPowerData,
      rows,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

function Tables() {
  const { systemName } = useParams(); // Capture system name from URL
  const [selectedTab, setSelectedTab] = useState("GSBP");
  const [startDate1, setStartDate1] = useState("2024-05-10");
  const [endDate1, setEndDate1] = useState("2024-05-20");
  const [startDate2, setStartDate2] = useState("2024-05-10");
  const [endDate2, setEndDate2] = useState("2024-05-20");
  const [chartData1, setChartData1] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [rows, setRows] = useState([]);

  // Map system names to tab values
  const plantTabMapping = {
    GSBP: "GSBP",
    "Hospital Universitario Reina Sofía": "Hospital Universitario Reina Sofía",
    "Musée Mohammed VI d'art moderne": "Musée Mohammed VI d'art moderne et contemporain",
  };
  const plantIdMapping = {
    GSBP: 1,
    "Hospital Universitario Reina Sofía": 2,
    "Musée Mohammed VI d'art moderne et contemporain": 3,
  };

  // Set the selectedTab based on the systemName from URL when the component mounts
  useEffect(() => {
    if (systemName && plantTabMapping[systemName]) {
      setSelectedTab(plantTabMapping[systemName]);
    }
  }, [systemName]);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFetchData1 = async () => {
    const data = await fetchPlantData(selectedTab, startDate1, endDate1);
    if (data) {
      setChartData1({
        labels: data.labels,
        datasets: [
          {
            label: "Day Energy (kWh)",
            data: data.dayEnergyData,
            borderColor: "#3e95cd",
            fill: false,
          },
        ],
      });
      setRows(data.rows);
    }
  };

  const handleFetchData2 = async () => {
    const data = await fetchPlantData(selectedTab, startDate2, endDate2);
    if (data) {
      setChartData2({
        labels: data.labels,
        datasets: [
          {
            label: "Total String Power (kW)",
            data: data.totalStringPowerData,
            borderColor: "#8e5ea2",
            fill: false,
          },
        ],
      });
      setRows(data.rows);
    }
  };

  useEffect(() => {
    handleFetchData1();
  }, [selectedTab, startDate1, endDate1]);

  useEffect(() => {
    handleFetchData2();
  }, [selectedTab, startDate2, endDate2]);

  const columns = [
    { field: "datetime", headerName: "Datetime", flex: 1 },
    { field: "dayEnergy", headerName: "Day Energy (kWh)", flex: 1 },
    { field: "totalStringPower", headerName: "Total String Power (kW)", flex: 1 },
  ];

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
                    <Tab
                      value="GSBP"
                      label="GSBP"
                      sx={{
                        color: selectedTab === "GSBP" ? "black" : "inherit",
                      }}
                    />
                    <Tab
                      value="Hospital Universitario Reina Sofía"
                      label="Hospital Universitario Reina Sofía"
                      sx={{
                        color:
                          selectedTab === "Hospital Universitario Reina Sofía"
                            ? "black"
                            : "inherit",
                      }}
                    />
                    <Tab
                      value="Musée Mohammed VI d'art moderne et contemporain"
                      label="Musée Mohammed VI d'art moderne et contemporain"
                      sx={{
                        color:
                          selectedTab === "Musée Mohammed VI d'art moderne et contemporain"
                            ? "black"
                            : "inherit",
                      }}
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
                  {/* <Grid item xs={2}>
                    <Button
                      variant="contained"
                      onClick={handleFetchData1}
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
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Time",
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
                  {/* <Grid item xs={2}>
                    <Button
                      variant="contained"
                      onClick={handleFetchData2}
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
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Time",
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

          {/* Data Grid */}
          {/* <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <div style={{ height: 400, width: "100%" }}>
                  <DataGrid
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                      toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                        exportButton: true,
                      },
                    }}
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    disableSelectionOnClick
                  />
                </div>
              </MDBox>
            </Card>
          </Grid> */}

          {/* Other Components */}
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              {/* Call MeasureLineChart instead of MeasureBarChart */}
              <MeasureLineChart plantId={plantIdMapping[selectedTab]} />
            </Grid>

            <Grid item xs={12} md={6}>
              <MeasureDataGrid plantId={plantIdMapping[selectedTab]} />
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
