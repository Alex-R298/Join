let allTasks = [];
let contactsMap = {};


/**
 * Initialisiert die Live-Suche für Boards und reagiert auf Eingaben.
 */
function liveSearchBoards() {
    let input = document.getElementById('searchInputBoards');

    input.addEventListener('input', async () => {
        const query = input.value.trim().toLowerCase();
        if (query.length < 2) {
            await loadTasks();
            updateHTML();
        } else {
            await filterTasks(query);
        }
    });
}


/**
 * Filtert alle Tasks nach einem Suchbegriff und aktualisiert das Board.
 * @param {string} query - Der Suchbegriff.
 */
async function filterTasks(query) {
  const filteredTasks = getFilteredTasks(query);
  updateHTML(filteredTasks);
  updateProgressForTasks(filteredTasks);
}


/**
 * Gibt die gefilterten Tasks anhand des Titels zurück.
 * @param {string} query - Der Suchbegriff.
 * @returns {Object[]} Gefilterte Tasks.
 */
function getFilteredTasks(query) {
  const q = query.toLowerCase();
  return allTasks.filter(task => task.title.toLowerCase().includes(q));
}


/**
 * Aktualisiert den Fortschritt für alle übergebenen Tasks.
 * @param {Object[]} tasks - Liste der Tasks.
 */
function updateProgressForTasks(tasks) {
  tasks.forEach(task => updateTaskProgress(task));
}


/**
 * Aktualisiert den Fortschritt (Balken & Text) für einen einzelnen Task.
 * @param {Object} task - Ein Task-Objekt.
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


/**
 * Setzt den Status aller Tasks anhand der gespeicherten Daten zurück.
 */
async function resetTaskStatus() {
  try {
    const data = await getTaskData();
    if (!data) return;
    allTasks = allTasks.map(task => {
      if (data[task.id]) return {...task, status: data[task.id].status};
      return task;
    });
    updateHTML();
  } catch (error) {
    console.error("Could not reset status: ", error);
  }
}



/**
 * Leert alle Container-Spalten (toDo, inProgress, awaitFeedback, done).
 */
function clearAllContainers() {
    const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    });
}


/**
 * Rendert alle Tasks in die Spalten.
 * @param {Object[]} [tasks=allTasks] - Liste der Tasks.
 */
function updateHTML(tasks = allTasks) {
  const columns = ["toDo", "inProgress", "awaitFeedback", "done"];
  for (const containerId of columns) {
    const container = document.getElementById(containerId);
    if (!container) continue;
    const tasksForContainer = getTasksForContainer(tasks, containerId);
    renderContainer(container, tasksForContainer, containerId);
  }
}


/**
 * Gibt alle Tasks für eine bestimmte Spalte zurück.
 * @param {Object[]} tasks - Alle Tasks.
 * @param {string} containerId - ID des Containers.
 * @returns {Object[]} Gefilterte Tasks.
 */
function getTasksForContainer(tasks, containerId) {
  return tasks.filter(t => t.status === containerId);
}


/**
 * Rendert einen Container mit Tasks oder leerem Platzhalter.
 * @param {HTMLElement} container - Der Spalten-Container.
 * @param {Object[]} tasksForContainer - Tasks für diesen Container.
 * @param {string} containerId - Container-ID.
 */
function renderContainer(container, tasksForContainer, containerId) {
  const placeholder = container.querySelector('.drag-placeholder');
  container.innerHTML = '';
  if (!tasksForContainer.length) {
    container.appendChild(createEmptyNode(containerId));
  } else {
    const frag = document.createDocumentFragment();
    tasksForContainer.forEach(task => {
      frag.appendChild(createFragmentFromHTML(taskOnBoardTemplate(task)));
    });
    container.appendChild(frag);
    tasksForContainer.forEach(task => {
      if (Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach(email => renderAssignedUserData(email, task.id));
      }
    });
  }
  if (placeholder) container.appendChild(placeholder);
}


/**
 * Erstellt ein DOM-Element für einen leeren Container.
 * @param {string} containerId - ID der Spalte.
 * @returns {HTMLElement} DOM-Element.
 */
function createEmptyNode(containerId) {
  const wrap = document.createElement('div');
  wrap.className = 'empty-container';
  wrap.innerHTML = `<p class="empty-container-text">${getEmptyText(containerId)}</p>`;
  return wrap;
}


/**
 * Wandelt HTML-String in ein DOM-Fragment um.
 * @param {string} html - HTML-String.
 * @returns {DocumentFragment} DOM-Fragment.
 */
function createFragmentFromHTML(html) {
  // sicherer Weg, HTML-String in DOM-Knoten zu verwandeln
  const range = document.createRange();
  return range.createContextualFragment(html);
}


/**
 * Liefert den passenden Text für leere Container.
 * @param {string} containerId - ID der Spalte.
 * @returns {string} Text.
 */
function getEmptyText(containerId) {
    const texts = {
        'toDo': 'No Tasks To Do',
        'inProgress': 'No Tasks In Progress',
        'awaitFeedback': 'No Tasks Await Feedback',
        'done': 'No Tasks Done'
    };
    return texts[containerId] || `No Tasks ${containerId}`;
}


/**
 * Rendert Tasks direkt in einen Container (mit Platzhalter).
 * @param {HTMLElement} container - Container-Element.
 * @param {Object[]} tasks - Liste der Tasks.
 */
function renderTasksInContainer(container, tasks) {
    const placeholder = container.querySelector('.drag-placeholder');
    container.innerHTML = '';
    tasks.forEach(task => {
        container.insertAdjacentHTML('beforeend', taskOnBoardTemplate(task));
        if (task.assignedTo) {
            const editorContainer = document.getElementById(`editor-${task.id}`);
            if (editorContainer) {
                editorContainer.innerHTML = "";
                renderAssignedUserData(task.assignedTo, task.id);
            }
        }
    });
    if (placeholder) container.appendChild(placeholder);
}


