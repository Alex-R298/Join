/**
 * Updates task status and saves to Firebase
 * @param {string} taskId - Task ID
 * @param {string} status - New status
 */
async function updateTaskStatus(taskId, status) {
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        allTasks[taskIndex].status = status;
        await saveTaskToFirebase(allTasks[taskIndex]);
        updateHTML();
    }
}


/**
 * Updates a single task's status and order from its DOM element.
 * @param {HTMLElement} taskElement - The task DOM element.
 * @param {string} containerId - ID of the container it belongs to.
 * @param {number} index - Position of the task in the container.
 * @returns {Object|null} Updated task object or null if not found.
 */
function updateTaskFromElement(taskElement, containerId, index) {
    const taskId = taskElement.id.replace('task-', '');
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = containerId;
    task.order = index;
    return task;
}


/**
 * Collects all tasks from a single container.
 * @param {string} containerId - ID of the container (toDo, inProgress, etc.)
 * @returns {Array<Object>} Array of updated task objects from this container.
 */
function collectTasksFromContainer(containerId) {
    const container = document.getElementById(containerId);
    const taskElements = [...container.querySelectorAll('.task-container')];
    return taskElements
        .map((el, index) => updateTaskFromElement(el, containerId, index))
        .filter(Boolean);
}


/**
 * Updates the global allTasks array from the current DOM.
 */
function updateAllTasksArrayFromDOM() {
    const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
    let newAllTasks = [];
    containers.forEach(id => {
        newAllTasks = newAllTasks.concat(collectTasksFromContainer(id));
    });
    allTasks = newAllTasks;
}


/**
 * Updates all tasks from current DOM structure and persists them.
 * @returns {Promise<void>}
 */
async function updateAllTasksFromDOM() {
    updateAllTasksArrayFromDOM();
    await saveAllTasksToFirebase();
}