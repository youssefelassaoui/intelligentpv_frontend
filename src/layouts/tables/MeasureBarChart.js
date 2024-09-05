import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";

const MeasureBarChart = ({ plantId }) => {
  const [barChartData, setBarChartData] = useState(null);
  const [startDate, setStartDate] = useState("2024-09-01");
  const [endDate, setEndDate] = useState("2024-09-03");

  const fetchMeasures = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/measures");
      const rawData = response.data;

      // Filter data based on plantId and date range
      const filteredData = rawData.filter((item) => {
        const date = new Date(item.key.datetime).toISOString().split("T")[0];
        return date >= startDate && date <= endDate && item.key.plantId === parseInt(plantId);
      });

      // Extract labels and data for each hour
      const labels = Array.from(
        new Set(
          filteredData.map((item) =>
            new Date(item.key.datetime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          )
        )
      );

      // Extract data for AoutputVoltage and AoutputElectricity
      const voltageData = labels.map((label) => {
        const voltageMeasure = filteredData.find(
          (item) =>
            item.key.variable === "AoutputVoltage" &&
            new Date(item.key.datetime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) === label
        );
        return voltageMeasure ? voltageMeasure.measure : null;
      });

      const electricityData = labels.map((label) => {
        const electricityMeasure = filteredData.find(
          (item) =>
            item.key.variable === "AoutputElectricity" &&
            new Date(item.key.datetime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) === label
        );
        return electricityMeasure ? electricityMeasure.measure : null;
      });

      // Prepare chart data
      setBarChartData({
        labels,
        datasets: [
          {
            label: "AoutputVoltage (Voltage)",
            data: voltageData,
            backgroundColor: "#3e95cd",
          },
          {
            label: "AoutputElectricity (Electricity)",
            data: electricityData,
            backgroundColor: "#8e5ea2",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching measures data:", error);
    }
  };

  useEffect(() => {
    fetchMeasures();
  }, [plantId, startDate, endDate]);

  return (
    <Card sx={{ height: "auto" }}>
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
              onClick={fetchMeasures}
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
        <MDBox mt={2} sx={{ height: "400px" }}>
          {barChartData && (
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: `Voltage and Electricity (Plant ${plantId})`,
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
                      text: "Measure",
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

MeasureBarChart.propTypes = {
  plantId: PropTypes.number.isRequired,
};

export default MeasureBarChart;
