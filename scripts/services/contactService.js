/**
 * General API function for Firebase requests
 * @param {string} endpoint - API endpoint (e.g. "/user", "/user/contactId")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} data - Data for POST/PUT requests
 * @returns {Promise} Promise with response data
 */
async function apiRequest(endpoint, method = "GET", data = null) {
  const config = {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data &&
      ["POST", "PUT"].includes(method) && { body: JSON.stringify(data) }),
  };

  const response = await fetch(BASE_URL + endpoint + ".json", config);
  if (!response.ok) throw new Error(`API Request failed: ${response.status}`);
  return response.json();
}


/**
 * Loads all contacts from Firebase
 * @returns {Promise<Object>} Contact data
 */
async function loadContacts() {
    return await apiRequest("/user");
}


/**
 * Loads a specific contact from Firebase
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Contact data
 */
async function loadContact(contactId) {
    return await apiRequest(`/user/${contactId}`);
}


/**
 * Creates a new contact in Firebase
 * @param {Object} contactData - Contact data
 * @returns {Promise<Object>} Response with new contact ID
 */
async function createContact(contactData) {
    return await apiRequest("/user", "POST", contactData);
}


/**
 * Updates an existing contact in Firebase
 * @param {string} contactId - Contact ID
 * @param {Object} contactData - Updated contact data
 * @returns {Promise<Object>} Response data
 */
async function updateContactData(contactId, contactData) {
    return await apiRequest(`/user/${contactId}`, "PUT", contactData);
}


/**
 * Deletes a contact from Firebase
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Response data
 */
async function removeContact(contactId) {
    return await apiRequest(`/user/${contactId}`, "DELETE");
}