/**
 * Öffnet das Overlay zum Hinzufügen eines Tasks.
 * @param {string} [status="toDo"] - Vorgabe-Status.
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
 * Öffnet das Overlay für Details eines Tasks.
 * @param {string} taskId - ID des Tasks.
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
 * Schließt das Task-Detail-Overlay.
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
 * Liefert Text & Icon zu einer Priorität.
 * @param {string} priority - "urgent", "medium", "low".
 * @returns {Object} Daten zur Priorität.
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
 * Formatiert ein Datum (yyyy-mm-dd) zu dd/mm/yyyy.
 * @param {string} dateStr - ISO-Datum.
 * @returns {string} Formatiertes Datum.
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
 * Rendert das Avatar eines Users in einen Task-Editor.
 * @param {string} email - User-E-Mail.
 * @param {string} taskId - Task-ID.
 */
function renderAssignedUserData(email, taskId) {
    if (typeof email !== 'string' || !email) return "";

    const { initials, color } = renderAssignedUser(email);
    const container = document.getElementById(`editor-${taskId}`);

    if (!container) return;
    container.innerHTML += `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`;
}


/**
 * Erstellt Avatar-Daten (Initialen, Farbe, Name) für einen User.
 * @param {string} email - User-E-Mail.
 * @returns {Object} Avatar-Daten.
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
 * Normalisiert Subtask-Elemente eines Tasks.
 * @param {Array} subtaskElements - Rohdaten der Subtasks.
 * @returns {Array} Normalisierte Subtasks.
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
 * Kippt den Status eines Subtasks und speichert die Änderung.
 * @param {string} taskId - Task-ID.
 * @param {number} subtaskIndex - Index des Subtasks.
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
