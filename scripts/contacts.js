/**
 * Initializes contacts loading on page load
 */
function onloadFunc() {
    fetchContacts("/user");
}


let currentSelectedContact = null;
let isSuccessMessageShown = false;

/**
 * Fetches contacts from Firebase and updates UI
 * @param {string} path - API path for contacts
 */
async function fetchContacts(path) {
    const response = await fetch(BASE_URL + path + ".json");
    const data = await response.json();
    updateContactsUI(data);
    clearDetailsIfNoSelection();
}


/**
 * Updates the contacts UI elements
 * @param {Object} data - Contact data from Firebase
 */
function updateContactsUI(data) {
    const contactsList = document.getElementById('contacts-list');
    const contactsListDetails = document.getElementById('contacts-container-details');
    const editContact = document.getElementById('overlay-add-contact');

    if (contactsList && contactsListDetails && editContact) {
        contactsList.innerHTML = getContactsTemplate(data);
        contactsListDetails.innerHTML = "";
        editContact.innerHTML = editContactTemplate();
    }
}


/**
 * Clears details view if no contact is selected
 */
function clearDetailsIfNoSelection() {
    const contactsListDetails = document.getElementById('contacts-container-details');
    if (contactsListDetails && !document.querySelector('.contact-card.selected')) {
        contactsListDetails.innerHTML = "";
    }
}


/**
 * Creates a new contact from form data
 */
function createdContact() { 
    const inputs = getContactInputElements();
    if (!validateContactInputs(inputs.name, inputs.email, inputs.phone)) {
        return; 
    }
    const newContact = createContactObject(inputs);
    closeAddContactQuick();
    saveContactToFirebase(newContact);
}


/**
 * Gets contact input elements from form
 * @returns {Object} Object containing input elements
 */
function getContactInputElements() {
    return {
        name: document.getElementById('contact-name'),
        email: document.getElementById('contact-email'),
        phone: document.getElementById('contact-phone')
    };
}


/**
 * Creates contact object from input data
 * @param {Object} inputs - Input elements with values
 * @returns {Object} New contact object
 */
function createContactObject(inputs) {
    return {
        name: inputs.name.value.trim(),
        email: inputs.email.value.trim(),
        phone: inputs.phone.value.trim(),
        createdAt: new Date().toISOString()
    };
}


/**
 * Validates all contact input fields
 * @param {HTMLElement} nameInput - Name input element
 * @param {HTMLElement} emailInput - Email input element
 * @param {HTMLElement} phoneInput - Phone input element
 * @returns {boolean} True if all inputs are valid
 */
function validateContactInputs(nameInput, emailInput, phoneInput) {
    let isValid = true;
    isValid = validateName(nameInput) && isValid;
    isValid = validateEmail(emailInput) && isValid;
    isValid = validatePhone(phoneInput) && isValid;
    return isValid;
}


/**
 * Saves contact to Firebase database
 * @param {Object} contact - Contact data to save
 */
