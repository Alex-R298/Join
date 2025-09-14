function taskOnBoardTemplate(task) {
    const title = task.title || 'Untitled';
    const description = task.description || 'No description';
    const priority = task.priority || 'medium';
    const status = task.status || 'toDo';
    const category = getCategoryData(task);
    const { icon: priorityIcon } = getPriorityData(priority);
    const { progressPercent, progressText, progressClass} = calculateSubtaskProgress(task);
    return `
    <div 
      id="task-${task.id}" 
      class="task-container" 
      draggable="true" 
      ondragstart="startDragging('${task.id}', event)" 
      ondragend="cancelDragging()"
      onclick="openTaskOverlay('${task.id}')">
      <div class="badge ${category.className}">${category.text}</div>
      <div class="task-infos">
        <p class="task-title">${title}</p>
        <p class="task-description">${description}</p>
      </div>
      <div class="${progressClass}">
        <div class="progress-bar">
          <div class="progress" style="width: ${progressPercent}%;"></div>
        </div>
        <p class="subtasks">${progressText}</p>
      </div>
      <div class="task-footer">
        <div id="editor-${task.id}" class="task-editors"></div>
        <div class="task-priority-icon"><img src="${priorityIcon}" alt="Priority"></div>
      </div>
    </div>
  `;
}

