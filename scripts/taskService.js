async function getTaskData () {
    const response = await fetch(BASE_URL + "/task.json");
    const taskJson = await response.json();
    return taskJson; 
}