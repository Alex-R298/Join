/**
 * Toggles contact dropdown menu
 */
function toggleContact() {
    const buttonDropMenu = document.getElementById("button-drop-menu");
    const buttonDrop = document.querySelector(".button-drop");
    
    buttonDrop.classList.add("button-hidden");
    buttonDropMenu.classList.remove("d-none");
    setupDropdownContent(buttonDropMenu);
    showDropdownMenu(buttonDropMenu);
}


/**
 * Sets up dropdown menu content
 * @param {HTMLElement} buttonDropMenu - Dropdown menu element
 */
function setupDropdownContent(buttonDropMenu) {
    buttonDropMenu.innerHTML = getDropMenuTemplate(
        currentSelectedContact.id,
        currentSelectedContact.name,
        currentSelectedContact.email,
        currentSelectedContact.phone,
        currentSelectedContact.initials,
        currentSelectedContact.avatarColor
    );
    buttonDropMenu.style.display = "flex";
    buttonDropMenu.style.justifyContent = "flex-end";
}


/**
 * Shows dropdown menu with animation
 * @param {HTMLElement} buttonDropMenu - Dropdown menu element
 */
function showDropdownMenu(buttonDropMenu) {
    buttonDropMenu.classList.remove("d-none");
    setTimeout(() => {
        buttonDropMenu.classList.add("visible");
    }, 10);
}


/**
 * Creates dropdown menu template
 * @param {string} contactId - Contact ID
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone
 * @param {string} initials - Contact initials
 * @param {string} avatarColor - Avatar color
 * @returns {string} HTML template string
 */
function getDropMenuTemplate(contactId, name, email, phone, initials, avatarColor) {
    return `
        <div class="button-drop-menu">
            <button onclick="editContact('${contactId}', '${name}', '${email}', '${phone}', '${initials}', '${avatarColor}')" class="button-details-drop" type="button">
                <img src="./assets/icons/edit.svg" alt=""> Edit
            </button>
            <button onclick="deleteContact('${contactId}')" class="button-details-drop" type="button">
                <img src="./assets/icons/delete.svg" alt=""> Delete
            </button>
        </div>
    `;
}


/**
 * Opens add contact overlay
 */
function addContact() {
  const addOverlay = document.getElementById("overlay-add-contact");
  if (!addOverlay) return;

  addOverlay.innerHTML = getAddContactTemplate();
  addOverlay.classList.remove("d-none");
  setTimeout(() => addOverlay.classList.add("visible"), 10);
}


/**
 * Closes add contact overlay with animation
 */
function closeAddContact() {
  const addOverlay = document.getElementById("overlay-add-contact");
  if (!addOverlay) return;

  const popup = addOverlay.querySelector(".add-contact-popup");
  if (popup) popup.classList.add("closing");

  addOverlay.classList.remove("visible");
  setTimeout(() => addOverlay.classList.add("d-none"), 500);
}


/**
 * Opens edit contact overlay
 * @param {string} contactId - Contact ID
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone
 * @param {string} initials - Contact initials
 * @param {string} avatarColor - Avatar color
 */
function editContact(contactId, name, email, phone, initials, avatarColor) {
    const editOverlay = document.getElementById("overlay-add-contact");
    if (!editOverlay) return;
   
    editOverlay.innerHTML = editContactTemplate(contactId, name, email, phone, initials, avatarColor);
    editOverlay.classList.remove('d-none');
    setTimeout(() => editOverlay.classList.add('visible'), 10);
    closeDropdown();
}


/**
 * Shows success message after contact creation
 */
function showSuccessMessage() {
    if (isSuccessMessageShown) return;
    isSuccessMessageShown = true;
    
    const createdContact = document.getElementById("created-contact");
    const addOverlay = document.getElementById("overlay-add-contact");

    createdContact.classList.remove('d-none');
    createdContact.classList.add("visible");
    
    displaySuccessPopup(createdContact);
    hideAddOverlay(addOverlay);
    setTimeout(() => {
        closeCreatedContact();
        isSuccessMessageShown = false;
    }, 3000);
}


