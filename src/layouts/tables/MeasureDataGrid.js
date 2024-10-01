import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import Cookies from "js-cookie"; // Import for handling cookies
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip"; // Import Chip from MUI

const MeasureDataGrid = ({ plantId }) => {
  const [tableRows, setTableRows] = useState([]);

  const fetchMeasures = async () => {
    try {
      // Retrieve JWT token from cookies
      const token = Cookies.get("authToken");

      // Ensure token exists
      if (!token) {
        throw new Error("Token not found in cookies");
      }

      // Fetch measures with JWT token in Authorization header
      const response = await axios.get("http://localhost:8080/api/measures", {
        headers: {
          Authorization: `Bearer ${token}`, // Attach token to the Authorization header
        },
      });

      const rawData = response.data;

      // Filter data based on plantId
      const filteredData = rawData.filter((item) => item.key.plantId === parseInt(plantId));

      // Log to ensure filtering is correct
      console.log("Filtered Data for DataGrid:", filteredData);

      // Prepare table rows for DataGrid
      const rows = filteredData.map((item, index) => ({
        id: index,
        deviceId: item.key.deviceId,
        variable: item.key.variable,
        measure: item.measure,
        datetime: new Date(item.key.datetime).toLocaleString(), // Format datetime
      }));

      console.log("Rows for DataGrid:", rows);

      setTableRows(rows); // Set table rows
    } catch (error) {
      console.error("Error fetching measures data:", error);
    }
  };

  useEffect(() => {
    if (plantId) {
      fetchMeasures();
    }
  }, [plantId]);

  // Map variables to specific colors
  const variableColorMapping = {
    AoutputVoltage: "#229799",
    AoutputElectricity: "#A04747",
    // Add other variables and colors here
  };

  // Columns for the DataGrid
  const columns = [
    { field: "datetime", headerName: "Date/Time", flex: 2 },
    { field: "deviceId", headerName: "Device ID", flex: 1 },
    {
      field: "variable",
      headerName: "Variable",
      flex: 1,
      renderCell: (params) => {
        const color = variableColorMapping[params.value] || "#000"; // Default to black if no color found
        return (
          <Chip
            label={params.value}
            style={{
              backgroundColor: color,
              color: "#fff",
            }}
          />
        );
      },
    },
    { field: "measure", headerName: "Measure", flex: 1 },
  ];

  return (
    <Card sx={{ height: "400px", marginLeft: "10px", marginTop: "15px" }}>
      <MDBox p={1} sx={{ height: "100%" }}>
        <MDBox mt={3} sx={{ height: 360 }}>
          <DataGrid
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            rows={tableRows} // This should contain the filtered rows
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
          />
        </MDBox>
      </MDBox>
    </Card>
  );
};

MeasureDataGrid.propTypes = {
  plantId: PropTypes.number.isRequired,
};

export default MeasureDataGrid;
