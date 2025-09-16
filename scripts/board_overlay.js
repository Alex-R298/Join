/**
 * Opens the overlay for adding a new task.
 * @param {string} [status="toDo"] - Default status for the new task.
 * @returns {Promise<void>}
 */
async function showAddTaskOverlay(status = 'toDo') {
    if (window.matchMedia("(max-width: 800px)").matches) {
        window.location.href = 'add_task.html';
        return; 
    }
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
 * Renders the avatar of a user in a task editor with a maximum of 3 avatars.
 * @param {string} email - User's email address.
 * @param {string} taskId - Task identifier.
 */
function renderAssignedUserData(email, taskId) {
    if (typeof email !== 'string' || !email) return "";
    
    const { initials, color } = renderAssignedUser(email);
    const container = document.getElementById(`editor-${taskId}`);
    
    if (!container) return;
    
    const existingAvatars = container.querySelectorAll('.editor-avatar:not(.more-users)');
    const moreUsersElement = container.querySelector('.more-users');
    
    if (existingAvatars.length < 3) {
        container.insertAdjacentHTML('beforeend', 
            `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`
        );
    } else {
        if (moreUsersElement) {
            const currentCount = parseInt(moreUsersElement.textContent.replace('+', '')) || 1;
            moreUsersElement.textContent = `+${currentCount + 1}`;
        } else {
            container.insertAdjacentHTML('beforeend', 
                `<div class="editor-avatar more-users" style="background-color:#666">+1</div>`
            );
        }
    }
}

/**
 * Renders all assigned users for a task with avatar limit.
 * @param {Array} assignedUsers - Array of user emails.
 * @param {string} taskId - Task identifier.
 */
function renderAllAssignedUsers(assignedUsers, taskId) {
    const container = document.getElementById(`editor-${taskId}`);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!assignedUsers || assignedUsers.length === 0) return;
    
    const displayUsers = assignedUsers.slice(0, 3);
    const remainingCount = assignedUsers.length - 3;

    displayUsers.forEach(email => {
        if (typeof email !== 'string' || !email) return;
        
        const { initials, color } = renderAssignedUser(email);
        container.innerHTML += `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`;
    });
    
    if (remainingCount > 0) {
        container.innerHTML += `<div class="editor-avatar more-users" style="background-color:#666">+${remainingCount}</div>`;
    }
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
 * Toggles the completion status of a subtask and saves the change.
 * @param {string} taskId - Task identifier.
 * @param {number} subtaskIndex - Index of the subtask to toggle.
 * @returns {Promise<void>}
 */
async function toggleSubtask(taskId, subtaskIndex) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    if (typeof task.subtaskElements[0] === 'string') {
        task.subtaskElements = task.subtaskElements.map(text => ({
            text: text,
            completed: false
        }));
    }
    task.subtaskElements[subtaskIndex].completed = !task.subtaskElements[subtaskIndex].completed;
    await saveTaskToFirebase(task);
    const progressData = calculateSubtaskProgress(task);
    const progressBar = document.querySelector(`[id="task-${task.id}"] .progress`);
    const progressText = document.querySelector(`[id="task-${task.id}"] .subtasks`);
    if (progressBar && progressText) {
        progressBar.style.transition = 'width 0.3s ease';
        progressBar.style.width = `${progressData.progressPercent}%`;
        progressText.textContent = progressData.progressText;
    }
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

