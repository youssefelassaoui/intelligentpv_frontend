import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import Cookies from "js-cookie"; // Import to manage cookies for JWT
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip"; // Import Chip from MUI

const MeasureDataGrid = ({ plantId }) => {
  const [tableRows, setTableRows] = useState([]); // Store rows of data
  const [page, setPage] = useState(0); // Current page for pagination
  const [pageSize, setPageSize] = useState(20); // Number of rows per page
  const [totalElements, setTotalElements] = useState(0); // Total rows count returned by API
  const [loading, setLoading] = useState(false); // Loading state

  // Function to fetch measures from the server
  const fetchMeasures = async (pageNumber = 0, size = 20) => {
    try {
      setLoading(true); // Indicate loading state while fetching data

      // Retrieve the token from cookies (or localStorage, depending on your setup)
      const token = Cookies.get("authToken"); // Ensure you have the correct cookie name
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      // Make the request to the API with pagination and plantId filtering
      const response = await axios.get(
        `http://localhost:8080/api/measures/paginated?page=${pageNumber}&size=${size}&plantId=${plantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        }
      );

      const rawData = response.data.content; // Extract paginated content from response
      const totalItems = response.data.totalElements; // Get total number of elements

      setTotalElements(totalItems); // Update total elements

      // Prepare table rows for DataGrid
      const rows = rawData.map((item, index) => ({
        id: index + pageNumber * size, // Ensure unique IDs by including page number
        deviceId: item.key.deviceId,
        variable: item.key.variable,
        measure: item.measure,
        datetime: new Date(item.key.datetime).toLocaleString(), // Format datetime for better readability
      }));

      setTableRows(rows); // Set table rows to state
      setLoading(false); // Set loading to false after fetching
    } catch (error) {
      console.error("Error fetching measures data:", error);
      setLoading(false); // Ensure loading stops if there's an error
    }
  };

  // Fetch measures whenever page, pageSize, or plantId changes
  useEffect(() => {
    if (plantId) {
      fetchMeasures(page, pageSize); // Call the API with the current page, pageSize, and plantId
    }
  }, [plantId, page, pageSize]);

  // Define custom variable colors for display
  const variableColorMapping = {
    AoutputVoltage: "#229799",
    AoutputElectricity: "#A04747",
    // Add other variables and colors here as needed
  };

  // Define columns for the DataGrid
  const columns = [
    { field: "datetime", headerName: "Date/Time", flex: 2 },
    { field: "deviceId", headerName: "Device ID", flex: 1 },
    {
      field: "variable",
      headerName: "Variable",
      flex: 1,
      renderCell: (params) => {
        const color = variableColorMapping[params.value] || "#000"; // Default color if none is specified
        return (
          <Chip
            label={params.value}
            style={{
              backgroundColor: color,
              color: "#fff", // White text on colored background
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
            loading={loading} // Show loading indicator while data is being fetched
            rows={tableRows} // Filtered rows based on plantId
            columns={columns} // Columns definition
            pageSize={pageSize} // Page size
            rowCount={totalElements} // Total number of rows
            paginationMode="server" // Enable server-side pagination
            onPageChange={(newPage) => setPage(newPage)} // Handle page changes
            onPageSizeChange={(newSize) => setPageSize(newSize)} // Handle changes in page size
            rowsPerPageOptions={[5, 10, 20, 50]} // Options for rows per page
            pagination // Enable pagination
            slots={{ toolbar: GridToolbar }} // Toolbar for quick filtering, etc.
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 }, // Add debounce to the filter for performance
              },
            }}
            disableSelectionOnClick // Disable row selection
          />
        </MDBox>
      </MDBox>
    </Card>
  );
};

MeasureDataGrid.propTypes = {
  plantId: PropTypes.number.isRequired, // plantId is required to filter data
};

export default MeasureDataGrid;
