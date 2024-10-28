import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip"; // Import Chip component from Material UI
import BulletList from "./BulletListLoader"; // Import BulletList loader
import dayjs from "dayjs"; // For date formatting

const StatusDataGrid = ({ plantId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping of status codes to descriptions
  const statusDescriptionMapping = {
    0: "Standby: initializing",
    1: "Standby: insulation resistance detecting",
    2: "Standby: irradiation detecting",
    3: "Standby: grid detecting",
    256: "Start",
    512: "Grid-connected",
    513: "Grid-connected: power limited",
    514: "Grid-connected: self-derating",
    515: "Off-grid operation",
    768: "Shutdown: on fault",
    769: "Shutdown: on command",
    770: "Shutdown: OVGR",
    771: "Shutdown: communication interrupted",
    772: "Shutdown: power limited",
    773: "Shutdown: manual startup required",
    774: "Shutdown: DC switch disconnected",
    775: "Shutdown: rapid shutdown",
    776: "Shutdown: input underpower",
    777: "Shutdown: NS protection",
    778: "Shutdown: commanded rapid shutdown",
    1025: "Grid scheduling: cosφ-P curve",
    1026: "Grid scheduling: Q-U curve",
    1027: "Power grid scheduling: PF-U characteristic curve",
    1028: "Grid scheduling: dry contact",
    1029: "Power grid scheduling: Q-P characteristic curve",
    1280: "Ready for terminal test",
    1281: "Terminal testing...",
    1536: "Inspection in progress",
    1792: "AFCI self-check",
    2048: "I-V scanning",
    2304: "DC input detection",
    2560: "Off-grid charging",
    40960: "Standby: no irradiation",
    40961: "Standby: no DC input",
    45056: "Communication interrupted (written by SmartLogger)",
    49152: "Loading... (written by SmartLogger)",
  };

  const columns = [
    { field: "datetime", headerName: "Datetime", width: 200 },
    { field: "status", headerName: "Status", width: 70 },
    { field: "deviceName", headerName: "Device Name", width: 120 },
    {
      field: "description",
      headerName: "Description",
      width: 160,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: "#83BD75", // Custom background color
            color: "white", // Custom text color
          }}
        />
      ),
    },
  ];

  const fetchStatusData = async () => {
    setLoading(true);

    try {
      const startDate = dayjs().subtract(7, "day").format("YYYY-MM-DDT00:00:00[Z]");
      const endDate = dayjs().format("YYYY-MM-DDT23:59:59[Z]");

      const response = await axios.get(`/.netlify/functions/proxy/api/measures/status`, {
        params: {
          plantId,
          page: 1,
          size: 1000,
          startDate,
          endDate,
        },
      });

      const rowData = response.data.measuresWithDevices.map((item, index) => {
        const statusValue = item.measure.measure;
        const description = statusDescriptionMapping[statusValue] || "Unknown status";
        const datetime = dayjs(item.measure.key.datetime).format("YYYY-MM-DD HH:mm:ss");

        return {
          id: index + 1,
          datetime,
          status: statusValue,
          deviceName: item.deviceInfo?.deviceName || "Unknown",
          description,
        };
      });

      setRows(rowData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching status data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plantId) {
      fetchStatusData();
    }
  }, [plantId]);

  return (
    <Card sx={{ height: "340px", marginLeft: "2px", width: "98%", marginTop: "18px" }}>
      <MDBox p={2}>
        {loading ? (
          <MDBox
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <BulletList /> {/* Show BulletList loader */}
          </MDBox>
        ) : (
          <div style={{ height: 300, width: "100%" }}>
            <DataGrid rows={rows} columns={columns} pageSize={5} />
          </div>
        )}
      </MDBox>
    </Card>
  );
};

// Add PropTypes validation for plantId
StatusDataGrid.propTypes = {
  plantId: PropTypes.number.isRequired, // Define plantId as a required prop
};

export default StatusDataGrid;
