import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import XYChartLoader from "./XYChartLoader";
import dayjs from "dayjs";
import "./styles.css";

const DAY_INDEXES = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const generateBackgroundColor = (measure, isFuture) => {
  if (isFuture) return "#d3d3d3";
  if (measure <= 0) return "#e0f7fa";
  if (measure <= 20) return "#b2ebf2";
  if (measure <= 50) return "#80deea";
  if (measure <= 100) return "#4dd0e1";
  if (measure <= 150) return "#26c6da";
  if (measure <= 300) return "#00bcd4";
  if (measure <= 500) return "#00acc1";
  if (measure <= 800) return "#0097a7";
  if (measure <= 1000) return "#00838f";
  return "#006064";
};

const generateLegend = () => {
  const minColor = "#e0f7fa";
  const maxColor = "#006064";
  const greyColor = "#d3d3d3";

  return (
    <div
      className="legend-horizontal"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginTop: "-10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginRight: "20px",
        }}
      >
        <div
          className="cell"
          style={{
            background: `linear-gradient(90deg, ${minColor} 0%, ${maxColor} 100%)`,
            width: "120px",
            height: "10px",
            marginBottom: "5px",
          }}
        />
        <div
          className="labels-horizontal"
          style={{ display: "flex", justifyContent: "space-between", width: "120px" }}
        >
          <span style={{ fontSize: "10px" }}>0 kW</span>
          <span style={{ fontSize: "10px" }}>1,000 kW</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: "20px",
        }}
      >
        <div
          className="cell"
          style={{
            backgroundColor: greyColor,
            width: "12px",
            height: "12px",
            marginRight: "5px",
          }}
        />
        <span style={{ fontSize: "10px" }}>Future Hours</span>
      </div>
    </div>
  );
};

const isFutureHour = (hour) => {
  const now = dayjs();
  const currentHour = now.hour();
  const parsedHour = dayjs(hour, "ha").hour();
  return parsedHour >= currentHour;
};

const PowerHeatmap = ({ plantId }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const minMaxCount = useRef([]);
  const [formattedData, setFormattedData] = useState({});
  const [yAxisLabels, setYAxisLabels] = useState([]);
  const [xAxisLabels, setXAxisLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(dayjs().startOf("week").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().endOf("week").format("YYYY-MM-DD"));

  const fetchDevices = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/devices");
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

  const fetchMeasures = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8081/api/measures/paginated", {
        params: {
          plantId,
          page: 1,
          size: 1000,
          variableType: "Power",
          variable: "outputActivePower",
          startDate: `${startDate}T00:00:00Z`,
          endDate: `${endDate}T23:59:59Z`,
        },
      });

      let rawData = response.data.measures;
      rawData = rawData.filter((measure) => measure.key.deviceId === selectedDeviceId);

      const aggregatedData = rawData.reduce((acc, item) => {
        const date = new Date(item.key.datetime);
        const day = DAY_INDEXES[date.getDay()];
        const hour = dayjs(date).format("ha");
        const dayHourKey = `${day}-${hour}`;

        acc[dayHourKey] = acc[dayHourKey] || 0;
        acc[dayHourKey] += item.measure;

        return acc;
      }, {});

      const uniqueDays = Array.from(
        new Set(rawData.map((item) => DAY_INDEXES[new Date(item.key.datetime).getDay()]))
      ).reverse();

      const hoursRange = [
        "5am",
        "4am",
        "3am",
        "2am",
        "1am",
        "12am",
        "11pm",
        "10pm",
        "9pm",
        "8pm",
        "7pm",
        "6pm",
        "5pm",
        "4pm",
        "3pm",
        "2pm",
        "1pm",
        "12pm",
        "11am",
        "10am",
        "9am",
        "8am",
        "7am",
        "6am",
      ];

      setFormattedData(aggregatedData);
      setXAxisLabels(hoursRange);
      setYAxisLabels(uniqueDays);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching measures data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [plantId]);

  useEffect(() => {
    fetchMeasures();
  }, [plantId, selectedDeviceId, startDate, endDate]);

  return (
    <Card sx={{ height: "340px", width: "98%", marginTop: "18px", marginLeft: "18px" }}>
      <MDBox p={2}>
        <h3>Power (kW)</h3>
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

        <MDBox mt={2} sx={{ height: "200px", overflowX: "scroll", position: "relative" }}>
          {loading ? (
            <MDBox
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "80%",
              }}
            >
              <XYChartLoader />
            </MDBox>
          ) : (
            <div className="heatmap horizontal">
              {yAxisLabels.map((day) => (
                <div key={day} className="cells col">
                  {xAxisLabels.map((hour) => {
                    const count = formattedData[`${day}-${hour}`] || 0;
                    const future = isFutureHour(hour);
                    minMaxCount.current = [...minMaxCount.current, count];

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="cell"
                        style={{ backgroundColor: generateBackgroundColor(count, future) }}
                      >
                        <div className="tooltip" role="tooltip">
                          <span className="count">{count.toFixed(2)} kW</span>
                          <span>{`${day} ${hour}`}</span>
                        </div>
                      </div>
                    );
                  })}
                  <span className="label">{day}</span>
                </div>
              ))}
              <div className="col">
                {xAxisLabels.map((label) => (
                  <span key={label} className="label">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </MDBox>

        <MDBox mt={0} sx={{ display: "flex", justifyContent: "center" }}>
          {generateLegend()}
        </MDBox>
      </MDBox>
    </Card>
  );
};

PowerHeatmap.propTypes = {
  plantId: PropTypes.number.isRequired,
};

export default PowerHeatmap;
