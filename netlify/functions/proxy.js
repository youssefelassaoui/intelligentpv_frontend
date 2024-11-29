const axios = require("axios");

exports.handler = async (event) => {
  const path = event.path.replace("http://localhost:8081", ""); // Adjust path for backend

  try {
    // Build request config
    const config = {
      method: event.httpMethod,
      url: `http://gsbp.ddns.net:8081${path}`, // Backend base URL
      headers: {
        ...event.headers,
        "Content-Type": "application/json",
      },
      data: event.body,
    };

    // Add query parameters only if they are present
    if (Object.keys(event.queryStringParameters || {}).length > 0) {
      config.params = event.queryStringParameters;
    }

    const response = await axios(config);

    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Error in Netlify function:", error.toString());
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};
