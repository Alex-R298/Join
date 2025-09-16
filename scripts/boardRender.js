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