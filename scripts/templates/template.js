
function getHeaderTemplate() {
    const userName = sessionStorage.getItem('userName') || 'Guest';
    const initials = getInitials(userName);
    const isHelpPage = window.location.pathname.endsWith("help.html");
    return `
        <header>
            <img class="join_logo_dark_header" src="./assets/icons/capa_dark.svg" alt="dark icon">
            <p class="header_title_p_tag">Kanban Project Management Tool</p>
            <div class="header-icons">
                <a id="help-link" class="help-icon ${isHelpPage ? 'd-none' : ''}" href="help.html"></a>
                <div class="name-icon" onclick="user_button_show_links()">
                    <p>${initials}</p>
                </div>
                <div class="popup-header">
                    <span class="popuptext" id="myPopup">
                        <a href="help.html">Help</a>
                        <a href="legal_notice.html">Legal Notice</a>
                        <a href="privacy_policy.html">Privacy Policy</a>
                        <a href="#" onclick="logOut();">Log out</a>
                    </span>
                </div>
            </div>
        </header>
    `;
}

function getSidebarTemplate() {
    return `
        <div class="sidebar">
            <div class="side-bar-logo">
                <img class="side_bar_img" src="./assets/icons/capa_white.svg" alt="">
            </div>
            <div class="sidebar-menu">
                <a href="index.html"><img src="./assets/icons/summary.svg" alt="">Summary</a>
                <a href="add_task.html"><img src="./assets/icons/add.svg" alt="">Add Task</a>
                <a href="board.html"><img src="./assets/icons/board.svg" alt="">Board</a>
                <a href="contacts.html"><img src="./assets/icons/contacts.svg" alt="">Contacts</a>
            </div>
            <div class="sidebar_footer">
                <a href="privacy_policy.html">Privacy Policy</a>
                <a href="legal_notice.html">Legal notice</a>
            </div>
        </div>
    `;
}

function createLetterDivider(letter) {
    return `<div class="letter-divider">${letter}</div>`;
}


function createContactCard(contact) {
    const avatarColor = getAvatarColor(contact.name);
    const initials = getInitials(contact.name);
    
    return `
    <div class="contact-card" onclick="showContactDetails('${contact.id}', '${contact.name}', '${contact.email}', '${contact.phone || ""}', '${initials}', '${avatarColor}')" data-contact-id="${contact.id}">
        <div class="contact-avatar" style="background-color: ${avatarColor};">${initials}</div>
        <div class="contact-info-container">
            <div class="contact-name">${contact.name}</div>
            <div class="contact-email">${contact.email}</div>
        </div>
    </div>`;
}


function generateContactDetailsHTML(contactId, name, email, phone, initials, avatarColor) {
    return `
        <div class="contact-details">
            <div class="contact-details-top">
                <div class="contact-details-avatar" style="background-color: ${avatarColor};">${initials}</div>
                <div class="contact-details-info">
                    <div class="contact-details-name">${name}</div>
                    <div class="contact-details-buttons">
                        <button onclick="editContact('${contactId}', '${name}', '${email}', '${phone}', '${initials}', '${avatarColor}')" class="button-details" type="button">
                            <img src="./assets/icons/edit.svg" alt=""> Edit
                        </button>
                        <button onclick="deleteContact('${contactId}')" class="button-details" type="button">
                            <img src="./assets/icons/delete.svg" alt=""> Delete
                        </button>
                    </div>
                </div>
            </div>
            <div class="contact-details-bottom">
                <p class="contact-details-description">Contact Information</p>
                <div class="contact-details-section">
                    <div class="contact-details-heading">Email</div>
                    <div class="contact-details-value" style="color: #007CEE">
                        <a href="mailto:${email}">${email}</a>
                    </div>
                </div>
                <div class="contact-details-section">
                    <div class="contact-details-heading">Phone</div>
            <a href="tel:${phone || "Not specified"}" class="contact-details-value">${phone || "Not specified"}</a>
                </div>
            </div>
        </div>
    `;
}


