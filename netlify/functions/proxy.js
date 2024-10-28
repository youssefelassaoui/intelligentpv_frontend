const axios = require('axios');

exports.handler = async (event) => {
    const path = event.path.replace('/.netlify/functions/proxy', ''); // Adjust the path
    try {
        const response = await axios({
            method: event.httpMethod,
            url: `http://gsbp.ddns.net:8081${path}`, // Your backend HTTP URL
            headers: { 
                ...event.headers, 
                'Content-Type': 'application/json' 
            },
            data: event.body,
        });
        return {
            statusCode: response.status,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        return { 
            statusCode: error.response ? error.response.status : 500, 
            body: JSON.stringify({ error: error.toString() }) 
        };
    }
};
