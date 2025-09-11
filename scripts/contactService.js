/**
 * General API function for Firebase requests
 * @param {string} endpoint - API endpoint (e.g. "/user", "/user/contactId")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} data - Data for POST/PUT requests
 * @returns {Promise} Promise with response data
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = BASE_URL + endpoint + ".json";
    
    const config = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`API Request failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}