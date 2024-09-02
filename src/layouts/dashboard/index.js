import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Bar } from "react-chartjs-2";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { fetchProductionEnergyData } from "layouts/dashboard/data/productionEnergyData";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import Projects from "layouts/dashboard/components/Projects";

function Dashboard() {
  const [startDate, setStartDate] = useState("2024-05-10");
  const [endDate, setEndDate] = useState("2024-05-20");
  const [chartData, setChartData] = useState(null);

  const handleFetchData = async () => {
    const data = await fetchProductionEnergyData();

    const filteredData = Object.entries(data)
      .filter(
        ([date]) => new Date(date) >= new Date(startDate) && new Date(date) <= new Date(endDate)
      )
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    const labels = Object.keys(filteredData);
    const datasets = [
      {
        label: "Hospital Universitario Reina Sofía",
        data: labels.map(
          (date) => (filteredData[date]["Hospital Universitario Reina Sofía"] || 0) / 1000
        ), // Convert to kW
        backgroundColor: "#7695FF",
      },
      {
        label: "GSBP",
        data: labels.map((date) => (filteredData[date]["GSBP"] || 0) / 1000), // Convert to kW
        backgroundColor: "#41B3A2",
      },
      {
        label: "Musée Mohammed VI d'art moderne et contemporain",
        data: labels.map(
          (date) =>
            (filteredData[date]["Musée Mohammed VI d'art moderne et contemporain"] || 0) / 1000
        ), // Convert to kW
        backgroundColor: "#D7C3F1",
      },
    ];

    const combinedData = labels.map((_, index) => {
      return datasets.map((dataset) => dataset.data[index]);
    });

    const stackedDatasets = datasets.map((dataset, datasetIndex) => ({
      ...dataset,
      data: combinedData.map((data) => data[datasetIndex]),
    }));

    setChartData({
      labels,
      datasets: stackedDatasets,
    });
  };

  useEffect(() => {
    handleFetchData();
  }, [startDate, endDate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={1.5}>
        <MDBox mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card>
                <MDBox p={2}>
                  <MDBox mt={2}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={5}>
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
                      <Grid item xs={5}>
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
                  </MDBox>

                  <MDBox mt={2}>
                    {chartData && (
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                            title: {
                              display: true,
                              text: "Daily Energy Production (kW)",
                            },
                          },
                          scales: {
                            x: {
                              stacked: true,
                            },
                            y: {
                              stacked: true,
                            },
                          },
                        }}
                      />
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
