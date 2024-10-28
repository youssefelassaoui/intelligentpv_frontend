const axios = require("axios");

exports.handler = async (event) => {
  const { path, queryStringParameters } = event;
  console.log("Request Path:", path); // Logs the full path
  console.log("Query Parameters:", queryStringParameters); // Logs query params

  try {
    const response = await axios.get(`http://gsbp.ddns.net:8081${path}`, {
      params: queryStringParameters,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Error in Netlify function:", error.message);
    return { statusCode: error.response?.status || 500, body: error.toString() };
  }
};
