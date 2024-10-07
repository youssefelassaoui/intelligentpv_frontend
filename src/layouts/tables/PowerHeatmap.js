import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import XYChartLoader from "./XYChartLoader"; // Loader component
import dayjs from "dayjs"; // Date handling
import "./styles.css"; // Ensure the correct styles are imported

const DAY_INDEXES = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

// Generate background color based on the measure with fixed divisions
const generateBackgroundColor = (measure) => {
  if (measure <= 0) return "#e0f7fa"; // Lightest shade for zero values
  if (measure <= 50000) return "#b2ebf2";
  if (measure <= 100000) return "#80deea";
  if (measure <= 200000) return "#4dd0e1";
  if (measure <= 500000) return "#26c6da";
  if (measure <= 800000) return "#00bcd4";
  if (measure <= 2000000) return "#00acc1";
  if (measure <= 5000000) return "#0097a7";
  if (measure <= 10000000) return "#00838f";
  return "#006064"; // Darkest shade for high values above 800,000
};

// Updated generateLegend function for horizontal display of binary values (smallest and largest)
const generateLegend = () => {
  const minColor = "#e0f7fa"; // Lightest color
  const maxColor = "#006064"; // Darkest color

  return (
    <div className="legend-horizontal">
      <div
        className="cell"
        style={{
          background: `linear-gradient(90deg, ${minColor} 0%, ${maxColor} 100%)`,
          width: "100%",
          height: "20px",
        }}
      />
      <div
        className="labels-horizontal"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <span>0 kW</span>
        <span>10,000,000 kW</span> {/* Adjust based on max value */}
      </div>
    </div>
  );
};

const PowerHeatmap = ({ plantId }) => {
  const minMaxCount = useRef([]);
  const [formattedData, setFormattedData] = useState({});
  const [yAxisLabels, setYAxisLabels] = useState([]);
  const [xAxisLabels, setXAxisLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(dayjs().startOf("week").format("YYYY-MM-DD")); // Start of the current week
  const [endDate, setEndDate] = useState(dayjs().endOf("week").format("YYYY-MM-DD")); // End of the current week

  const fetchMeasures = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/measures/paginated", {
        params: {
          plantId,
          page: 1,
          size: 10000,
          variableType: "Power",
          startDate: `${startDate}T00:00:00Z`,
          endDate: `${endDate}T23:59:59Z`,
        },
      });

      const rawData = response.data.measures;

      const aggregatedData = rawData.reduce((acc, item) => {
        const date = new Date(item.key.datetime);
        const day = DAY_INDEXES[date.getDay()];
        const hour = dayjs(date).format("ha");
        const dayHourKey = `${day}-${hour}`;

        acc[dayHourKey] = acc[dayHourKey] || 0;
        acc[dayHourKey] += item.measure; // Aggregate the measure

        return acc;
      }, {});

      const uniqueDays = Array.from(
        new Set(rawData.map((item) => DAY_INDEXES[new Date(item.key.datetime).getDay()]))
      );
      const uniqueHours = Array.from(
        new Set(rawData.map((item) => dayjs(new Date(item.key.datetime)).format("ha")))
      );

      setFormattedData(aggregatedData);
      setXAxisLabels(uniqueHours); // Hours
      setYAxisLabels(uniqueDays); // Days
      setLoading(false);
    } catch (error) {
      console.error("Error fetching measures data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasures();
  }, [plantId, startDate, endDate]);

  const gridCells = yAxisLabels.reduce((days, dayLabel) => {
    const dayAndHour = xAxisLabels.reduce((hours, hourLabel) => {
      const count = formattedData[`${dayLabel}-${hourLabel}`] || 0;
      minMaxCount.current = [...minMaxCount.current, count];

      return [
        ...hours,
        {
          dayHour: `${dayLabel} ${hourLabel}`,
          count,
        },
      ];
    }, []);

    return {
      ...days,
      [dayLabel]: {
        hours: dayAndHour,
      },
    };
  }, {});

  return (
    <Card sx={{ height: "300px", marginLeft: "20px", width: "99%", marginTop: "18px" }}>
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

        <MDBox mt={2} sx={{ height: "200px", overflowX: "scroll", position: "relative" }}>
          {loading ? (
            <MDBox
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%", // Full height for loader
                width: "100%", // Full width for loader
              }}
            >
              <XYChartLoader />
            </MDBox>
          ) : (
            <div className="heatmap horizontal">
              {Object.keys(gridCells).map((day) => (
                <div key={day} className="cells col">
                  {gridCells[day].hours.map(({ dayHour, count }) => (
                    <div
                      key={dayHour}
                      className="cell"
                      style={{ backgroundColor: generateBackgroundColor(count) }}
                    >
                      <div className="tooltip" role="tooltip">
                        <span className="count">{count.toFixed(2)} kW</span>
                        <span>{dayHour}</span>
                      </div>
                    </div>
                  ))}
                  <span className="label">{day}</span>
                </div>
              ))}
              <div className="col">
                {xAxisLabels.map((label, index) => (
                  <span key={label} className="label">
                    {label} {/* Display the hour format */}
                  </span>
                ))}
              </div>
            </div>
          )}
        </MDBox>

        {/* Horizontal Legend inside the component */}
        <MDBox mt={4} sx={{ display: "flex", justifyContent: "center" }}>
          {generateLegend()}
        </MDBox>
      </MDBox>
    </Card>
  );
};

// Add PropTypes validation for the component
PowerHeatmap.propTypes = {
  plantId: PropTypes.number.isRequired, // Define plantId as a required prop
};

export default PowerHeatmap;
