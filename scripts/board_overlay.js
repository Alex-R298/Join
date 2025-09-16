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
 * Ruft Initialen und Farbe eines Benutzers ab.
 * @param {string} email - E-Mail des Benutzers.
 * @returns {{initials: string, color: string}} Initialen und Farbe.
 */
function getAssignedUserData(email) {
  if (typeof email !== 'string' || !email) return { initials: '', color: '#666' };
  return renderAssignedUser(email);
}


/**
 * Fügt ein Avatar-Element in den Container ein.
 * @param {HTMLElement} container - Container für die Avatare.
 * @param {string} initials - Initialen des Benutzers.
 * @param {string} color - Hintergrundfarbe.
 */
function addAvatar(container, initials, color) {
  container.insertAdjacentHTML('beforeend', 
    `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`
  );
}


/**
 * Fügt oder aktualisiert das "+x"-Avatar im Container.
 * @param {HTMLElement} container - Container für die Avatare.
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
 * Rendert die Avatare eines Benutzers im Task-Editor,
 * maximal 3 Avatare plus "+x" für weitere Nutzer.
 * @param {string} email - E-Mail des Benutzers.
 * @param {string} taskId - ID der Aufgabe.
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
 * Rendert ein einzelnes Avatar-Element in einen Container.
 * @param {HTMLElement} container - Container für die Avatare.
 * @param {string} initials - Initialen des Benutzers.
 * @param {string} color - Hintergrundfarbe des Avatars.
 */
function renderAvatar(container, initials, color) {
  container.insertAdjacentHTML('beforeend', 
    `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`
  );
}


/**
 * Rendert das "+x"-Avatar für weitere Benutzer.
 * @param {HTMLElement} container - Container für die Avatare.
 * @param {number} count - Anzahl zusätzlicher Benutzer.
 */
function renderMoreAvatar(container, count) {
  container.insertAdjacentHTML('beforeend', 
    `<div class="editor-avatar more-users" style="background-color:#666">+${count}</div>`
  );
}


/**
 * Rendert die Avatare mehrerer Benutzer in einem Task-Editor,
 * maximal 3 Avatare plus "+x" für die restlichen.
 * @param {Array<string>} assignedUsers - Array der Benutzer-E-Mails.
 * @param {string} taskId - ID der Aufgabe.
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
 * Wandelt Text-Subtasks in Objekte um, falls noch Strings vorhanden sind.
 * @param {Array} subtasks - Array der Subtasks.
 * @returns {Array} Array von Subtask-Objekten.
 */
function initializeSubtasks(subtasks) {
  if (typeof subtasks[0] === 'string') {
    return subtasks.map(text => ({ text, completed: false }));
  }
  return subtasks;
}


/**
 * Toggelt den abgeschlossenen Status einer Subtask.
 * @param {Array} subtasks - Array der Subtask-Objekte.
 * @param {number} index - Index der Subtask zum toggeln.
 */
function toggleSubtaskCompletion(subtasks, index) {
  if (!subtasks[index]) return;
  subtasks[index].completed = !subtasks[index].completed;
}


/**
 * Aktualisiert den Fortschrittsbalken und Text im UI.
 * @param {string} taskId - ID der Aufgabe.
 * @param {Object} progressData - Fortschrittsinformationen.
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
 * Toggles den Completion-Status einer Subtask, speichert die Änderung
 * und aktualisiert den Fortschritt im UI.
 * @param {string} taskId - ID der Aufgabe.
 * @param {number} subtaskIndex - Index der Subtask.
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

