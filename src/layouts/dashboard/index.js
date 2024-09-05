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
import KpiLineChart from "layouts/dashboard/components/Kpis/linechart";

function Dashboard() {
  const [startDate, setStartDate] = useState("2024-05-10");
  const [endDate, setEndDate] = useState("2024-05-20");
  const [chartData, setChartData] = useState(null);

  const handleFetchData = async () => {
    const data = await fetchProductionEnergyData();

    // Process and filter the data to ensure no null values are causing issues
    const filteredData = Object.entries(data)
      .filter(
        ([date]) => new Date(date) >= new Date(startDate) && new Date(date) <= new Date(endDate)
      )
      .reduce((obj, [key, value]) => {
        obj[key] = {
          "Hospital Universitario Reina Sofía": value["Hospital Universitario Reina Sofía"] || 0,
          GSBP: value["GSBP"] || 0,
          "Musée Mohammed VI d'art moderne et contemporain":
            value["Musée Mohammed VI d'art moderne et contemporain"] || 0,
        };
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

    setChartData({
      labels,
      datasets,
    });

    console.log("Filtered Data:", filteredData); // Log the filtered data for debugging
    console.log("Chart Data:", { labels, datasets }); // Log the chart data for debugging
  };

  useEffect(() => {
    handleFetchData();
  }, [startDate, endDate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={1.5}>
        <MDBox mt={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={3.4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={1}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} md={7}>
              <Projects />
            </Grid>
            {/* <Grid item xs={12} md={5}>
              <KpiLineChart startDate={startDate} endDate={endDate} />
            </Grid> */}
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
