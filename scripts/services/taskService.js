/**
 * Fetches all tasks from the Firebase database.
 * Retrieves the raw task data object where each key is a task ID.
 *
 * @async
 * @function getTaskData
 * @returns {Promise<Object|null>} A promise that resolves to the tasks object,
 * or null if no tasks exist.
 */
async function getTaskData() {
  const response = await fetch(BASE_URL + "/task.json");
  const taskJson = await response.json();
  return taskJson;
}


/**
 * Saves a new task to the Firebase database.
 * Firebase generates a unique ID, which is returned along with the task data.
 * 
 * @async
 * @function postTaskData
 * @param {Object} task - The task object to save.
 * @returns {Promise<Object>} A promise that resolves to the saved task object
 * with the generated Firebase ID included as `id`.
 */
async function postTaskData(task) {
  const response = await fetch(BASE_URL + "/task.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  const result = await response.json();
  return { ...task, id: result.name };
}


/**
 * Saves a task to the Firebase database.
 * Sends the task data as JSON to the Firebase endpoint.
 */
async function saveTaskToFirebase(task) {
  const response = await fetch(`${BASE_URL}/task/${task.id}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return response.ok;
}


/** Deletes a task from the database and refreshes the display. */
async function deleteTaskService(taskId) {
  const response = await fetch(`${BASE_URL}/task/${taskId}.json`, {
    method: "DELETE",
  });
  return response;
}