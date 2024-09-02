import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function Tables() {
  const [selectedTab, setSelectedTab] = useState("GSBP");

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={selectedTab} onChange={handleChange} aria-label="plant tabs">
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
                <MDBox mt={2} px={3}>
                  {/* Tab content based on selectedTab value */}
                  {selectedTab === "GSBP" && (
                    <Box>
                      {/* Replace with GSBP content */}
                      GSBP Content
                    </Box>
                  )}
                  {selectedTab === "Hospital Universitario Reina Sofía" && (
                    <Box>
                      {/* Replace with Hospital Universitario Reina Sofía content */}
                      Hospital Universitario Reina Sofía Content
                    </Box>
                  )}
                  {selectedTab === "Musée Mohammed VI d'art moderne et contemporain" && (
                    <Box>
                      {/* Replace with Musée Mohammed VI d'art moderne et contemporain content */}
                      Musée Mohammed VI d&apos;art moderne et contemporain Content
                    </Box>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
