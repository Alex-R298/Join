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
                <div class="contact-avatar" style="background-color:${assignedUser.color}">${assignedUser.initials}</div>
                <span class="assigned-name">${assignedUser.name}</span>
            </div>
        </div>
        <div class="subtasks-container">
            <span class="label">Subtasks</span>
            <div class="subtasks" id="subtasks-${task.id}">
                ${renderSubtasks(task.subtaskElements, task.id)}
            </div>
        </div>
        <div class="task-details-buttons">
            <button onclick="deleteTask('${task.id}')" class="button-details" type="button">
                <img src="./assets/icons/delete.svg" alt=""> Delete
            </button>
            <div class="spacer"></div>
            <button onclick="editTask('${task.id}')" class="button-details" type="button">
                <img src="./assets/icons/edit.svg" alt=""> Edit
            </button>
        </div>
    `;
}

function renderSubtasks(subtasks, taskId) {
    if (!subtasks || subtasks.length === 0) return '';
    
    return subtasks.map((subtask, index) => `
        <div class="subtask-item">
            <div class="custom-checkbox">
                <input type="checkbox" 
                       id="checkbox-${taskId}-${index}" 
                       onchange="toggleSubtask('${taskId}', ${index})"
                       ${subtask.completed ? 'checked' : ''}>
                <label for="checkbox-${taskId}-${index}" class="checkbox-label">
                    <span class="checkbox-custom"></span>
                    <span class="subtask-text">${subtask.text || subtask}</span>
                </label>
            </div>
        </div>
    `).join('');
}


function getEditTaskTemplate(task, usersArray = []) {
    const assignedUsers = task.assignedTo ? (Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo]) : [];
    return `
    <div class="edit-task-header">
        <button class="btn-overlay-close" onclick="closeTaskOverlay()"><img src="./assets/icons/close.svg"></button>
    </div>
    <div class="edit-task-content">
        <div class="input-with-label">
            <label for="edit-title">Title<span style="color: #FF8190;">*</span></label>
            <input class="input" type="text" id="edit-title" value="${task.title}" required>
        </div>
        
        <div class="input-with-label">
            <label for="edit-description">Description</label>
            <textarea id="edit-description">${task.description || ''}</textarea>
        </div>
        
        <div class="input-with-label">
            <label for="edit-datepicker">Due date<span style="color: #FF8190;">*</span></label>
            <input class="input" type="date" id="edit-datepicker" value="${task.dueDate}" required>
        </div>
        
        <div class="input-with-label">
            <label for="priority-section">Priority</label>
            <div class="priority-inputs-container" id="priority-section">
                <button class="priority-btn ${task.priority === 'urgent' ? 'active' : ''}" data-priority="urgent" onclick="selectPriority(this)">
                    Urgent
                    <img src="./assets/icons/prio_urgent_${task.priority === 'urgent' ? 'white' : 'red'}.svg" alt="">
                </button>
                <button class="priority-btn ${task.priority === 'medium' ? 'active' : ''}" data-priority="medium" onclick="selectPriority(this)">
                    Medium
                    <img src="./assets/icons/prio_medium_${task.priority === 'medium' ? 'white' : 'orange'}.svg" alt="">
                </button>
                <button class="priority-btn ${task.priority === 'low' ? 'active' : ''}" data-priority="low" onclick="selectPriority(this)">
                    Low
                    <img src="./assets/icons/prio_low_${task.priority === 'low' ? 'white' : 'green'}.svg" alt="">
                </button>
            </div>
        </div>
        
        <div class="input-with-label">
    <label for="assigned-input">Assigned to</label>
    <div class="assigned-section"> <!-- Neuer Wrapper -->
        <div class="assigned-dropdown">
            <input class="input dropdown-input" 
                   type="text" 
                   id="assigned-input" 
                   placeholder="Select contacts to assign" 
                   onclick="toggleUserDropdown()"
                   oninput="filterUsers(this.value)">
            <img src="./assets/icons/arrow_drop_down.svg" class="dropdown-arrow" onclick="toggleUserDropdown()">
            
            <div id="user-dropdown" class="user-dropdown d-none">
                ${usersArray.map(user => `
                    <div class="assigned-user-item" data-name="${user.name.toLowerCase()}">
                        <div class="user-info">
                            <div class="contact-avatar" style="background-color:${getAvatarColor(user.name)}">${getInitials(user.name)}</div>
                            <span>${user.name}</span>
                        </div>
                        <div class="custom-checkbox">
                            <input type="checkbox"
                                   id="user-${user.email}"
                                   value="${user.email}"
                                   onchange="updateAssignedAvatars()"
                                   ${assignedUsers.includes(user.email) ? 'checked' : ''}>
                            <label for="user-${user.email}" class="checkbox-label">
                                <span class="checkbox-custom"></span>
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div id="assigned-avatars" class="assigned-avatars">
            ${assignedUsers.map(email => {
                const user = usersArray.find(u => u.email === email);
                if (user) {
                    return `<div class="contact-avatar" style="background-color:${getAvatarColor(user.name)}">${getInitials(user.name)}</div>`;
                }
                return '';
            }).join('')}
        </div>
        
        <div class="dropdown-spacer"></div> <!-- Spacer für Dropdown -->
    </div>
</div>
        
        <div class="input-with-label">
            <label for="edit-subtask-input">Subtasks</label>
            <div class="input-with-button">
                <input oninput="changeButtons()" class="input-btn" type="text" id="subtask_input" placeholder="Add new subtask">
                <div class="subtask_buttons">
                    <button id="addButton" onclick="addSubtask()">+</button>
                    <button id="acceptButton" onclick="addSubtask()" style="display: none;">&#10003;</button>
                    <button id="clearButton" onclick="clearInput()" style="display: none;">X</button>
                </div>
            </div>
            <ul id="myList" class="subtasks-list">
                ${task.subtaskElements ? task.subtaskElements.map((subtask, index) => `
                    <li class="subtask-listelement" onclick="handleSubtaskClick(event, this)">
                        <span class="subtask-text">${subtask.text || subtask}</span>
                        <div class="subtask-edit-btns d-none">
                            <button class="icon-btn edit-btn" type="button" onclick="event.stopPropagation();">
                                <img src="./assets/icons/edit.svg" alt="Edit">
                            </button>
                            <div class="vl-small"></div>
                            <button class="icon-btn delete-btn" type="button" onclick="event.stopPropagation(); deleteSubtask(this);">
                                <img src="./assets/icons/delete.svg" alt="Delete">
                            </button>
                        </div>
                    </li>
                `).join('') : ''}
            </ul>
        </div>
    </div>
    
    <div class="edit-task-footer">
        <button class="button-primary" onclick="saveEditedTask('${task.id}')">OK</button>
    </div>
    `;
}