let allTasks = [];
let contactsMap = {};


/**
 * Initializes live search for boards and responds to input events.
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
 * Filters all tasks by a search term and updates the board.
 * @param {string} query - The search term.
 * @returns {Promise<void>}
 */
async function filterTasks(query) {
  const filteredTasks = getFilteredTasks(query);
  updateHTML(filteredTasks);
  updateProgressForTasks(filteredTasks);
}


/**
 * Returns filtered tasks based on title matching the search term.
 * @param {string} query - The search term.
 * @returns {Object[]} Filtered tasks array.
 */
function getFilteredTasks(query) {
  const q = query.toLowerCase();
  return allTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q)
  );
}


/**
 * Resets the status of all tasks based on stored data.
 * @returns {Promise<void>}
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
 * Clears all container columns (toDo, inProgress, awaitFeedback, done).
 */
function clearAllContainers() {
    const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    });
}


/**
 * Renders all tasks into their respective columns.
 * @param {Object[]} [tasks=allTasks] - List of tasks to render. Defaults to all tasks.
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
 * Returns all tasks for a specific column/container.
 * @param {Object[]} tasks - All available tasks.
 * @param {string} containerId - ID of the container/column.
 * @returns {Object[]} Filtered tasks for the specified container.
 */
function getTasksForContainer(tasks, containerId) {
  return tasks.filter(t => t.status === containerId);
}


/**
 * Leert den Container und fügt ggf. einen leeren Platzhalter hinzu.
 * @param {HTMLElement} container - Spalten-Container.
 * @param {string} containerId - ID des Containers.
 * @param {boolean} isEmpty - Ob der Container keine Tasks hat.
 */
function clearAndAddPlaceholder(container, containerId, isEmpty) {
  const placeholder = container.querySelector('.drag-placeholder');
  container.innerHTML = '';
  if (isEmpty) container.appendChild(createEmptyNode(containerId));
  return placeholder;
}


/**
 * Rendert die Tasks als DocumentFragment.
 * @param {Object[]} tasks - Array von Task-Objekten.
 * @returns {DocumentFragment} Fragment mit allen Task-Elementen.
 */
function renderTasksFragment(tasks) {
  const frag = document.createDocumentFragment();
  tasks.forEach(task => {
    frag.appendChild(createFragmentFromHTML(taskOnBoardTemplate(task)));
  });
  updateSubtaskScroll();
  return frag;
}


/**
 * Rendert die Avatare für alle Tasks im Container.
 * @param {Object[]} tasks - Array von Task-Objekten.
 */
function renderAssignedUsersForTasks(tasks) {
  tasks.forEach(task => {
    if (Array.isArray(task.assignedTo)) {
      task.assignedTo.forEach(email => renderAssignedUserData(email, task.id));
    }
  });
}


/**
 * Rendert einen Container mit Tasks oder einem leeren Platzhalter.
 * @param {HTMLElement} container - Spalten-Container.
 * @param {Object[]} tasksForContainer - Tasks für diesen Container.
 * @param {string} containerId - ID des Containers.
 */
function renderContainer(container, tasksForContainer, containerId) {
  const isEmpty = !tasksForContainer.length;
  const placeholder = clearAndAddPlaceholder(container, containerId, isEmpty);

  if (!isEmpty) {
    const frag = renderTasksFragment(tasksForContainer);
    container.appendChild(frag);
    renderAssignedUsersForTasks(tasksForContainer);
  }

  if (placeholder) container.appendChild(placeholder);
}

/**
 * Passt die maximale Höhe des Subtask-Containers an,
 * sodass bei mehr als 3 Subtasks nur 3 sichtbar sind und der Rest scrollbar wird.
 * @param {string} taskId - ID der Aufgabe, deren Subtasks angepasst werden.
 */
function updateSubtaskScroll(taskId) {
  const container = document.getElementById(`subtasks-${taskId}`);
  if (!container) return;

  const items = container.querySelectorAll("li");
  if (items.length === 0) {
    container.style.maxHeight = "auto";
    return;
  }

  const subtaskHeight = items[0].offsetHeight;
  const maxVisible = 3;
  container.style.maxHeight = items.length > maxVisible
    ? `${subtaskHeight * maxVisible}px`
    : "auto";
}


