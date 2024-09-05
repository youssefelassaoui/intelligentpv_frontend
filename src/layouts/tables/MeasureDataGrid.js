import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";

const MeasureDataGrid = ({ plantId, startDate, endDate }) => {
  const [tableRows, setTableRows] = useState([]);

  const fetchMeasures = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/measures");
      const rawData = response.data;

      // Filter data based on plantId and date range
      const filteredData = rawData.filter((item) => {
        const date = new Date(item.key.datetime).toISOString().split("T")[0];
        return date >= startDate && date <= endDate && item.key.plantId === parseInt(plantId);
      });

      console.log("Filtered Data:", filteredData); // Log filtered data to ensure it's correct

      // Prepare table rows for DataGrid
      const rows = filteredData.map((item, index) => ({
        id: index,
        deviceId: item.key.deviceId,
        variable: item.key.variable,
        measure: item.measure,
        datetime: new Date(item.key.datetime).toLocaleString(), // Add datetime for the DataGrid
      }));

      console.log("Table Rows:", rows); // Log table rows to check if they're correct
      setTableRows(rows);
    } catch (error) {
      console.error("Error fetching measures data:", error);
    }
  };

  useEffect(() => {
    if (plantId) {
      fetchMeasures();
    }
  }, [plantId, startDate, endDate]);

  // Columns for the DataGrid
  const columns = [
    { field: "datetime", headerName: "Date/Time", flex: 2 },
    { field: "deviceId", headerName: "Device ID", flex: 1 },
    { field: "variable", headerName: "Variable", flex: 1 },
    { field: "measure", headerName: "Measure", flex: 1 },
  ];

  return (
    <Card sx={{ height: "400px" }}>
      <MDBox p={2} sx={{ height: "100%" }}>
        <MDBox mt={3} sx={{ height: 400 }}>
          <DataGrid
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
                exportButton: true,
              },
            }}
            rows={tableRows}
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
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

export default MeasureDataGrid;
