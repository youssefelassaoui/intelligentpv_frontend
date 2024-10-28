import axios from "axios";
import Cookies from "js-cookie"; // Assuming you're using js-cookie for handling cookies

export const fetchProductionEnergyData = async (startDate, endDate) => {
  try {
    const token = Cookies.get("authToken");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await axios.get("http://gspb.ddns.net:8081/api/plants", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const rawData = response.data;

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {};
    }

    // Process the data to group by date and plant name
    const processedData = {};

    rawData.forEach((item) => {
      const date = item.key?.datetime?.split("T")[0]; // Extract the date
      const plantName = item.plantName;
      const dayEnergy = item.dayEnergy || 0; // Ensure valid number for dayEnergy

      if (date && plantName) {
        // Initialize date object if not present
        if (!processedData[date]) {
          processedData[date] = {
            "Hospital Universitario Reina Sofía": 0,
            GSBP: 0,
            "Musée Mohammed VI d art moderne et contemporain": 0,
          };
        }

        // Accumulate dayEnergy for each plant
        processedData[date][plantName] += dayEnergy;
      }
    });

    return processedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
};
