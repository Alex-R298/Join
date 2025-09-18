/**
 * Refactored Contact Functions - Uses centralized API
 */

let currentSelectedContact = null;
let isSuccessMessageShown = false;


/**
 * Initializes contact loading on page load
 */
function onloadFunc() {
    fetchContacts();
}


/**
 * Fetches contacts and updates UI
 */
async function fetchContacts() {
    const data = await loadContacts();
    updateContactsUI(data);
}


/**
 * Updates contacts UI
 * @param {Object} data - Contact data
 */
function updateContactsUI(data) {
    const contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = getContactsTemplate(data);
}


/**
 * Creates a new contact from form data
 */
async function createdContact() { 
    const inputs = getContactInputElements();
    if (!validateContactInputs(inputs.name, inputs.email, inputs.phone)) {
        return; 
    }
    const newContact = createContactObject(inputs);
    closeAddContactQuick();
    await saveContactToFirebase(newContact);
}


/**
 * Saves contact to Firebase
 * @param {Object} contact - Contact data
 */
async function saveContactToFirebase(contact) {
    const data = await createContact(contact);
    const newContactId = data.name;
    await handleSuccessfulContactSave(newContactId, contact);
}


/**
 * Handles successful contact save
 * @param {string} contactId - New contact ID
 * @param {Object} contact - Contact data
 */
async function handleSuccessfulContactSave(contactId, contact) {
    showSuccessMessage();
    await fetchContacts();
    setTimeout(() => markContactCard(contactId), 100);
    displayContactDetails(contactId, contact, getInitials(contact.name), getAvatarColor(contact.name), false);
    handleMobileContactView();
}


/**
 * Deletes a contact
 * @param {string} contactId - ID of contact to delete
 */
async function deleteContact(contactId) {
    await removeContact(contactId);
    await fetchContacts();
    const contactsHeadline = document.querySelector(".contacts-headline.active");
    if (contactsHeadline) {
        contactsHeadline.classList.remove("active");
    }
    clearContactDetailsView();
    closeAddContactQuick();
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
 * Sends updated contact data to Firebase
 * @param {string} contactId - Contact ID
 * @param {Object} updatedFields - Fields to update
 */
async function sendUpdatedContactToFirebase(contactId, updatedFields) {
    const currentContact = await getCurrentContactData(contactId);
    const updatedContact = { ...currentContact, ...updatedFields };
    await updateContactData(contactId, updatedContact);
    updateSelectedContactData(contactId, updatedContact);
    await fetchContacts();
}


/**
 * Gets current contact data
 * @param {string} contactId - Contact ID
 * @returns {Object} Current contact data
 */
async function getCurrentContactData(contactId) {
    return await loadContact(contactId);
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
 * Clears the contact details view
 */
function clearContactDetailsView() {
    const contactsMetrics = document.getElementById('contacts-container-details');
    if (contactsMetrics) {
        contactsMetrics.innerHTML = "";
    }
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




