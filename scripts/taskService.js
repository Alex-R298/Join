async function getTaskData () {
    const response = await fetch(BASE_URL + "/task.json");
    const taskJson = await response.json();
    return taskJson; 
}

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


/** Fetches base data from the server */
async function fetchBase() {
  try {
    const res = await fetch(BASE_URL + ".json");
    const data = await res.json();
  } catch (err) {
    console.error("Fehler beim Laden:", err);
  }
}