function displayContactDetails(contactId, contact, initials = null, avatarColor = null, animate = true) {
        initials = getInitials(contact.name);
        avatarColor = getAvatarColor(contact.name);
        const animationClass = animate ? 'animate' : 'no-animation';
    const detailsHTML = `
        <div class="contact-details ${animationClass}">
            <div class="contact-details-top">
                <div class="contact-details-avatar" style="background-color: ${avatarColor};">${initials}</div>
                <div class="contact-details-info">
                    <div class="contact-details-name">${contact.name}</div>
                    <div class="contact-details-buttons">
                        <button onclick="editContact('${contactId}', '${
      contact.name
    }', '${contact.email}', '${
      contact.phone || ""
    }', '${initials}', '${avatarColor}')" class="button-details edit-icon" type="button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_354206_5438" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                            <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_354206_5438)">
                            <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#2A3647"/>
                            </g>
                            </svg> Edit
                        </button>
                        <button onclick="deleteContact('${contactId}')" class="button-details delete-icon" type="button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_354206_5432" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                            <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_354206_5432)">
                            <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                            </g>
                            </svg> Delete
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="contact-details-bottom">
                <p class="contact-details-description">Contact Information</p>
                <div class="contact-details-section">
                    <div class="contact-details-heading">Email</div>
                        <a href="mailto:${contact.email}" class="contact-details-value " style="color: #007CEE">${contact.email}</a>
                </div>
                
                <div class="contact-details-section">
                    <div class="contact-details-heading">Phone</div>
                    <a href="tel:${contact.phone || "Not specified"}" class="contact-details-value">${contact.phone || "Not specified"}</a>
                </div>
            </div>
        </div>
    `;
    const contactsMetrics = document.getElementById('contacts-container-details');
    contactsMetrics.innerHTML = detailsHTML;
    
}



function getAddContactTemplate() {
    return `
        <div class="add-contact-popup">
    <button class="add-contact-close" onclick="closeAddContact()">
        <img src="./assets/icons/close.svg" alt="">
    </button>
    <div class="add-contact-header">
        <img src="./assets/icons/capa_white.svg" alt="">
        <h1>Add Contact</h1>
        <p>Tasks are better with a team!</p>
        <div class="vlcontact"></div>
    </div>
    <div class="add-contact-body">
        <div class="add-contact-avatar">
            <img src="./assets/icons/person_white.svg" alt="">
        </div>
        <div class="inputs">
            <div class="input-with-icon">
                <input class="input-contact" id="contact-name" placeholder="Name">
                <img src="./assets/icons/person.svg" alt="">
            </div>
            <div class="input-with-icon">
                <input class="input-contact" id="contact-email" placeholder="Email">
                <img src="./assets/icons/mail.svg" alt="">
            </div>
            <div class="input-with-icon">
                <input class="input-contact" id="contact-phone" placeholder="Phone">
                <img src="./assets/icons/call.svg" alt="">
            </div>
        </div>
        <div class="add-contact-buttons">
            <button class="button-secondary cancel-btn" onclick="closeAddContact()">Cancel <img src="./assets/icons/close.svg" alt=""></button>
            <button class="button-primary" onclick="createdContact()">Create contact <img class="check-icon" src="./assets/icons/check_white.svg" alt=""></button>
        </div>
    </div>
</div>
    `;
}


