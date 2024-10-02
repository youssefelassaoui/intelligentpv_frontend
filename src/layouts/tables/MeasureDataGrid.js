import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import Cookies from "js-cookie"; // Import to manage cookies for JWT
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip"; // Import Chip from MUI

const MeasureDataGrid = ({ plantId }) => {
  const [tableRows, setTableRows] = useState([]);
  const [page, setPage] = useState(0); // Page state for pagination
  const [pageSize, setPageSize] = useState(20); // Page size state
  const [totalElements, setTotalElements] = useState(0); // Total elements returned by the API
  const [loading, setLoading] = useState(false); // Loading state

  const fetchMeasures = async (pageNumber = 0, size = 20) => {
    try {
      setLoading(true); // Set loading to true while fetching data

      // Retrieve the token from cookies (or localStorage, depending on your setup)
      const token = Cookies.get("authToken"); // Ensure you have the correct cookie name
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      // Send the request with Authorization headers
      const response = await axios.get(
        `http://localhost:8080/api/measures/paginated?page=${pageNumber}&size=${size}&plantId=${plantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
        }
      );

      const rawData = response.data.content; // Access the paginated content
      const totalItems = response.data.totalElements; // Get the total number of elements
      setTotalElements(totalItems);

      // Prepare table rows for DataGrid
      const rows = rawData.map((item, index) => ({
        id: index + pageNumber * size, // Ensure unique IDs by including page number
        deviceId: item.key.deviceId,
        variable: item.key.variable,
        measure: item.measure,
        datetime: new Date(item.key.datetime).toLocaleString(), // Format datetime
      }));

      setTableRows(rows); // Set table rows
      setLoading(false); // Set loading to false after fetching
    } catch (error) {
      console.error("Error fetching measures data:", error);
      setLoading(false); // Ensure loading is stopped on error
    }
  };

  // Fetch measures whenever the page, pageSize, or plantId changes
  useEffect(() => {
    if (plantId) {
      fetchMeasures(page, pageSize); // Pass the page and size dynamically
    }
  }, [plantId, page, pageSize]);

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
            loading={loading} // Show loading indicator while data is being fetched
            rows={tableRows} // This should contain the filtered rows
            columns={columns}
            pageSize={pageSize}
            rowCount={totalElements} // Set total row count from API
            paginationMode="server" // Enable server-side pagination
            onPageChange={(newPage) => setPage(newPage)} // Handle page change
            onPageSizeChange={(newSize) => setPageSize(newSize)} // Handle page size change
            rowsPerPageOptions={[5, 10, 20, 50]} // Options for rows per page
            pagination
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
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