/**
 * Creates a DOM element for an empty container.
 * @param {string} containerId - ID of the column/container.
 * @returns {HTMLElement} DOM element representing the empty state.
 */
function createEmptyNode(containerId) {
  const wrap = document.createElement('div');
  wrap.className = 'empty-container';
  wrap.innerHTML = `<p class="empty-container-text">${getEmptyText(containerId)}</p>`;
  return wrap;
}


/**
 * Converts an HTML string into a DOM fragment.
 * @param {string} html - HTML string to convert.
 * @returns {DocumentFragment} DOM fragment created from the HTML string.
 */
function createFragmentFromHTML(html) {
  // Safe way to convert HTML string to DOM nodes
  const range = document.createRange();
  return range.createContextualFragment(html);
}


/**
 * Returns the appropriate text for empty containers based on their type.
 * @param {string} containerId - ID of the column/container.
 * @returns {string} Display text for the empty container.
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
 * Renders tasks directly into a container (with placeholder support).
 * @param {HTMLElement} container - Container element to render tasks into.
 * @param {Object[]} tasks - List of tasks to render.
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
 * Converts an HTML string into a DOM element.
 * @param {string} html - HTML string to parse.
 * @returns {Element} First child element from the parsed HTML.
 */
function parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}


/**
 * Updates all containers to show empty states or removes placeholders as needed.
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
 * Updates a single container based on task status.
 * @param {string} status - Task status (e.g., "toDo", "inProgress").
 */
function updateContainer(status) {
  const container = document.getElementById(status);
  if (!container) return;
  container.innerHTML = "";
  const tasksInStatus = allTasks.filter(t => t.status === status);
  tasksInStatus.forEach(todo => {container.innerHTML += taskOnBoardTemplate(todo);});
}


/**
 * Loads all users from the database.
 * @returns {Promise<Object[]>} Array of user objects with names.
 */
async function loadUsers() {
    const res = await fetch(BASE_URL + "/user.json");
    const data = await res.json();
    return Object.values(data).filter((user) => user.name);
}


/**
 * Loads all tasks from the database.
 * @returns {Promise<Object[]>} Array of normalized tasks.
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
 * Normalizes a collection of task data from raw database format.
 * @param {Object} data - Raw task data from database.
 * @returns {Object[]} Array of normalized task objects.
 */
function normalizeTasks(data) {
  return Object.entries(data)
    .filter(([, task]) => task.category)
    .map(([id, task]) => normalizeTask(id, task));
}


/**
 * Normalizes a single task object to ensure consistent structure.
 * @param {string} id - Task identifier.
 * @param {Object} task - Raw task data.
 * @returns {Object} Normalized task object with consistent properties.
 */
function normalizeTask(id, task) {
  const status = task.status || "toDo";
  const subtaskElements = normalizeSubtasks(task.subtaskElements);
  return { id, ...task, status, subtaskElements };
}


/**
 * Prepares category data including display text and CSS classes.
 * @param {Object} task - Task object containing category information.
 * @param {string} status - Task status for additional styling.
 * @returns {{text: string, className: string, status: string, statusClass: string}} Category data with styling information.
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
 * Re-renders all tasks and updates counters.
 * @returns {Promise<void>}
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
    // Error handling could be added here
  }
}


/**
 * Loads contacts and builds an email-to-user mapping.
 * @returns {Promise<void>}
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
 * Formats a username by replacing dots/underscores with spaces and capitalizing words.
 * @param {string} userName - Raw username string.
 * @returns {string} Formatted and capitalized username.
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
 * Calculates the progress of subtasks for a given task.
 * @param {Object} task - Task object containing subtask information.
 * @returns {{progressPercent: number, progressText: string, progressClass: string}} Progress data including percentage, display text, and CSS class.
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


/**
 * Handles screen size changes and redirects overlay to separate page on mobile.
 * Automatically closes task overlay and redirects to add_task.html on mobile screens.
 */
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