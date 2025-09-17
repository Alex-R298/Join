/**
 * Renders the tasks as a DocumentFragment.
 * @param {Object[]} tasks - Array of task objects.
 * @returns {DocumentFragment} Fragment with all task elements.
 */
function renderTasksFragment(tasks) {
  const frag = document.createDocumentFragment();
  tasks.forEach((task) => {
    frag.appendChild(createFragmentFromHTML(taskOnBoardTemplate(task)));
  });
  updateSubtaskScroll();
  return frag;
}


/**
* Renders the avatars for all tasks in the container.
* @param {Object[]} tasks - Array of task objects.
*/
function renderAssignedUsersForTasks(tasks) {
  tasks.forEach((task) => {
    if (Array.isArray(task.assignedTo)) {
      task.assignedTo.forEach((email) =>
        renderAssignedUserData(email, task.id)
      );
    }
  });
}


/**
* Renders a container with tasks or an empty placeholder.
* @param {HTMLElement} container - Column container.
* @param {Object[]} tasksForContainer - Tasks for this container.
* @param {string} containerId - ID of the container.
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
 * Renders tasks directly into a container (with placeholder support).
 * @param {HTMLElement} container - Container element to render tasks into.
 * @param {Object[]} tasks - List of tasks to render.
 */
function renderTasksInContainer(container, tasks) {
  const placeholder = container.querySelector(".drag-placeholder");
  container.innerHTML = "";
  tasks.forEach((task) => {
    container.insertAdjacentHTML("beforeend", taskOnBoardTemplate(task));
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
 * Re-renders all tasks and updates counters.
 * @returns {Promise<void>}
 */
async function renderTasks() {
  try {
    const tasks = await loadTasks();
    allTasks = tasks;
    updateHTML();
    if (typeof updateDashboardCounts === "function") {
      updateDashboardCounts();
    }
  } catch (error) {}
}