function editContactTemplate(contactId = '', name = '', email = '', phone = '', initials = '', avatarColor = '') {
    return `
        <div class="add-contact-popup">
            <button class="add-contact-close" onclick="closeAddContact()">
                <img src="./assets/icons/close.svg" alt="">
            </button>
            <div class="add-contact-header">
                <img src="./assets/icons/capa_white.svg" alt="">
                <h1>Edit contact</h1>
                <div class="vlcontact"></div>
            </div>
            <div class="add-contact-body">
                <div class="add-contact-avatar" style="${avatarColor ? `background-color: ${avatarColor};` : ''}">
                    ${initials ? initials : '<img src="./assets/icons/person_white.svg" alt="">'}
                </div>
                <div class="inputs">
                    <div class="input-with-icon">
                        <input class="input-contact" id="contact-name" placeholder="Name" value="${name}">
                        <img src="./assets/icons/person.svg" alt="">
                    </div>
                    <div class="input-with-icon">
                        <input class="input-contact" id="contact-email" placeholder="Email" value="${email}">
                        <img src="./assets/icons/mail.svg" alt="">
                    </div>
                    <div class="input-with-icon">
                        <input class="input-contact" id="contact-phone" placeholder="Phone" value="${phone}">
                        <img src="./assets/icons/call.svg" alt="">
                    </div>
                </div>
                <div class="add-contact-buttons">
                    <button class="button-secondary" onclick="deleteContact('${contactId}')">Delete</button>
                    <button class="button-primary" onclick="updateContact('${contactId}')" class="check-icon">Save <img src="./assets/icons/check_white.svg" alt=""></button>
                </div>
            </div>
        </div>
    `;
}

function createdContactTemplate() {
    return `
        <div class="created-contact-popup">
            <p>Contact successfully created</p>
        </div>
    `;
}

function signedUpTemplate() {
    return `
        <div class="signed-up-popup">
            <p>Your Signed Up successfully</p>
        </div>
    `;
}

