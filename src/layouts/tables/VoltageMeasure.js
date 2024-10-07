import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Cookies from "js-cookie";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import dayjs from "dayjs"; // For handling date formatting
import XYChartLoader from "./XYChartLoader"; // The loader component

const MeasureLineChart = ({ plantId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [startDate, setStartDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD")); // Default to the first day of the current month
  const [endDate, setEndDate] = useState(dayjs().endOf("day").format("YYYY-MM-DD")); // Default to today

  // Fetch and aggregate voltage data
  const fetchMeasures = async () => {
    setLoading(true); // Set loading state to true before fetching data
    try {
      const token = Cookies.get("authToken");
      const response = await axios.get(`http://localhost:8080/api/measures/paginated`, {
        params: {
          plantId,
          page: 1,
          size: 10000,
          variableType: "Voltage",
          startDate: `${startDate}T00:00:00Z`,
          endDate: `${endDate}T23:59:59Z`,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rawData = response.data.measures;

      // Sort by datetime to display the latest data first
      rawData.sort((a, b) => new Date(b.key.datetime) - new Date(a.key.datetime));

      // Aggregate data by day and hour
      const aggregatedData = {};
      rawData.forEach((item) => {
        const date = dayjs(item.key.datetime).format("YYYY-MM-DD");
        const hour = dayjs(item.key.datetime).hour();
        const key = `${date} ${hour}:00`;

        if (!aggregatedData[key]) {
          aggregatedData[key] = 0;
        }
        aggregatedData[key] += item.measure;
      });

      // Prepare chart data
      const labels = Object.keys(aggregatedData); // x-axis labels: day + hour
      const dataValues = Object.values(aggregatedData); // y-axis values

      setChartData({
        labels,
        datasets: [
          {
            label: "Voltage (V)",
            data: dataValues,
            borderColor: "#EE4E4E",
            fill: false,
            tension: 0.1, // Smoother curve
          },
        ],
      });
      setLoading(false); // Set loading state to false after data is fetched
    } catch (error) {
      console.error("Error fetching line chart data:", error.message || error);
      setLoading(false); // Set loading state to false even if there is an error
    }
  };

  // Fetch data on component mount and when the date range changes
  useEffect(() => {
    fetchMeasures();
  }, [plantId, startDate, endDate]);

  return (
    <Card sx={{ height: "420px", marginLeft: "20px", width: "99%", marginTop: "18px" }}>
      <MDBox p={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
        </Grid>

        <MDBox mt={2} sx={{ height: "330px", overflowX: "scroll", position: "relative" }}>
          {loading ? (
            <MDBox
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%", // Make loader fill the entire height
                width: "100%", // Make loader fill the entire width
              }}
            >
              <XYChartLoader />
            </MDBox>
          ) : chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Date and Hour",
                    },
                    ticks: {
                      maxTicksLimit: 6, // Limit the number of displayed ticks
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Voltage (V)",
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `Voltage: ${tooltipItem.raw} V`,
                    },
                  },
                },
              }}
            />
          ) : (
            <p>No data available</p> // Show a message if there is no data
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
};

// Define PropTypes validation for plantId
MeasureLineChart.propTypes = {
  plantId: PropTypes.number.isRequired, // Define plantId as a required prop
};

export default MeasureLineChart;