/**
 * Displays success popup
 * @param {HTMLElement} createdContact - Success popup element
 */
function displaySuccessPopup(createdContact) {
  if (createdContact) {
    createdContact.innerHTML = createdContactTemplate();
  }
}


/**
 * Hides add contact overlay
 * @param {HTMLElement} addOverlay - Add overlay element
 */
function hideAddOverlay(addOverlay) {
  if (addOverlay) {
    addOverlay.classList.remove("visible");
    setTimeout(() => {
      addOverlay.classList.add("d-none");
    }, 10);
  }
}


/**
 * Closes success contact creation popup
 */
function closeCreatedContact() {
    const createdContact = document.getElementById("created-contact");
    if (!createdContact) return;
    
    const popup = createdContact.querySelector('.created-contact-popup');
    createdContact.classList.remove('visible');
    createdContact.classList.add('closing');
    if (popup) popup.classList.add('closing');
    
    setTimeout(() => resetSuccessPopup(createdContact, popup), 10);
}


/**
 * Resets success popup state
 * @param {HTMLElement} createdContact - Success popup element
 * @param {HTMLElement} popup - Popup inner element
 */
function resetSuccessPopup(createdContact, popup) {
    createdContact.classList.add("d-none");
    createdContact.classList.remove("closing");
    if (popup) popup.classList.remove("closing");
    isSuccessMessageShown = false;
}


/**
 * Quickly closes add contact overlay
 */
function closeAddContactQuick() {
    const addOverlay = document.getElementById("overlay-add-contact");
    if (!addOverlay) return;

    addOverlay.style.transition = "opacity 0.1s ease";
    addOverlay.classList.remove("visible");
    setTimeout(() => {
        addOverlay.classList.add("d-none");
        addOverlay.style.transition = "";
    }, 10);
}


/**
 * Closes dropdown on outside click
 */
function closeDropdownOnOutsideClick() {
    closeDropdown();
}


/**
 * Closes contact dropdown menu
 */
function closeDropdown() {
    const menu = document.getElementById("button-drop-menu");
    const btn = document.querySelector(".button-drop");
    
    if (!menu || !btn) return;
    
    menu.classList.remove('visible');
    menu.classList.add('closing');
    setTimeout(() => resetDropdownMenu(menu, btn), 500);
}


/**
 * Resets dropdown menu state
 * @param {HTMLElement} menu - Dropdown menu element
 * @param {HTMLElement} btn - Dropdown button element
 */
function resetDropdownMenu(menu, btn) {
    menu.classList.add("d-none");
    menu.classList.remove('closing');
    menu.innerHTML = "";
    btn.classList.remove("button-hidden");
}


/**
 * Generates avatar color based on name
 * @param {string} name - Contact name
 * @returns {string} CSS color variable
 */
function getAvatarColor(name) {
    const colors = [
        'var(--orange)', 'var(--rosa)', 'var(--blue-lila)',
        'var(--lila)', 'var(--light-blue)', 'var(--turqoise)',
        'var(--lachs)', 'var(--softorange)', 'var(--pinke)',
        'var(--darkyellow)', 'var(--blue)', 'var(--lightgreen)',
        'var(--yellow)', 'var(--red)', 'var(--lightorange)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}


/**
 * Event listener for closing dropdown on outside clicks
 */
document.addEventListener('click', function(event) {
    const headline = document.querySelector('.contacts-headline');
    const btn = document.querySelector(".button-drop");
    const menu = document.getElementById("button-drop-menu");
    
    if (headline?.contains(event.target) && btn && !btn.contains(event.target)) {
        if (menu && !menu.classList.contains("d-none") && menu.style.display !== "none") {
            closeDropdown();
        }
    }
});