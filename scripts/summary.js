/**
 * Updates the dashboard counters based on Firebase data
 */
function updateDashboardCounts() {
  if (!document.querySelector('.summary-info h2')) return;
  
  const todoCount = allTasks.filter(task => task.status === 'toDo').length;
  const inProgressCount = allTasks.filter(task => task.status === 'inProgress').length;
  const awaitFeedbackCount = allTasks.filter(task => task.status === 'awaitFeedback').length;
  const doneCount = allTasks.filter(task => task.status === 'done').length;

  const urgentTasks = allTasks.filter(task => task.priority === 'urgent');
  const urgentCount = urgentTasks.length;
  
  const earliestDate = findEarliestDueDate(urgentTasks);
  const totalCount = allTasks.length;
  updateDashboardElements(todoCount, inProgressCount, awaitFeedbackCount, doneCount, urgentCount, earliestDate, totalCount);
}


/**
 * Finds the earliest due date from a list of tasks
 * @param {Array} tasks - Array of task objects
 * @returns {string|null} Earliest date or null
 */
function findEarliestDueDate(tasks) {
  if (tasks.length === 0) return null;
  
  tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  return tasks[0].dueDate;
}


/**
 * Updates dashboard elements with calculated values
 * @param {number} todoCount - Number of todo tasks
 * @param {number} inProgressCount - Number of in progress tasks
 * @param {number} awaitFeedbackCount - Number of await feedback tasks
 * @param {number} doneCount - Number of completed tasks
 * @param {number} urgentCount - Number of urgent tasks
 * @param {string|null} earliestDate - Earliest due date
 * @param {number} totalCount - Total number of tasks
 */
function updateDashboardElements(todoCount, inProgressCount, awaitFeedbackCount, doneCount, urgentCount, earliestDate, totalCount) {
  document.querySelectorAll('.summary-info h2')[0].textContent = todoCount;
  document.querySelectorAll('.summary-info h2')[1].textContent = doneCount;
  document.querySelectorAll('.summary-info h2')[2].textContent = urgentCount;
  
  document.querySelectorAll('.summary.tasks h2')[0].textContent = totalCount;
  document.querySelectorAll('.summary.tasks h2')[1].textContent = inProgressCount;
  document.querySelectorAll('.summary.tasks h2')[2].textContent = awaitFeedbackCount;
  
  updateDateElement(earliestDate);
}


/**
 * Updates the date element in the dashboard
 * @param {string|null} earliestDate - Earliest due date
 */
function updateDateElement(earliestDate) {
  const dateElement = document.querySelector('.row-2 .summary div:last-child h3');
  if (!dateElement) return;
  
  dateElement.innerHTML = '';
  
  if (earliestDate) {
    const formattedDate = formatDate(earliestDate);
    dateElement.textContent = formattedDate;
  } else {
    dateElement.textContent = 'No date';
  }
  dateElement.className = 'date-text';
}


/**
 * Formats a date for display
 * @param {string} dateString - Date as string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}



/**
 * Loads all tasks from Firebase and updates allTasks array
 */
async function loadTasksFromFirebase() {
  const data = await getTaskData();
  
  if (data) {
    allTasks = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  } else {
    allTasks = [];
  }
  
  updateDashboardCounts();
}


/**
 * Saves task status to Firebase
 * @param {string} taskId - Task ID
 * @param {string} newStatus - New status
 */
async function saveTaskStatusToFirebase(taskId, newStatus) {
  await fetch(`${BASE_URL}/tasks/${taskId}/status.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newStatus)
  });
  
  const task = allTasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
  }
  
  updateDashboardCounts();
}

/**
 * Initializes the dashboard with Firebase data
 */
async function initializeDashboard() {
  await loadTasksFromFirebase();
  updateDashboardCounts();
}