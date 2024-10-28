import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import dayjs from "dayjs";
import XYChartLoader from "./XYChartLoader";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const MeasureLineChart = ({ plantId }) => {
  const phases = ["AoutputElectricity", "BoutputElectricity", "CoutputElectricity"];
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(dayjs().subtract(5, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().endOf("day").format("YYYY-MM-DD"));
  const [selectedPhase, setSelectedPhase] = useState(phases[0]);

  // Fetch devices and apply filters based on plantId
  const fetchDevices = async () => {
    try {
      const response = await axios.get("/.netlify/functions/proxy/api/devices");
      let filteredDevices = response.data.filter((device) => device.key.plantId === plantId);

      // For GSBP, exclude "Power Sensor" and "Africa Golden Riad"
      if (plantId === 49951765) {
        filteredDevices = filteredDevices.filter(
          (device) => !["Power Sensor", "Africa Golden Riad"].includes(device.deviceName)
        );
      }

      setDevices(filteredDevices);
      if (filteredDevices.length > 0) {
        setSelectedDeviceId(filteredDevices[0].key.deviceId);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  // Fetch measures data and filter based on the selected device
  const fetchMeasures = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/.netlify/functions/proxy/api/measures/paginated", {
        params: {
          plantId,
          page: 1,
          size: 1000,
          variableType: "Electricity",
          variable: selectedPhase,
          startDate: `${startDate}T00:00:00Z`,
          endDate: `${endDate}T23:59:59Z`,
        },
      });

      // Filter data for the selected device
      let rawData = response.data.measures.filter(
        (measure) => measure.key.deviceId === selectedDeviceId
      );

      rawData.sort((a, b) => new Date(a.key.datetime) - new Date(b.key.datetime));

      const labels = rawData.map((item) => dayjs(item.key.datetime).format("YYYY-MM-DD HH:mm:ss"));
      const dataValues = rawData.map((item) => item.measure);

      setChartData({
        labels,
        datasets: [
          {
            label: `${selectedPhase} (Ampere)`,
            data: dataValues,
            borderColor: "#FCCD2A",
            fill: false,
            tension: 0.1,
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching line chart data:", error.message || error);
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Date and Hour",
        },
        ticks: {
          maxTicksLimit: 6,
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            return dayjs(label).format("DD MMM");
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Electricity (Ampere)",
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Electricity: ${tooltipItem.raw} A`,
        },
      },
    },
  };

  // Fetch devices and measures data
  useEffect(() => {
    fetchDevices();
  }, [plantId]);

  useEffect(() => {
    fetchMeasures();
  }, [plantId, selectedDeviceId, startDate, endDate, selectedPhase]);

  return (
    <Card sx={{ height: "500px", width: "97%", marginTop: "18px", marginLeft: "21px" }}>
      <MDBox p={2}>
        <h3>Electricity (Ampere)</h3>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <Select
              value={selectedDeviceId || ""}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              fullWidth
            >
              {devices.map((device) => (
                <MenuItem key={device.key.deviceId} value={device.key.deviceId}>
                  {device.deviceName}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <MDBox mt={2} mb={2}>
          <Stack direction="row" spacing={5} justifyContent="center">
            {phases.map((phase) => (
              <Chip
                key={phase}
                label={phase}
                clickable
                sx={{
                  backgroundColor: selectedPhase === phase ? "#AEDBCE" : "default",
                  color: selectedPhase === phase ? "white" : "default",
                  "&:hover": {
                    backgroundColor: selectedPhase === phase ? "#50B498" : "#f5f5f5",
                    color: selectedPhase === phase ? "white" : "default",
                  },
                }}
                onClick={() => setSelectedPhase(phase)}
              />
            ))}
          </Stack>
        </MDBox>

        <MDBox
          mt={2}
          sx={{ height: "310px", width: "98%", overflowX: "scroll", position: "relative" }}
        >
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
              <XYChartLoader />
            </MDBox>
          ) : chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p>No data available</p>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
};

MeasureLineChart.propTypes = {
  plantId: PropTypes.number.isRequired,
};

export default MeasureLineChart;
