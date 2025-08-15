
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


function createContactCard(user) {
    const avatarColor = getAvatarColor(user.name);
    const initials = getInitials(user.name);

    return `
    <div class="contact-card" onclick="showContactDetails('${user.name}', '${user.email}', '${user.phone || ""}', '${initials}', '${avatarColor}')">
        <div class="contact-avatar" style="background-color: ${avatarColor};">${initials}</div>
        <div class="contact-info-container">
            <div class="contact-name">${user.name}</div>
            <div class="contact-email">${user.email}</div>
        </div>
    </div>`;
}



function showContactDetails(name, email, phone, initials, avatarColor) {
    const contactsMetrics = document.getElementById('contacts-container-details');
    if (!contactsMetrics) return;

    contactsMetrics.innerHTML = `
        <div class="contact-details">
            <div class="contact-details-top">
                <div class="contact-details-avatar" style="background-color: ${avatarColor};">${initials}</div>
                <div class="contact-details-info">
                    <div class="contact-details-name">${name}</div>
                    <div class="contact-details-buttons">
                        <button class="button-details" type="button"> 
                            <img src="./assets/icons/edit.svg" alt=""> Edit
                        </button>
                        <button class="button-details" type="button"> 
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
                        ${phone}
                    </div>
                </div>
            </div>
        </div>
    `;
}