


function updateDashboardCounts() {
  if (!document.querySelector('.summary-info h1')) return;
  
  const todoCount = allTasks.filter(task => task.category === 'toDo').length;
  const inProgressCount = allTasks.filter(task => task.category === 'inProgress').length;
  const awaitFeedbackCount = allTasks.filter(task => task.category === 'awaitFeedback').length;
  const doneCount = allTasks.filter(task => task.category === 'done').length;
  
  const urgentTasks = allTasks.filter(task => task.priority === 'urgent');
  const urgentCount = urgentTasks.length;
  
  const earliestDate = findEarliestDueDate(urgentTasks);
  const totalCount = allTasks.length;
  
  updateDashboardElements(todoCount, inProgressCount, awaitFeedbackCount, doneCount, urgentCount, earliestDate, totalCount);
}

function findEarliestDueDate(tasks) {
  if (tasks.length === 0) return null;
  
  tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  return tasks[0].dueDate;
}

function updateDashboardElements(todoCount, inProgressCount, awaitFeedbackCount, doneCount, urgentCount, earliestDate, totalCount) {
  document.querySelectorAll('.summary-info h1')[0].textContent = todoCount;
  document.querySelectorAll('.summary-info h1')[1].textContent = doneCount;
  document.querySelectorAll('.summary-info h1')[2].textContent = urgentCount;
  
  document.querySelectorAll('.summary.tasks h1')[0].textContent = totalCount;
  document.querySelectorAll('.summary.tasks h1')[1].textContent = inProgressCount;
  document.querySelectorAll('.summary.tasks h1')[2].textContent = awaitFeedbackCount;
  
  const dateElement = document.querySelector('.row-2 .summary div:last-child h3');
  if (dateElement) {
    dateElement.innerHTML = '';
    
    if (earliestDate) {
      const date = new Date(earliestDate);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const formattedDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      dateElement.textContent = formattedDate;
      dateElement.className = 'date-text';
    } else {
      dateElement.textContent = 'No date';
      dateElement.className = 'date-text';
    }
  }
}