/**
 * Wandelt einen HTML-String in ein DOM-Element um.
 * @param {string} html - HTML-String.
 * @returns {Element} Erstes Kind-Element.
 */
function parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}


/**
 * Aktualisiert alle Container auf leere Zustände oder entfernt Platzhalter.
 */
function updateEmptyContainers() {
    ["toDo", "inProgress", "awaitFeedback", "done"].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const hasTasks = container.querySelector('.task-container');
        const emptyContainer = container.querySelector('.empty-container');
        if (!hasTasks && !emptyContainer) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-container';
            emptyDiv.innerHTML = `<p class="empty-container-text">${getEmptyText(containerId)}</p>`;
            container.appendChild(emptyDiv);
        } else if (!hasTasks && emptyContainer) {
            emptyContainer.style.display = 'flex';
        } else if (hasTasks && emptyContainer) {
            emptyContainer.remove();
        }
    });
}


/**
 * Aktualisiert einen einzelnen Container basierend auf Status.
 * @param {string} status - Task-Status (z.B. "toDo").
 */
function updateContainer(status) {
  const container = document.getElementById(status);
  if (!container) return;
  container.innerHTML = "";
  const tasksInStatus = allTasks.filter(t => t.status === status);
  tasksInStatus.forEach(todo => {container.innerHTML += taskOnBoardTemplate(todo);});
}


/**
 * Aktualisiert einen einzelnen Container basierend auf Status.
 * @param {string} status - Task-Status (z.B. "toDo").
 */
async function loadUsers() {
    const res = await fetch(BASE_URL + "/user.json");
    const data = await res.json();
    return Object.values(data).filter((user) => user.name);
}


/**
 * Lädt alle Tasks aus der Datenbank.
 * @returns {Promise<Object[]>} Normalisierte Tasks.
 */
async function loadTasks() {
  try {
    const data = await getTaskData();
    if (!data) return [];
    return normalizeTasks(data);
  } catch (error) {
    return [];
  }
}


/**
 * Normalisiert eine Menge Task-Daten.
 * @param {Object} data - Raw-Daten.
 * @returns {Object[]} Normalisierte Tasks.
 */
function normalizeTasks(data) {
  return Object.entries(data)
    .filter(([, task]) => task.category)
    .map(([id, task]) => normalizeTask(id, task));
}


/**
 * Normalisiert einen einzelnen Task.
 * @param {string} id - Task-ID.
 * @param {Object} task - Task-Daten.
 * @returns {Object} Normalisierter Task.
 */
function normalizeTask(id, task) {
  const status = task.status || "toDo";
  const subtaskElements = normalizeSubtasks(task.subtaskElements);
  return { id, ...task, status, subtaskElements };
}


/**
 * Bereitet Kategoriedaten (Text & CSS-Klassen) auf.
 * @param {Object} task - Task-Objekt.
 * @param {string} status - Status.
 * @returns {Object} Kategoriedaten.
 */
function getCategoryData(task, status) {
  const category = task.category || "no-category";
  const taskStatus = status || task.status || "todo";
  const text = category
    .replace(/-/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const className = category.toLowerCase().replace(/\s+/g, "-");
  const statusClass = taskStatus.toLowerCase().replace(/\s+/g, "-");
  return { text, className, status: taskStatus, statusClass
  };
}


/**
 * Rendert alle Tasks neu und aktualisiert die Zähler.
 */
async function renderTasks() {
  try {
    const tasks = await loadTasks();
    allTasks = tasks;
    updateHTML();
    if (typeof updateDashboardCounts === 'function') {
      updateDashboardCounts();
    }
  } catch (error) {
  }
}


/**
 * Lädt Kontakte und baut eine E-Mail-zu-User-Map.
 */
async function loadContacts() {
  const res = await fetch(BASE_URL + "/user.json");
  const data = await res.json();
  contactsMap = Object.values(data || {}).reduce((acc, contact) => {
    acc[contact.email] = contact;
    return acc;
  }, {});
}


/**
 * Formatiert einen Usernamen (Punkte/Unterstriche zu Leerzeichen, Capitalize).
 * @param {string} userName - Roh-Name.
 * @returns {string} Formatierter Name.
 */
function getName(userName) {
  if (!userName) return "";
  const cleaned = userName.replace(/[._]/g, " ");
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


/**
 * Berechnet den Fortschritt von Subtasks eines Tasks.
 * @param {Object} task - Task-Objekt.
 * @returns {Object} Fortschrittsdaten (Prozent, Text, CSS-Klasse).
 */
function calculateSubtaskProgress(task) {
  const subtasks = task.subtaskElements || task.subTasks;
  if (!subtasks || subtasks.length === 0) {
    return {progressPercent: 0, progressText: "No Subtasks", progressClass: "d-none"};
  }
  const total = subtasks.length;
  const done = subtasks.filter((subtask) => subtask.completed === true).length;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;
  const progressText = `${done}/${total} Subtasks`;
  return {progressPercent, progressText, progressClass: "task-progress"};
}

document.addEventListener('DOMContentLoaded', function() {
    const mediaQuery = window.matchMedia("(max-width: 800px)");
    function handleScreenSizeChange(mq) {
        if (mq.matches) {
            const overlay = document.getElementById("add-task-overlay");
            if (overlay && !overlay.classList.contains("d-none")) {
                closeAddTaskOverlay();
                window.location.href = 'add_task.html';
              }}}
    mediaQuery.addListener(handleScreenSizeChange);
});