function taskDetailOverlayTemplate(task) {
    const status = task.status;
    const category = getCategoryData(task);
    const { text: priorityText, icon: priorityIcon } = getPriorityData(task.priority);
    const dueDate = formatDate(task.dueDate);
    const assignedUser = task.assignedTo || []; 

    return `
        <div class="add-task-header">
            <div class="badge ${category.className}">${category.text}</div>
            <button id="btn-overlay-close" class="btn-overlay-close" onclick="closeTaskOverlay()"><img src="./assets/icons/close.svg"></button>
        </div>
        <h1>${task.title}</h1>
        <div class="task-description-container">
            <p>${task.description}</p>
        </div>
        <div class="task-required-infos">
            <div class="detail-row">
                <span class="label">Due Date:</span>
                <span class="value">${formatDate(task.dueDate)}</span>
            </div>
            <div class="detail-row">
                <span class="label">Priority:</span>
                <span class="value">${priorityText}
                    <img src="${priorityIcon}" alt="${priorityText}" class="prio-icon" />
                </span>
            </div>
        </div>
        <div class="assigned-to-container">
            <span class="label">Assigned To:</span>
                ${
                  assignedUser.length === 0
                    ? '<span class="no-assigned">No users assigned</span>'
                    : assignedUser
                        .map((email) => {
                          const { initials, color, name } =
                            renderAssignedUser(email);
                          return `
                                      <div class="assigned-user">
                                          <div class="contact-avatar" style="background-color:${color}">${initials}</div>
                                          <span class="assigned-name">${name}</span>
                                      </div>
                                  `;
                        })
                        .join("")
                }
        </div>
        <div class="subtasks-container">
            <span class="label">Subtasks</span>
            <div class="subtasks" id="subtasks-${task.id}">
                ${renderSubtasks(task.subtaskElements, task.id)}
            </div>
        </div>
        <div class="task-details-buttons">
            <button onclick="deleteTask('${
              task.id
            }')" class="button-details res delete-icon" type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_354206_5432" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <rect width="24" height="24" fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_354206_5432)">
                <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                </g>
                </svg> Delete
            </button>
            <div class="spacer"></div>
            <button onclick="editTask('${
              task.id
            }')" class="button-details res edit-icon" type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_354206_5438" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <rect width="24" height="24" fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_354206_5438)">
                <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#2A3647"/>
                </g>
                </svg> Edit
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
                    <span class="subtask-text list">${subtask.text || subtask}</span>
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
            <label for="edit-title">Title</label>
            <input class="input" type="text" id="edit-title" value="${
              task.title
            }" required>
        </div>
        
        <div class="input-with-label">
            <label for="edit-description">Description</label>
            <textarea id="edit-description">${task.description || ""}</textarea>
        </div>
        
        <div class="input-with-label">
            <label for="edit-datepicker">Due date</label>
            <input class="input" type="date" id="edit-datepicker" value="${
              task.dueDate
            }" required>
        </div>
        
        <div class="input-with-label">
            <label for="priority-section">Priority</label>
            <div class="priority-inputs-container" id="priority-section">
                <button class="priority-btn ${
                  task.priority === "urgent" ? "active" : ""
                }" data-priority="urgent" onclick="selectPriority(this)">
                    Urgent
                    <img src="./assets/icons/prio_urgent_${
                      task.priority === "urgent" ? "white" : "red"
                    }.svg" alt="">
                </button>
                <button class="priority-btn ${
                  task.priority === "medium" ? "active" : ""
                }" data-priority="medium" onclick="selectPriority(this)">
                    Medium
                    <img src="./assets/icons/prio_medium_${
                      task.priority === "medium" ? "white" : "orange"
                    }.svg" alt="">
                </button>
                <button class="priority-btn ${
                  task.priority === "low" ? "active" : ""
                }" data-priority="low" onclick="selectPriority(this)">
                    Low
                    <img src="./assets/icons/prio_low_${
                      task.priority === "low" ? "white" : "green"
                    }.svg" alt="">
                </button>
            </div>
        </div>
        
        <div class="input-with-label">
            <label for="edit-assigned-input">Assigned to</label>
            <div class="assigned-section">
                <div class="assigned-dropdown">
                    <input class="input dropdown-input" 
                           type="text" 
                           id="edit-assigned-input" 
                           placeholder="Select contacts to assign" 
                           onclick="toggleEditUserDropdown()"
                           oninput="filterEditUsers(this.value)">
                    <img src="./assets/icons/arrow_drop_downarea.svg" class="dropdown-arrow" onclick="toggleEditUserDropdown()">
                    
                    <div id="edit-user-dropdown" class="user-dropdown" style="display: none;">
                        ${usersArray
                          .map(
                            (user) => `
                            <div class="assigned-user-item" data-name="${user.name.toLowerCase()}">
                                <div class="user-info">
                                    <div class="contact-avatar" style="background-color:${getAvatarColor(
                                      user.name
                                    )}">${getInitials(user.name)}</div>
                                    <span>${user.name}</span>
                                </div>
                                <div class="custom-checkbox">
                                    <input type="checkbox"
                                           id="edit-user-${user.email}"
                                           value="${user.email}"
                                           onchange="updateEditAssignedAvatars()"
                                           ${
                                             assignedUsers.includes(user.email)
                                               ? "checked"
                                               : ""
                                           }>
                                    <label for="edit-user-${
                                      user.email
                                    }" class="checkbox-label">
                                        <span class="checkbox-custom"></span>
                                    </label>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
                
                <div id="edit-assigned-avatars" class="assigned-avatars mt-8">
                    ${assignedUsers
                      .map((email) => {
                        const user = usersArray.find((u) => u.email === email);
                        if (user) {
                          return `<div class="contact-avatar" style="background-color:${getAvatarColor(
                            user.name
                          )}">${getInitials(user.name)}</div>`;
                        }
                        return "";
                      })
                      .join("")}
                </div>
                
                <div class="dropdown-spacer"></div>
            </div>
        </div>
        
        <div class="input-with-label">
            <label for="edit-subtask-input">Subtasks</label>
            <div class="input-with-button">
                <input oninput="changeEditButtons()" class="input-btn" type="text" id="edit-subtask-input" placeholder="Add new subtask">
                <div class="subtask-buttons">
                    <button id="editAddButton" onclick="addEditSubtask()" class="subtask-add-button"></button>
                    <button id="editClearButton" onclick="clearEditInput()" class="subtask-button d-none">
                    <img src="./assets/icons/cancel.svg" alt="cancel">
                    </button>
                    <div id="vertical-divider" class="vl-small d-none"></div>
                    <button id="editAcceptButton" onclick="addEditSubtask()" class="subtask-button d-none">
                    <img src="./assets/icons/check_subtask.svg" alt="check">
                    </button>
                </div>
            </div>
            <ul id="editMyList" class="subtasks-list">
                ${
                  task.subtaskElements
                    ? task.subtaskElements
                        .map(
                          (subtask, index) => `
                    <li class="subtask-listelement" onclick="handleSubtaskClick(event, this)">
                        <span class="subtask-text list">${
                          subtask.text || subtask
                        }</span>
                        <div class="subtask-edit-btns d-none">
                            <button class="icon-btn edit-btn" type="button" onclick="">
                                <img src="./assets/icons/edit.svg" alt="check">
                            </button>
                            <div class="vl-small"></div>
                            <button class="icon-btn delete-btn" type="button" onclick="event.stopPropagation(); deleteEditSubtask(this);">
                                <img src="./assets/icons/delete.svg" alt="Delete">
                            </button>
                        </div>
                    </li>
                `
                        )
                        .join("")
                    : ""
                }
            </ul>
        </div>
    </div>
    
    <div class="edit-task-footer">
        <button class="button-primary" onclick="saveEditedTask('${
          task.id
        }')">OK <img src="./assets/icons/check_white.svg" alt=""></button>
    </div>
    `;
}