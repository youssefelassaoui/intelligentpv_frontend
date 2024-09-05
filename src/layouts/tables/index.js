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
import axios from "axios";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MeasureBarChart from "./MeasureBarChart"; // Import MeasureBarChart
import MeasureDataGrid from "./MeasureDataGrid"; // Import MeasureDataGrid

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
      chartData: {
        labels,
        datasets: [
          {
            label: "Day Energy (kWh)",
            data: dayEnergyData,
            borderColor: "#3e95cd",
            fill: false,
          },
          {
            label: "Total String Power (kW)",
            data: totalStringPowerData,
            borderColor: "#8e5ea2",
            fill: false,
          },
        ],
      },
      rows,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

function Tables() {
  const [selectedTab, setSelectedTab] = useState("GSBP");
  const [startDate, setStartDate] = useState("2024-05-10");
  const [endDate, setEndDate] = useState("2024-05-20");
  const [chartData, setChartData] = useState(null);
  const [rows, setRows] = useState([]);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFetchData = async () => {
    const data = await fetchPlantData(selectedTab, startDate, endDate);
    if (data) {
      setChartData(data.chartData);
      setRows(data.rows);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [selectedTab, startDate, endDate]);

  const columns = [
    { field: "datetime", headerName: "Datetime", flex: 1 },
    { field: "dayEnergy", headerName: "Day Energy (kWh)", flex: 1 },
    { field: "totalStringPower", headerName: "Total String Power (kW)", flex: 1 },
  ];

  // Map tab values to plantIds
  const plantTabMapping = {
    GSBP: 1,
    "Hospital Universitario Reina Sofía": 2,
    "Musée Mohammed VI d'art moderne et contemporain": 3,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={7} pb={3}>
        <Grid container spacing={3}>
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

          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
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
                  </Grid>
                </Grid>
                <MDBox mt={2}>
                  {chartData && (
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: `Day Energy and Total String Power (${selectedTab})`,
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
                              text: "Values",
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

          <Grid item xs={12} md={6}>
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
          </Grid>
        </Grid>
        <MDBox mt={1}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} md={6}>
              <MeasureBarChart plantId={plantTabMapping[selectedTab]} /> {/* Pass plantId */}
            </Grid>
            <Grid item xs={12} md={6}>
              <MeasureDataGrid
                plantId={plantTabMapping[selectedTab]}
                startDate={startDate}
                endDate={endDate}
              />{" "}
              {/* Pass plantId, startDate, and endDate */}
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