function getAddPageTemplate(task, usersArray = []) {
    const assignedUsers = task.assignedTo ? (Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo]) : [];
    return `
    <div class="add-task-header">
        <h1>Add Task</h1>
        <button id="btn-overlay-close" class="d-none btn-overlay-close" onclick="closeAddTaskOverlay()"><img src="./assets/icons/close.svg"></button>
    </div>
<div class="main-content-row">

  <div class="inputs-left">
    <div class="task-inputs">
      <div class="input-with-label">
        <label for="title">Title<span style="color: #FF8190;">*</span></label>
        <input class="input" type="text" id="title" name="title" required placeholder="Enter a title">
        <span id="title-error-message" class="input-invalid d-none">This field is required</span>
      </div>
      <div class="input-with-label description-input pb-16">
        <label for="task_description">Description</label>
        <textarea id="task_description" placeholder="Enter a Description"></textarea>
      </div>
      <div class="input-with-label">
        <label for="datepicker">Due date<span style="color: #FF8190;">*</span></label>
        <input class="input" type="date" id="datepicker" name="datepicker" required placeholder="dd/mm/yyyy">
        <span id="date-error-message" class="input-invalid d-none">This field is required</span>
      </div>
    </div>
  </div>

  <div class="vl-add-task"></div>

  <div class="inputs-right">
    <div class="task-inputs">

      <div class="input-with-label">
        <span style="margin-bottom: 8px;">Priority</span>
        <div class="priority-inputs-container">
            <button class="priority-btn" data-priority="urgent" onclick="selectPriority(this)">
            Urgent
            <img src="./assets/icons/prio_urgent_red.svg" alt="">
            </button>
            <button class="priority-btn active" data-priority="medium" onclick="selectPriority(this)">
                Medium
                <img src="./assets/icons/prio_medium_white.svg" alt="">
            </button>

          <button class="priority-btn" data-priority="low" onclick="selectPriority(this)">
            Low
            <img src="./assets/icons/prio_low_green.svg" alt="">
          </button>
        </div>
      </div>
  
      <div class="input-with-label">
        <label for="assignee-input">Assigned to</label>
        <div class="assigned-dropdown">
            <input class="input input-assignees dropdown-input" 
                   type="text" 
                   id="assignee-input" 
                   placeholder="Select contacts to assign" 
                   onclick="toggleAssigneeDropdown()"
                   oninput="filterAssignees(this.value)">
            <img src="./assets/icons/arrow_drop_downarea.svg" class="dropdown-arrow" onclick="toggleAssigneeDropdown()">
            
            <div id="assignee-dropdown" class="user-dropdown d-none">
                ${usersArray
                  .map(
                    (user) => `
                    <div class="assigned-user-item" data-name="${user.name.toLowerCase()}" onclick="toggleUserSelection('${user.email}')">
                        <div class="user-info">
                            <div class="contact-avatar" style="background-color:${getAvatarColor(
                              user.name
                            )}">${getInitials(user.name)}</div>
                            <span>${user.name}</span>
                        </div>
                        <div class="custom-checkbox">
                            <input type="checkbox"
                                   id="user-${user.email}"
                                   value="${user.email}"
                                   onchange="updateAssigneeAvatars()"
                                   ${
                                     assignedUsers.includes(user.email)
                                       ? "checked"
                                       : ""
                                   }>
                            <label for="user-${
                              user.email
                            }" class="checkbox-label">
                                <span class="checkbox-custom"></span>
                            </label>
                        </div>
                    </div> `
                  )
                  .join("")}
            </div>
        </div>
      </div>
              <div id="assigned-avatars" class="assigned-avatars">
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

            <div class="input-with-label">
              <span style="margin-bottom: 8px;">Category<span style="color: #FF8190;">*</span></span>
              <div class="custom-category-select">
                <div class="category-select-header input" onclick="toggleCategoryDropdown()">
                  <span id="selected-category-placeholder">Select task category</span>
                <img src="./assets/icons/arrow_drop_downarea.svg" class="dropdown-arrow">
                <input type="hidden" id="category_task">
                <div id="category-dropdown" class="user-dropdown d-none">
                <div class="category-option" onclick="selectCategory('user-story', event)">User Story</div>
                <div class="category-option" onclick="selectCategory('technical-task', event)">Technical Task</div>
              
                </div>
              </div>
              </div>
              <span id="category-error-message" class="input-invalid d-none">This field is required</span>
              </div>

      <div class="input-with-label">
        <label for="subtask_input">Subtasks</label>
        <div class="input-with-button">
          <input oninput="changeButtons()" class="input-btn" type="text" id="subtask_input" placeholder="Add new subtask">
        <div class="subtask-buttons">
        <button id="addButton" onclick="addSubtask()" class="subtask-add-button"></button>
        <button id="clearButton" onclick="clearInput()" style="display: none;" class="subtask-button">
        <img src="./assets/icons/cancel.svg" alt="cancel">
        </button>
        <div id="pipe" style="display: none;" class="vl-small"></div>
        <button id="acceptButton" onclick="addSubtask()" style="display: none;" class="subtask-button">
        <img src="./assets/icons/check_subtask.svg" alt="check">
        </button>
        </div>
        </div>
        <div id="myList" class="subtasks-list">
        </div>
      </div>

    </div>
  </div>
</div>
<div class="create-btns">
  <p class="short-info"><span style="color: #FF8190;">*</span>This field is required</p>
  <div class="add-task-buttons">
    <button class="button-secondary" onclick="clearInputs()">Clear</button>
    <button class="button-primary"  onclick="handleAddTask()">Create Task</button>
  </div>
</div>
    `;
}

function createListItemTemplate(value) {
  return `
    <li class="subtask-listelement" onclick="handleSubtaskClick(event, this)">
    <span class="subtask-text list">${value}</span>
    <div class="subtask-edit-btns d-none">
        <button class="icon-btn edit-btn">
        <img src="./assets/icons/edit.svg" alt="Edit">
        </button>
        <div class="vl-small"></div>
        <button class="icon-btn delete-btn" onclick="deleteSubtask(this); event.stopPropagation();">
        <img src="./assets/icons/delete.svg" alt="Delete">
        </button>
    </div>
</li>
  `;
}
