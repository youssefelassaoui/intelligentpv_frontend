import axios from "axios";
import Cookies from "js-cookie"; // For handling cookies

export const fetchProductionEnergyData = async () => {
  try {
    // Retrieve the JWT token from cookies
    const token = Cookies.get("authToken"); // Make sure you're using the right cookie key ('authToken')

    // Check if the token is available before making the request
    if (!token) {
      throw new Error("Authentication token not found");
    }

    // Set up the headers with the Authorization Bearer token
    const response = await axios.get("http://localhost:8080/api/plants", {
      headers: {
        Authorization: `Bearer ${token}`, // Add the token to the Authorization header
      },
    });

    const rawData = response.data;

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {}; // Return an empty object if no data is returned
    }

    // Process the data to group by date and plant name
    const processedData = {};

    rawData.forEach((item) => {
      const date = item.key?.datetime?.split("T")[0]; // Safely access date
      const plantName = item.plantName;
      const dayEnergy = item.dayEnergy || 0; // Ensure dayEnergy is a valid number

      if (date && plantName) {
        // Initialize the date if not present
        if (!processedData[date]) {
          processedData[date] = {
            "Hospital Universitario Reina Sofía": 0,
            GSBP: 0,
            "Musée Mohammed VI d'art moderne et contemporain": 0,
          };
        }

        // Sum up the dayEnergy for each plantName per date
        processedData[date][plantName] += dayEnergy;
      }
    });

    console.log("Processed Data:", processedData); // Log the processed data for debugging

    return processedData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {};
  }
};
