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
 * Clears the container and adds an empty placeholder if necessary.
 * @param {HTMLElement} container - Column container.
 * @param {string} containerId - ID of the container.
 * @param {boolean} isEmpty - Whether the container has no tasks.
 */
function clearAndAddPlaceholder(container, containerId, isEmpty) {
  const placeholder = container.querySelector('.drag-placeholder');
  container.innerHTML = '';
  if (isEmpty) container.appendChild(createEmptyNode(containerId));
  return placeholder;
}


/**
 * Adjusts the maximum height of the subtask container
 * so that only 3 subtasks are visible, with the rest scrollable.
 * @param {string} taskId - ID of the task whose subtasks are adjusted.
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
 * Creates and returns an empty container element for a given container ID.
 * @param {string} containerId - ID of the container.
 * @returns {HTMLElement} The created empty container element.
 */
function createEmptyContainer(containerId) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-container';
    emptyDiv.innerHTML = `<p class="empty-container-text">${getEmptyText(containerId)}</p>`;
    return emptyDiv;
}


/**
 * Updates a single container to show empty state or remove it as needed.
 * @param {HTMLElement} container - The container element to update.
 * @param {string} containerId - ID of the container.
 */
function updateSingleContainer(container, containerId) {
    const hasTasks = container.querySelector('.task-container');
    const emptyContainer = container.querySelector('.empty-container');

    if (!hasTasks && !emptyContainer) {
        container.appendChild(createEmptyContainer(containerId));
    } else if (!hasTasks && emptyContainer) {
        emptyContainer.style.display = 'flex';
    } else if (hasTasks && emptyContainer) {
        emptyContainer.remove();
    }
}


/**
 * Updates all task containers to show empty states or remove placeholders.
 */
function updateEmptyContainers() {
    ["toDo", "inProgress", "awaitFeedback", "done"].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) updateSingleContainer(container, containerId);
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