import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import { fetchProductionEnergyData } from "layouts/dashboard/data/productionEnergyData";

const WeeklyComparisonChart = () => {
  const [comparisonData, setComparisonData] = useState(null);

  const plantColors = {
    "Hospital Universitario Reina Sofía": "#7695FF",
    GSBP: "#41B3A2",
    "Musée Mohammed VI d'art moderne et contemporain": "#D7C3F1",
  };

  const fetchWeeklyComparison = async () => {
    const data = await fetchProductionEnergyData();
    const today = new Date();
    const last7Days = new Date(today.setDate(today.getDate() - 7));
    const last14Days = new Date(today.setDate(today.getDate() - 14));

    const currentWeekData = Object.entries(data)
      .filter(([date]) => new Date(date) >= last7Days && new Date(date) <= today)
      .reduce((acc, [date, values]) => {
        acc[date] = values;
        return acc;
      }, {});

    const previousWeekData = Object.entries(data)
      .filter(([date]) => new Date(date) >= last14Days && new Date(date) <= last7Days)
      .reduce((acc, [date, values]) => {
        acc[date] = values;
        return acc;
      }, {});

    const plants = [
      "GSBP",
      "Hospital Universitario Reina Sofía",
      "Musée Mohammed VI d'art moderne et contemporain",
    ];
    const labels = Object.keys(currentWeekData);
    const datasets = plants.map((plant) => {
      const currentWeekValues = labels.map((date) => currentWeekData[date][plant] || 0);
      const previousWeekValues = labels.map((date) => previousWeekData[date]?.[plant] || 0);

      const comparisonValues = currentWeekValues.map((current, index) => {
        const previous = previousWeekValues[index];
        return previous ? ((current - previous) / previous) * 100 : 0; // Percentage difference
      });

      return {
        label: `${plant} Weekly Change`,
        data: comparisonValues,
        borderColor: plantColors[plant],
        fill: true,
        backgroundColor: `${plantColors[plant]}33`, // 33 adds a transparency to the color
        tension: 0.3, // Smooth line
      };
    });

    setComparisonData({
      labels,
      datasets,
    });
  };

  useEffect(() => {
    fetchWeeklyComparison();
  }, []);

  return (
    <Grid item xs={12} md={6}>
      <Card>
        <MDBox p={3}>
          <h3>Weekly Energy Comparison (7 Days)</h3>
          {comparisonData ? (
            <Line
              data={comparisonData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Percentage Change in Energy Production",
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Date",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Percentage Change (%)",
                    },
                  },
                },
              }}
            />
          ) : (
            <p>Loading comparison data...</p>
          )}
        </MDBox>
      </Card>
    </Grid>
  );
};

export default WeeklyComparisonChart;