async function saveContactToFirebase(contact) {
    const response = await fetch(BASE_URL + "/user.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    });
    const data = await response.json();
    const newContactId = data.name;
    handleSuccessfulContactSave(newContactId, contact);
}


/**
 * Handles successful contact creation
 * @param {string} contactId - New contact ID
 * @param {Object} contact - Contact data
 */
function handleSuccessfulContactSave(contactId, contact) {
    showSuccessMessage();
    fetchContacts("/user");
    setTimeout(() => markContactCard(contactId), 100);
    displayContactDetails(contactId, contact, getInitials(contact.name), getAvatarColor(contact.name), false);
    handleMobileContactView();
}


/**
 * Handles mobile view activation for contacts
 */
function handleMobileContactView() {
    if (window.innerWidth <= 1032) {
        const headline = document.querySelector('.contacts-headline');
        if (headline) {
            headline.classList.add('active');
        }
    }
}


/**
 * Deletes a contact from Firebase
 * @param {string} contactId - ID of contact to delete
 */
async function deleteContact(contactId) {
    await fetch(`${BASE_URL}/user/${contactId}.json`, {
        method: "DELETE"
    });
    fetchContacts("/user");
    clearContactDetailsView();
    closeAddContactQuick();
}


/**
 * Clears the contact details view
 */
function clearContactDetailsView() {
    const contactsMetrics = document.getElementById('contacts-container-details');
    if (contactsMetrics) {
        contactsMetrics.innerHTML = "";
    }
}


/**
 * Updates an existing contact
 * @param {string} contactId - ID of contact to update
 */
async function updateContact(contactId) {
    const inputs = getContactInputElements();
    if (!validateContactInputs(inputs.name, inputs.email, inputs.phone)) {
        return; 
    }
    const updatedContact = createUpdatedContactObject(inputs);
    closeAddContactQuick();
    await sendUpdatedContactToFirebase(contactId, updatedContact);
    finalizeContactUpdate(contactId, updatedContact);
}


/**
 * Creates updated contact object from inputs
 * @param {Object} inputs - Input elements with values
 * @returns {Object} Updated contact object
 */
function createUpdatedContactObject(inputs) {
    return {
        name: inputs.name.value.trim(),
        email: inputs.email.value.trim(),
        phone: inputs.phone ? inputs.phone.value.trim() : '',
        updatedAt: new Date().toISOString()
    };
}


/**
 * Finalizes contact update process
 * @param {string} contactId - Contact ID
 * @param {Object} updatedContact - Updated contact data
 */
function finalizeContactUpdate(contactId, updatedContact) {
    displayContactDetails(contactId, updatedContact, null, null, false);
    markContactCard(contactId);
}


/**
 * Sends updated contact data to Firebase
 * @param {string} contactId - Contact ID
 * @param {Object} updatedFields - Fields to update
 */
async function sendUpdatedContactToFirebase(contactId, updatedFields) {
    const currentContact = await getCurrentContactData(contactId);
    const updatedContact = { ...currentContact, ...updatedFields };
    
    await fetch(`${BASE_URL}/user/${contactId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContact)
    });
    
    updateSelectedContactData(contactId, updatedContact);
    await fetchContacts("/user");
}


/**
 * Gets current contact data from Firebase
 * @param {string} contactId - Contact ID
 * @returns {Object} Current contact data
 */
async function getCurrentContactData(contactId) {
    const response = await fetch(`${BASE_URL}/user/${contactId}.json`);
    return await response.json();
}


/**
 * Updates selected contact data in memory
 * @param {string} contactId - Contact ID
 * @param {Object} updatedContact - Updated contact data
 */
function updateSelectedContactData(contactId, updatedContact) {
    if (currentSelectedContact && currentSelectedContact.id === contactId) {
        currentSelectedContact.name = updatedContact.name;
        currentSelectedContact.email = updatedContact.email;
        currentSelectedContact.phone = updatedContact.phone;
        currentSelectedContact.initials = getInitials(updatedContact.name);
        currentSelectedContact.avatarColor = getAvatarColor(updatedContact.name);
    }
}


/**
 * Shows contact details in UI
 * @param {string} contactId - Contact ID
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone
 * @param {string} initials - Contact initials
 * @param {string} avatarColor - Avatar color
 */
function showContactDetails(contactId, name, email, phone, initials, avatarColor) {
    setCurrentSelectedContact(contactId, name, email, phone, initials, avatarColor);
    markContactCard(contactId);
    displayContactDetails(contactId, { name, email, phone }, initials, avatarColor);
    handleMobileContactView();
    closeCreatedContact();
}


/**
 * Sets current selected contact data
 * @param {string} contactId - Contact ID
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @param {string} phone - Contact phone
 * @param {string} initials - Contact initials
 * @param {string} avatarColor - Avatar color
 */
function setCurrentSelectedContact(contactId, name, email, phone, initials, avatarColor) {
    currentSelectedContact = {
        id: contactId,
        name: name,
        email: email,
        phone: phone,
        initials: initials,
        avatarColor: avatarColor
    };
}


/**
 * Returns to contacts list view (mobile)
 */
function backToContacts() {
    const headline = document.querySelector('.contacts-headline');
    if (headline) {
        headline.classList.remove('active');
    }
}


/**
 * Toggles contact dropdown menu
 */
function toggleContact() {
    const buttonDropMenu = document.getElementById("button-drop-menu");
    const buttonDrop = document.querySelector(".button-drop");
    
    buttonDrop.classList.add("button-hidden");
    buttonDropMenu.classList.remove("d_none");
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
 * Extracts initials from full name
 * @param {string} name - Full name
 * @returns {string} Initials in uppercase
 */
function getInitials(name) {
    return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
}


/**
 * Prepares contact data for display
 * @param {Object} data - Raw contact data from Firebase
 * @returns {Array} Sorted array of contacts
 */
function prepareContactsData(data) {
    const sortedContacts = [];
    for (const contactId in data || {}) {
        const contact = data[contactId];
        if (contact?.name && contact?.email) {
            sortedContacts.push({ id: contactId, ...contact });
        }
    }
    return sortedContacts.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}


/**
 * Creates HTML template for contacts list
 * @param {Object} data - Contact data
 * @returns {string} HTML template string
 */
function getContactsTemplate(data) {
    const sortedContacts = prepareContactsData(data);
    if (!sortedContacts.length) return "<p>No contacts found</p>";
    
    return buildContactsHTML(sortedContacts);
}


/**
 * Builds HTML for contacts list
 * @param {Array} sortedContacts - Sorted contact array
 * @returns {string} HTML template string
 */
function buildContactsHTML(sortedContacts) {
    let template = '';
    let currentLetter = '';
    sortedContacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            template += createLetterDivider(firstLetter);
            currentLetter = firstLetter;
        }
        template += createContactCard(contact);
    });
    return template;
}


/**
 * Sorts contacts alphabetically
 * @param {Object} data - Contact data
 * @returns {Array} Sorted contacts array
 */
function sortContacts(data) {
    return Object.values(data)
        .filter(user => user && user.name && user.email)
        .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}


/**
 * Opens add contact overlay
 */
function addContact() {
    const addOverlay = document.getElementById("overlay-add-contact");
    if (!addOverlay) return;
    
    addOverlay.innerHTML = getAddContactTemplate();
    addOverlay.style.display = "flex";
    addOverlay.style.visibility = "visible";
    setTimeout(() => addOverlay.classList.add('visible'), 10);
}


/**
 * Closes add contact overlay with animation
 */
function closeAddContact() {
    const addOverlay = document.getElementById("overlay-add-contact");
    if (!addOverlay) return;
    
    const popup = addOverlay.querySelector('.add-contact-popup');
    if (popup) popup.classList.add('closing');
    
    addOverlay.classList.remove('visible');
    setTimeout(() => addOverlay.style.visibility = "hidden", 500);
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
    editOverlay.style.display = "flex";
    editOverlay.style.visibility = "visible";
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
        createdContact.style.display = "flex";
        createdContact.style.visibility = "visible";
        createdContact.classList.add('visible');
    }
}


/**
 * Hides add contact overlay
 * @param {HTMLElement} addOverlay - Add overlay element
 */
function hideAddOverlay(addOverlay) {
    if (addOverlay) {
        addOverlay.classList.remove('visible');
        setTimeout(() => {
            addOverlay.style.visibility = "hidden";
            addOverlay.style.display = "none";
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
    createdContact.style.visibility = "hidden";
    createdContact.style.display = "none";
    createdContact.classList.remove('closing');
    if (popup) popup.classList.remove('closing');
    isSuccessMessageShown = false;
}


/**
 * Quickly closes add contact overlay
 */
function closeAddContactQuick() {
    const addOverlay = document.getElementById("overlay-add-contact");
    if (!addOverlay) return;
    
    addOverlay.style.transition = "opacity 0.1s ease";
    addOverlay.classList.remove('visible');
    setTimeout(() => {
        addOverlay.style.visibility = "hidden";
        addOverlay.style.display = "none";
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
    menu.classList.add("d_none");
    menu.classList.remove('closing');
    menu.style.display = "none";
    menu.innerHTML = "";
    btn.classList.remove("button-hidden");
}


/**
 * Marks contact card as selected
 * @param {string} contactId - Contact ID
 */
function markContactCard(contactId) {
    document.querySelectorAll('.contact-card').forEach(card => 
        card.classList.remove('selected')
    );
    const card = document.querySelector(`[data-contact-id="${contactId}"]`);
    if (card) card.classList.add('selected');
}


/**
 * Event listener for closing dropdown on outside clicks
 */
document.addEventListener('click', function(event) {
    const headline = document.querySelector('.contacts-headline');
    const btn = document.querySelector(".button-drop");
    const menu = document.getElementById("button-drop-menu");
    
    if (headline?.contains(event.target) && btn && !btn.contains(event.target)) {
        if (menu && !menu.classList.contains("d_none") && menu.style.display !== "none") {
            closeDropdown();
        }
    }
});




