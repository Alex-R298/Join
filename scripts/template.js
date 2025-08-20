
function getHeaderTemplate() {
    return `
        <header>
            <p>Kanban Project Management Tool</p>
            <div class="header-icons">
                <div class="help-icon">?</div>
                <div class="name-icon" onclick="user_button_show_links()">
                    <p>SW</p>
                </div>
                <div class="popup">
                    <span class="popuptext" id="myPopup">
                        <a href="help.html">Help</a>
                        <a href="legal_notice.html">Legal Notice</a>
                        <a href="privacy_policy.html">Privacy Policy</a>
                        <a href="log_in.html">Log out</a>
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
                    <div class="contact-details-value" style="color: #007CEE ">${email}</div>
                </div>
                <div class="contact-details-section">
                    <div class="contact-details-heading">Phone</div>
                    <div class="contact-details-value">
                        ${phone || "Not specified"}
                    </div>
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
                        <button onclick="editContact('${contactId}', '${contact.name}', '${contact.email}', '${contact.phone || ""}', '${initials}', '${avatarColor}')" class="button-details" type="button">
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
                    <div class="contact-details-value" style="color: #007CEE ">${contact.email}</div>
                </div>
                
                <div class="contact-details-section">
                    <div class="contact-details-heading">Phone</div>
                    <div class="contact-details-value">
                        ${contact.phone || "Not specified"}
                    </div>
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
                <input class="input" id="contact-name" placeholder="Name">
                <img src="./assets/icons/person.svg" alt="">
            </div>
            <div class="input-with-icon">
                <input class="input" id="contact-email" placeholder="Email">
                <img src="./assets/icons/mail.svg" alt="">
            </div>
            <div class="input-with-icon">
                <input class="input" id="contact-phone" placeholder="Phone">
                <img src="./assets/icons/call.svg" alt="">
            </div>
        </div>
        <div class="add-contact-buttons">
            <button class="button-secondary" onclick="closeAddContact()">Cancel <img src="./assets/icons/close.svg" alt=""></button>
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
                        <input class="input" id="contact-name" placeholder="Name" value="${name}">
                        <img src="./assets/icons/person.svg" alt="">
                    </div>
                    <div class="input-with-icon">
                        <input class="input" id="contact-email" placeholder="Email" value="${email}">
                        <img src="./assets/icons/mail.svg" alt="">
                    </div>
                    <div class="input-with-icon">
                        <input class="input" id="contact-phone" placeholder="Phone" value="${phone}">
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

function getAddPageTemplate(){
    return `
    <div class="add-task-header">
        <h1>Add Task</h1>
        <button id="btn-overlay-close" class="d-none btn-overlay-close" onclick="closeAddTaskOverlay()"><img src="./assets/icons/close.svg"></button>
    </div>
<div class="main_content_row">

  <div class="inputs-left">
    <div class="task-inputs">
      <div class="input-with-label">
        <label for="name">Title<span style="color: #FF8190;">*</span></label>
        <input class="input" type="text" id="title" name="title" required placeholder="Enter a title">
        <span class="input-invalid">This field is required</span>
      </div>
      <div class="input-with-label description-input pb-16">
        <label for="name">Description</label>
        <textarea id="task_description" placeholder="Enter a Description"></textarea>
      </div>
      <div class="input-with-label">
        <label for="name">Due date<span style="color: #FF8190;">*</span></label>
        <input class="input" type="date" id="datepicker" name="datepicker" required placeholder="dd/mm/yyyy">
        <span class="input-invalid">This field is required</span>
      </div>
    </div>
  </div>

  <div class="vl-add-task"></div>

  <div class="inputs-right">
    <div class="task-inputs">

      <div class="input-with-label">
        <label for="priority">Priority</label>
        <div class="priority-inputs-container">
          <button class="priority-btn" data-priority="urgent" onclick="selectPriority(this)">
            Urgent
            <img src="./assets/icons/prio_urgent_red.svg" alt="">
          </button>
          <button class="priority-btn active priority-medium" data-priority="medium" onclick="selectPriority(this)">
            Medium
            <img src="./assets/icons/prio_medium_white.svg" alt="">
          </button>
          <button class="priority-btn" data-priority="low" onclick="selectPriority(this)">
            Low
            <img src="./assets/icons/prio_low_green.svg" alt="">
          </button>
        </div>
      </div>

      <div class="input-with-label pb-8">
        <label for="assigned_task">Assigned to</label>
        <select class="minimal" id="assigned_task" placeholder="Select contacts to assign">
          <option value="user1">User 1</option>
          <option value="user2">User 2</option>
          <option value="user3">User 3</option>
        </select>
      </div>

      <div class="input-with-label">
        <label for="category_task">Category<span style="color: #FF8190;">*</span></label>
        <select class="minimal" id="category_task" required placeholder="Select task category">
          <option value="development">Development</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
        </select>
        <span class="input-invalid">This field is required</span>
      </div>
      <div class="input-with-label">
        <label for="subtask_input">Subtasks</label>
        <div class="input-with-button">
          <input class="input-btn" type="text" id="subtask_input" placeholder="Add new subtask">
          <button>+</button>
        </div>
      </div>
    </div>

  </div>
</div>

<!--Buttons-->
<div class="create-btns">
  <p class="short-info"><span style="color: #FF8190;">*</span>This field is required</p>
  <div class="add-task-buttons">
    <button class="button-secondary" onclick="clearInputs()">Clear</button>
    <button class="button-primary" onclick="addTask()">Create Task</button>
  </div>
</div>
    `;
}