import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { Bar } from "react-chartjs-2";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { fetchProductionEnergyData } from "layouts/dashboard/data/productionEnergyData";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import Projects from "layouts/dashboard/components/Projects";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PowerIcon from "@mui/icons-material/Power";
import StorageIcon from "@mui/icons-material/Storage";
import OnduleurComponent from "layouts/dashboard/components/OnduleurComponent";
import PlantStockCards from "layouts/dashboard/PlantStockCards";
import Footer from "examples/Footer";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(null); // Initially empty
  const [endDate, setEndDate] = useState(null); // Initially empty
  const [chartData, setChartData] = useState(null); // Chart data state

  const navigate = useNavigate(); // Initialize navigate for redirection

  const getDateNDaysAgo = (n) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
  };

  const handleFetchData = async () => {
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    // If no dates are selected, default to the last 10 days
    if (!startDate || !endDate) {
      finalStartDate = getDateNDaysAgo(10); // 10 days ago
      finalEndDate = getDateNDaysAgo(0); // Today
    }

    const data = await fetchProductionEnergyData(finalStartDate, finalEndDate);

    const filteredData = Object.entries(data)
      .filter(
        ([date]) =>
          new Date(date) >= new Date(finalStartDate) && new Date(date) <= new Date(finalEndDate)
      )
      .reduce((obj, [key, value]) => {
        obj[key] = {
          "Hospital Universitario Reina Sofía": value["Hospital Universitario Reina Sofía"] || 0,
          GSBP: value["GSBP"] || 0,
          "Musée Mohammed VI d'art moderne et contemporain":
            value["Musée Mohammed VI d art moderne et contemporain"] || 0,
        };
        return obj;
      }, {});

    const labels = Object.keys(filteredData);
    const datasets = [
      {
        label: "Hospital Universitario Reina Sofía",
        data: labels.map((date) => filteredData[date]["Hospital Universitario Reina Sofía"] || 0), // Convert to kW
        backgroundColor: "#7695FF",
      },
      {
        label: "GSBP",
        data: labels.map((date) => filteredData[date]["GSBP"] || 0), // Convert to kW
        backgroundColor: "#41B3A2",
      },
      {
        label: "Musée Mohammed VI d'art moderne et contemporain",
        data: labels.map(
          (date) => filteredData[date]["Musée Mohammed VI d'art moderne et contemporain"] || 0
        ), // Convert to kW
        backgroundColor: "#E4B1F0",
      },
    ];

    setChartData({
      labels,
      datasets,
    });
  };

  useEffect(() => {
    handleFetchData(); // Fetch data on mount and when startDate or endDate changes
  }, [startDate, endDate]);

  // Function to handle navigation to the Tables component with system name
  const handleViewDetails = (systemName) => {
    navigate(`/tables/${systemName}`); // This navigates to the dynamic route
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={1.5}>
        <MDBox mt={3}>
          <Grid container spacing={3}>
            {/* GSBP Card */}
            <Grid item xs={12} md={3}>
              <Card>
                <MDBox p={2}>
                  <img
                    src="/plantimage.png"
                    alt="Photovoltaic System 1"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <MDBox mt={1}>
                    <h5 style={{ fontSize: "16px", margin: "0" }}>GSBP</h5>

                    {/* Location */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <LocationOnIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Location:</b> Ben Guerir 43150, Mo
                      </p>
                    </MDBox>

                    {/* Capacity */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <PowerIcon fontSize="small" style={{ color: "green", marginRight: "5px" }} />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Capacity:</b> 6 kW
                      </p>
                    </MDBox>

                    {/* Strings */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <StorageIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Strings:</b> 3
                      </p>
                    </MDBox>

                    <MDBox mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#B4E4FF",
                          color: "black !important",
                          "&:hover": { backgroundColor: "#1C82AD" },
                        }}
                        onClick={() => handleViewDetails("GSBP")} // Navigate with system name GSBP
                      >
                        View System Details
                      </Button>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Hospital Universitario Reina Sofía Card */}
            <Grid item xs={12} md={3}>
              <Card>
                <MDBox p={2}>
                  <img
                    src="/plantimage.png"
                    alt="Photovoltaic System 2"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <MDBox mt={1}>
                    <h5 style={{ fontSize: "16px", margin: "0" }}>
                      Hospital Universitario Reina Sofía
                    </h5>

                    {/* Location */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <LocationOnIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Location:</b> Av. Menéndez Pidal, Córdoba, Sp
                      </p>
                    </MDBox>

                    {/* Capacity */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <PowerIcon fontSize="small" style={{ color: "green", marginRight: "5px" }} />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Capacity:</b> 1.72 MW
                      </p>
                    </MDBox>

                    {/* Strings */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <StorageIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Strings:</b> 274
                      </p>
                    </MDBox>

                    <MDBox mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#B4E4FF",
                          color: "black !important",
                          "&:hover": { backgroundColor: "#1C82AD" },
                        }}
                        onClick={() => handleViewDetails("Hospital Universitario Reina Sofía")} // Navigate with system name
                      >
                        View System Details
                      </Button>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Musée Mohammed VI Card */}
            <Grid item xs={12} md={3}>
              <Card>
                <MDBox p={2}>
                  <img
                    src="/plantimage.png"
                    alt="Photovoltaic System 3"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <MDBox mt={1}>
                    <h5 style={{ fontSize: "16px", margin: "0" }}>
                      Musée Mohammed VI d&apos;art moderne
                    </h5>

                    {/* Location */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <LocationOnIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Location:</b> 2 Av. Moulay Hassan, Rabat, Mo
                      </p>
                    </MDBox>

                    {/* Capacity */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <PowerIcon fontSize="small" style={{ color: "green", marginRight: "5px" }} />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Capacity:</b>136 kw
                      </p>
                    </MDBox>

                    {/* Strings */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <StorageIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Strings:</b> 20
                      </p>
                    </MDBox>

                    <MDBox mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#B4E4FF",
                          color: "black !important",
                          "&:hover": { backgroundColor: "#1C82AD" },
                        }}
                        onClick={() => handleViewDetails("Musée Mohammed VI d'art moderne")} // Navigate with system name
                      >
                        View System Details
                      </Button>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <MDBox p={2}>
                  <img
                    src="/plantimage.png"
                    alt="Photovoltaic System 3"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                  <MDBox mt={1}>
                    <h5 style={{ fontSize: "16px", margin: "0" }}>Plant 4</h5>

                    {/* Location */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <LocationOnIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Location:</b> ....
                      </p>
                    </MDBox>

                    {/* Capacity */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <PowerIcon fontSize="small" style={{ color: "green", marginRight: "5px" }} />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Capacity:</b> ....
                      </p>
                    </MDBox>

                    {/* Strings */}
                    <MDBox display="flex" alignItems="center" style={{ margin: "5px 0" }}>
                      <StorageIcon
                        fontSize="small"
                        style={{ color: "green", marginRight: "5px" }}
                      />
                      <p style={{ fontSize: "12px", margin: "0" }}>
                        <b>Strings:</b> .....
                      </p>
                    </MDBox>

                    <MDBox mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#B4E4FF",
                          color: "black !important",
                          "&:hover": { backgroundColor: "#1C82AD" },
                        }}
                        onClick={() => handleViewDetails("...")} // Navigate with system name
                      >
                        View System Details
                      </Button>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Add other cards similarly */}
          </Grid>
        </MDBox>

        {/* Continue with the rest of the dashboard */}
        <MDBox mt={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={2}>
                  <MDBox mt={2}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={6}>
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
                      <Grid item xs={6}>
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
                      {/* <Grid item xs={2}>
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
                  </MDBox>

                  <MDBox mt={2}>
                    {chartData && (
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "top" },
                            title: { display: true, text: "Daily Energy Production (kW)" },
                          },
                          scales: {
                            x: { stacked: true },
                            y: { stacked: true },
                          },
                        }}
                      />
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Add PlantStockCards component next to OrdersOverview */}
            <Grid item xs={12} md={3}>
              <OrdersOverview />
            </Grid>

            <Grid item xs={12} md={3}>
              <PlantStockCards />
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={1}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} md={7}>
              <Projects />
            </Grid>

            {/* Add the OnduleurComponent here */}
            <Grid item xs={12} md={5}>
              <OnduleurComponent />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default Dashboard;
