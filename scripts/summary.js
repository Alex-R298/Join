// dashboard.js
function updateDashboardCounts() {
  if (!document.querySelector('.summary-info h1')) return;
  const todoCount = allTasks.filter(task => task.category === 'toDo').length;
  const inProgressCount = allTasks.filter(task => task.category === 'inProgress').length;
  const awaitFeedbackCount = allTasks.filter(task => task.category === 'awaitFeedback').length;
  const doneCount = allTasks.filter(task => task.category === 'done').length;
  const urgentCount = allTasks.filter(task => task.priority === 'urgent').length;
  const totalCount = allTasks.length;
  document.querySelectorAll('.summary-info h1')[0].textContent = todoCount;
  document.querySelectorAll('.summary-info h1')[1].textContent = doneCount;
  document.querySelectorAll('.summary-info h1')[2].textContent = urgentCount;
  document.querySelectorAll('.summary.tasks h1')[0].textContent = totalCount;
  document.querySelectorAll('.summary.tasks h1')[1].textContent = inProgressCount;
  document.querySelectorAll('.summary.tasks h1')[2].textContent = awaitFeedbackCount;
}