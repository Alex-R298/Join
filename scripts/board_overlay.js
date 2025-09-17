/**
 * Opens the overlay for adding a new task.
 * @param {string} [status="toDo"] - Default status for the new task.
 * @returns {Promise<void>}
 */
async function showAddTaskOverlay(status = 'toDo') {
    if (window.matchMedia("(max-width: 800px)").matches) {
        window.location.href = 'add_task.html';
        return; }
    currentTaskStatus = status;
    const overlay = document.getElementById("add-task-overlay");
    const container = document.getElementById("add-task-container");
    overlay.classList.remove("d-none");
    document.body.style.overflow = "hidden";
    document.getElementById("btn-overlay-close").classList.remove("d-none");
    container.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("click", closeAddTaskOverlay);
    setTimeout(() => {
        overlay.classList.add("visible");
    }, 10);
}


/**
 * Closes the add task overlay with animation and resets form state.
 * Clears inputs and validation states before hiding the overlay.
 */
function closeAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const container = document.getElementById("add-task-container");
  container.classList.add("closing");
  overlay.classList.remove("visible");
  clearInputs();
  resetValidationState();
  setTimeout(() => {
    overlay.classList.add("d-none");
    document.body.style.overflow = "auto";
    container.classList.remove("closing");
  }, 500);
} 


/**
 * Opens the overlay displaying detailed information about a specific task.
 * @param {string} taskId - The unique identifier of the task.
 */
function openTaskOverlay(taskId) {
    const overlay = document.getElementById("detailed-task-overlay");
    const container = document.getElementById("task-detail-container");
    const task = allTasks.find((t) => t.id === taskId);
    document.body.style.overflow = 'hidden';
    if (!task) return;
    overlay.classList.remove("d-none");
    container.innerHTML = taskDetailOverlayTemplate(task);
    document.body.classList.add("no-markers");  
    container.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("click", closeTaskOverlay);
    setTimeout(() => {
        overlay.classList.add("visible");
    }, 10);
}


/**
 * Closes the task detail overlay.
 */
function closeTaskOverlay() {
    const overlay = document.getElementById("detailed-task-overlay");
    const container = document.getElementById("task-detail-container");
    container.classList.add("closing");
    overlay.classList.remove("visible");
    setTimeout(() => {
        overlay.classList.add("d-none");
        document.body.style.overflow = "auto";
        document.body.classList.remove("no-markers");
        container.classList.remove("closing");
    }, 500);
}


/**
 * Returns text and icon data for a given priority level.
 * @param {string} priority - Priority level: "urgent", "medium", or "low".
 * @returns {{text: string, icon: string}} Object containing priority text and icon path.
 */
function getPriorityData(priority) {
  if (!priority) return { text: "", icon: "" };
  const colors = {
    urgent: "red",
    medium: "orange",
    low: "green",
  };
  const text = priority.charAt(0).toUpperCase() + priority.slice(1);
  const icon = `./assets/icons/prio_${priority}_${colors[priority]}.svg`;

  return { text, icon };
}


/**
 * Formats a date string from ISO format (yyyy-mm-dd) to dd/mm/yyyy format.
 * @param {string} dateStr - ISO date string.
 * @returns {string} Formatted date string or empty string if input is invalid.
 */
function formatDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}


/**
* Retrieves a user's initials and color.
* @param {string} email - User's email.
* @returns {{initials: string, color: string}} Initials and color.
*/
function getAssignedUserData(email) {
  if (typeof email !== 'string' || !email) return { initials: '', color: '#666' };
  return renderAssignedUser(email);
}


/**
* Inserts an avatar element into the container.
* @param {HTMLElement} container - Container for the avatars.
* @param {string} initials - User's initials.
* @param {string} color - Background color.
*/
function addAvatar(container, initials, color) {
  container.insertAdjacentHTML('beforeend', 
    `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`
  );
}


/**
* Adds or updates the "+x" avatar in the container.
* @param {HTMLElement} container - Container for the avatars.
*/
function addOrUpdateMoreAvatar(container) {
  const more = container.querySelector('.more-users');
  if (more) {
    const count = parseInt(more.textContent.replace('+', '')) || 1;
    more.textContent = `+${count + 1}`;
  } else {
    container.insertAdjacentHTML('beforeend', 
      `<div class="editor-avatar more-users" style="background-color:#666">+1</div>`
    );
  }
}


/**
* Renders a user's avatars in the task editor.
* A maximum of 3 avatars plus "+x" for additional users.
* @param {string} email - User's email address.
* @param {string} taskId - Task ID.
*/
function renderAssignedUserData(email, taskId) {
  const { initials, color } = getAssignedUserData(email);
  const container = document.getElementById(`editor-${taskId}`);
  if (!container) return;

  const avatars = container.querySelectorAll('.editor-avatar:not(.more-users)');
  if (avatars.length < 3) addAvatar(container, initials, color);
  else addOrUpdateMoreAvatar(container);
}


/**
* Renders a single avatar element into a container.
* @param {HTMLElement} container - Container for the avatars.
* @param {string} initials - User's initials.
* @param {string} color - Background color of the avatar.
*/
function renderAvatar(container, initials, color) {
  container.insertAdjacentHTML('beforeend', 
    `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`
  );
}


