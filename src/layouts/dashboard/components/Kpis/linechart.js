import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import axios from "axios";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

const KpiLineChart = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [startDate, setStartDate] = useState("2024-05-30");
  const [endDate, setEndDate] = useState("2024-05-30");

  const fetchKpiData = async () => {
    try {
      const kpiResponse = await axios.get("http://localhost:8080/api/kpis");
      const kpiData = kpiResponse.data;

      const filteredData = kpiData.filter((item) => {
        const date = new Date(item.datetime).toISOString().split("T")[0];
        return date >= startDate && date <= endDate;
      });

      // Sort the data by datetime to ensure the correct order
      filteredData.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

      const kpiLabels = filteredData.map((item) =>
        new Date(item.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      const performanceRatioData = filteredData
        .filter((item) => item.key.kpiName === "Performance Ratio")
        .map((item) => item.key.value);
      const yieldData = filteredData
        .filter((item) => item.key.kpiName === "Yield")
        .map((item) => item.key.value);

      setLineChartData({
        labels: kpiLabels,
        datasets: [
          {
            label: "Performance Ratio",
            data: performanceRatioData,
            borderColor: "#3e95cd",
            fill: false,
          },
          {
            label: "Yield",
            data: yieldData,
            borderColor: "#8e5ea2",
            fill: false,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching KPI data:", error);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, [startDate, endDate]);

  return (
    <Card sx={{ height: "400px" }}>
      <MDBox p={2} sx={{ height: "100%" }}>
        <Grid container spacing={2} alignItems="center">
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
              onClick={fetchKpiData}
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
        <MDBox mt={2} sx={{ height: "100%" }}>
          {lineChartData && (
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "KPI Values Over Time",
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Time",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "KPI Value",
                    },
                  },
                },
              }}
            />
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
};

KpiLineChart.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};

export default KpiLineChart;
