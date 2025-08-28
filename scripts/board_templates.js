function taskOnBoardTemplate(task) {
  const title = task.title || 'Untitled';
  const description = task.description || 'No description';
  const priority = task.priority || 'medium';
  const badgeCategory = task.originalCategory || task.category;
  const badge = getBadgeData({ ...task, category: badgeCategory });
  const { icon: priorityIcon } = getPriorityData(priority);
  return `
    <div 
      id="task-${task.id}" 
      class="task-container" 
      draggable="true" 
      ondragstart="startDragging('${task.id}', event)" 
      ondragend="cancelDragging()"
      onclick="openTaskOverlay('${task.id}')">
      <div class="badge ${badge.className}">${badge.text}</div>
      <div class="task-infos">
        <p class="task-title">${title}</p>
        <p class="task-description">${description}</p>
      </div>
      <div class="task-progress">
        <div class="progress-bar" style="width: 0%"></div>
        <p class="subtasks">0/2 Subtasks</p>
      </div>
      <div class="task-footer">
        <div id="editor-${task.id}" class="task-editors"></div>
        <div class="task-priority-icon"><img src="${priorityIcon}" alt="Priority"></div>
      </div>
    </div>
  `;
}

function taskDetailOverlayTemplate(task) {
  const badgeCategory = task.originalCategory || task.category;
  const badge = getBadgeData({ ...task, category: badgeCategory });
  const { text: priorityText, icon: priorityIcon } = getPriorityData(
    task.priority
  );
  const dueDate = formatDate(task.dueDate);
  const assignedUser = renderAssignedUser(task.assignedTo);

  return `
        <div class="add-task-header">
            <div class="badge ${badge.className}">${badge.text}</div>
            <button id="btn-overlay-close" class="btn-overlay-close" onclick="closeTaskOverlay()"><img src="./assets/icons/close.svg"></button>
        </div>
        <h1>${task.title}</h1>
        <p>${task.description}</p>
        <div class="task-required-infos">
            <div class="detail-row">
                <span class="label">Due Date:</span>
                <span class="value">${formatDate(task.dueDate)}</span>
            </div>
            <div class="detail-row">
                <span class="label">Priority:</span>
                <span class="value">${priorityText}
            <img src="${priorityIcon}" alt="${priorityText}" class="prio-icon" /></span>
            </div>
        </div>
            <div class="assigned-to-container">
                <span class="label">Assigned To:</span>
                <div class="assigned-user">
                        <div class="contact-avatar" style="background-color:${
                          assignedUser.color
                        }">${assignedUser.initials}</div>
                        <span class="assigned-name">${assignedUser.name}</span>
                </div>
            </div>
            <div class="subtasks-container">
                <span class="label">Subtasks</span>
                <div class="subtasks">
                </div>
            </div>
        </div>
    </div>
    `;
}