/**
* Renders the "+x" avatar for additional users.
* @param {HTMLElement} container - Container for the avatars.
* @param {number} count - Number of additional users.
*/
function renderMoreAvatar(container, count) {
  container.insertAdjacentHTML('beforeend', 
    `<div class="editor-avatar more-users" style="background-color:#666">+${count}</div>`
  );
}


/**
* Renders the avatars of multiple users in a task editor,
* a maximum of 3 avatars plus "+x" for the remaining ones.
* @param {Array<string>} assignedUsers - Array of user emails.
* @param {string} taskId - ID of the task.
*/
function renderAllAssignedUsers(assignedUsers, taskId) {
  const container = document.getElementById(`editor-${taskId}`);
  if (!container) return;
  container.innerHTML = '';
  if (!assignedUsers || assignedUsers.length === 0) return;

  const displayUsers = assignedUsers.slice(0, 3);
  displayUsers.forEach(email => {
    if (typeof email !== 'string' || !email) return;
    const { initials, color } = renderAssignedUser(email);
    renderAvatar(container, initials, color);
  });

  const remainingCount = assignedUsers.length - 3;
  if (remainingCount > 0) renderMoreAvatar(container, remainingCount);
}


/**
 * Creates avatar data (initials, color, name) for a user based on their email.
 * @param {string} email - User's email address.
 * @returns {{initials: string, color: string, name: string}} Avatar data object.
 */
function renderAssignedUser(email) {
    if (typeof email !== 'string' || !email) {
        console.warn('Invalid or missing email:', email);
        return { initials: '??', color: '#ccc', name: 'Unknown' };
    }
    
    const userName = contactsMap[email] ? contactsMap[email].name : email.split('@')[0];
    const name = getName(userName);
    const initials = getInitials(name);
    const color = getAvatarColor(name);
    
    return { initials, color, name };
}


/**
 * Normalizes subtask elements of a task to ensure consistent structure.
 * @param {Array} subtaskElements - Raw subtask data.
 * @returns {Array} Normalized subtasks with text and completed properties.
 */
function normalizeSubtasks(subtaskElements) {
  if (!Array.isArray(subtaskElements)) return subtaskElements;
  if (typeof subtaskElements[0] === "string") {
    return subtaskElements.map(text => ({
      text,
      completed: false,
    }));
  }
  return subtaskElements;
}


/**
* Converts text subtasks to objects if strings still exist.
* @param {Array} subtasks - Array of subtasks.
* @returns {Array} Array of subtask objects.
*/
function initializeSubtasks(subtasks) {
  if (typeof subtasks[0] === 'string') {
    return subtasks.map(text => ({ text, completed: false }));
  }
  return subtasks;
}


/**
* Toggles the completed status of a subtask.
* @param {array} subtasks - Array of subtask objects.
* @param {number} index - Index of the subtask to toggle.
*/
function toggleSubtaskCompletion(subtasks, index) {
  if (!subtasks[index]) return;
  subtasks[index].completed = !subtasks[index].completed;
}


/**
* Updates the progress bar and text in the UI.
* @param {string} taskId - ID of the task.
* @param {Object} progressData - Progress information.
*/
function updateProgressUI(taskId, progressData) {
  const progressBar = document.querySelector(`[id="task-${taskId}"] .progress`);
  const progressText = document.querySelector(`[id="task-${taskId}"] .subtasks`);
  if (!progressBar || !progressText) return;

  progressBar.style.transition = 'width 0.3s ease';
  progressBar.style.width = `${progressData.progressPercent}%`;
  progressText.textContent = progressData.progressText;
}


/**
* Toggles the completion status of a subtask, saves the change
*, and updates the progress in the UI.
* @param {string} taskId - ID of the task.
* @param {number} subtaskIndex - Index of the subtask.
* @returns {Promise<void>}
*/
async function toggleSubtask(taskId, subtaskIndex) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;

  task.subtaskElements = initializeSubtasks(task.subtaskElements);
  toggleSubtaskCompletion(task.subtaskElements, subtaskIndex);

  await saveTaskToFirebase(task);

  const progressData = calculateSubtaskProgress(task);
  updateProgressUI(task.id, progressData);
}


/**
 * Updates the progress for all provided tasks.
 * @param {Object[]} tasks - List of tasks to update progress for.
 */
function updateProgressForTasks(tasks) {
  tasks.forEach(task => updateTaskProgress(task));
}


/**
 * Updates the progress (bar and text) for a single task.
 * @param {Object} task - A task object containing subtask information.
 */
function updateTaskProgress(task) {
  const progressData = calculateSubtaskProgress(task);
  const taskElement = document.querySelector(`[id="task-${task.id}"]`);
  if (!taskElement) return;
  const progressBar = taskElement.querySelector('.progress');
  const progressText = taskElement.querySelector('.subtasks');
  if (progressBar && progressText) {
    progressBar.style.width = `${progressData.progressPercent}%`;
    progressText.textContent = progressData.progressText;
  }
}