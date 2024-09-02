import axios from "axios";

export const fetchProductionEnergyData = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/plants"); // Replace with your API endpoint
    const rawData = response.data;

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {}; // Return an empty object if no data is returned
    }

    // Process the data to group by date and plant name
    const processedData = {};

    rawData.forEach((item) => {
      const date = item.key?.datetime?.split("T")[0]; // Safely access date
      const plantName = item.plantName;
      const dayEnergy = item.dayEnergy;

      if (date && plantName) {
        // Check if date and plantName exist
        if (!processedData[date]) {
          processedData[date] = {
            "Hospital Universitario Reina Sofía": 0,
            GSBP: 0,
            "Musée Mohammed VI d'art moderne et contemporain": 0,
          };
        }

        processedData[date][plantName] += dayEnergy || 0; // Ensure dayEnergy is a valid number
      }
    });

    return processedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
};
