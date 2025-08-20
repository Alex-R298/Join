function onloadFunc() {
    fetchContacts("/user");
}


async function fetchContacts(path) {
    const response = await fetch(BASE_URL + path + ".json");
    const data = await response.json();
    const contactsList = document.getElementById('contacts-list');
    const contactsListDetails = document.getElementById('contacts-container-details');
    const editContact = document.getElementById('overlay-add-contact');

    if (contactsList && contactsListDetails && editContact) {
        contactsList.innerHTML = getContactsTemplate(data);
        contactsListDetails.innerHTML = "";
        editContact.innerHTML = editContactTemplate();
    }

    if (contactsListDetails && !document.querySelector('.contact-card.selected')) {
            contactsListDetails.innerHTML = "";
        }

}


function createdContact() { 
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    if (!validateContactInputs(nameInput, emailInput, phoneInput)) {
        return; 
    }
    const newContact = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        createdAt: new Date().toISOString()
    };
    closeAddContactQuick();
    saveContactToFirebase(newContact);
}


function validateContactInputs(nameInput, emailInput, phoneInput) {
    let isValid = true;
    isValid = validateName(nameInput) && isValid;
    isValid = validateEmail(emailInput) && isValid;
    isValid = validatePhone(phoneInput) && isValid;
    return isValid;
}


function validateName(nameInput) {
    if (!nameInput.value.trim() || !nameInput.value.includes(' ')) {
        nameInput.style.borderColor = 'red';
        showValidationError('contact-name-error', 'Bitte Vor- und Nachname eingeben');
        return false;
    } else {
        nameInput.style.borderColor = '';
        hideValidationError('contact-name-error');
        return true;
    }
}


function validateEmail(emailInput) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
        emailInput.style.borderColor = 'red';
        showValidationError('contact-email-error', 'Bitte eine gültige E-Mail-Adresse eingeben');
        return false;
    } else {
        emailInput.style.borderColor = '';
        hideValidationError('contact-email-error');
        return true;
    }
}


function validatePhone(phoneInput) {
    if (!phoneInput.value.trim()) {
        hideValidationError('contact-phone-error');
        return true;
    }
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phoneInput.value.replace(/\s/g, ''))) {
        phoneInput.style.borderColor = 'red';
        showValidationError('contact-phone-error', 'Bitte eine gültige Telefonnummer mit 11 Ziffern eingeben');
        return false;
    } else {
        phoneInput.style.borderColor = '';
        hideValidationError('contact-phone-error');
        return true;
    }
}


function showValidationError(errorId, message) {
    let errorElement = document.getElementById(errorId);
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'validation-error';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '12px';
        const inputId = errorId.replace('-error', '');
        const inputElement = document.getElementById(inputId);
        inputElement.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}


function hideValidationError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}


async function saveContactToFirebase(contact) {
    try {
        const response = await fetch(BASE_URL + "/user.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contact)
        });
        const data = await response.json();
        const newContactId = data.name;
        showSuccessMessage();
        await fetchContacts("/user");
        displayContactDetails(newContactId, contact, null, null, false);
        markContactCard(newContactId);
    } catch (error) {
        console.error("Error saving contact:", error);
    }
}



async function deleteContact(contactId) {
    await fetch(`${BASE_URL}/user/${contactId}.json`, {
        method: "DELETE"
    });
    fetchContacts("/user");
    const contactsMetrics = document.getElementById('contacts-container-details');
    contactsMetrics.innerHTML = "";
    closeAddContactQuick();
}


async function updateContact(contactId) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    if (!nameInput || !nameInput.value.trim() || !emailInput || !emailInput.value.trim()) {
        alert('Please fill in at least name and email!');
        return;
    }
    const updatedContact = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput ? phoneInput.value.trim() : '',
        updatedAt: new Date().toISOString()
    };
    closeAddContactQuick();
    await sendUpdatedContactToFirebase(contactId, updatedContact);
    displayContactDetails(contactId, updatedContact, null, null, false);
    markContactCard(contactId);
}



async function sendUpdatedContactToFirebase(contactId, updatedContact) {
    await fetch(`${BASE_URL}/user/${contactId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContact)
    });
    
    closeAddContact();
  await fetchContacts("/user");
}


function showContactDetails(contactId, name, email, phone, initials, avatarColor) {
    const allContactCards = document.querySelectorAll('.contact-card');
    allContactCards.forEach(card => {
        card.classList.remove('selected');
    });
    const clickedCard = event.currentTarget;
    if (clickedCard) {
        clickedCard.classList.add('selected');
    }
    displayContactDetails(contactId, { name, email, phone }, initials, avatarColor);
}


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


function getInitials(name) {
    return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
}


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


function getContactsTemplate(data) {
    const sortedContacts = prepareContactsData(data);
    let template = sortedContacts.length ? '' : "<p>Keine Kontakte gefunden</p>";
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


function sortContacts(data) {
    return Object.values(data)
        .filter(user => user && user.name && user.email)
        .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}


function addContact() {
    const addOverlay = document.getElementById("overlay-add-contact");
    if (addOverlay) {
        addOverlay.innerHTML = getAddContactTemplate();
        addOverlay.style.display = "flex";
        addOverlay.style.visibility = "visible";
        setTimeout(() => {
            addOverlay.classList.add('visible');
        }, 10);
    }
}


function closeAddContact() {
    const addOverlay = document.getElementById("overlay-add-contact");
    if (addOverlay) {
        const popup = addOverlay.querySelector('.add-contact-popup');
        if (popup) {
            popup.classList.add('closing');
        }
        addOverlay.classList.remove('visible');
        setTimeout(() => {
            addOverlay.style.visibility = "hidden";
        }, 500);
    }
}


function editContact(contactId, name, email, phone, initials, avatarColor) {
    const editOverlay = document.getElementById("overlay-add-contact");
    if (editOverlay) {
        editOverlay.innerHTML = editContactTemplate(contactId, name, email, phone, initials, avatarColor);
        editOverlay.style.display = "flex";
        editOverlay.style.visibility = "visible";
        setTimeout(() => {
            editOverlay.classList.add('visible');
        }, 10);
    }
}


function showSuccessMessage() {
    const createdContact = document.getElementById("created-contact");
    const addOverlay = document.getElementById("overlay-add-contact");
    if (createdContact) {
        createdContact.innerHTML = createdContactTemplate();
        createdContact.style.display = "flex";
        createdContact.style.visibility = "visible";
        createdContact.classList.add('visible');
        if (addOverlay) {
            addOverlay.classList.remove('visible');
            setTimeout(() => {
                addOverlay.style.visibility = "hidden";
                addOverlay.style.display = "none";
            }, 200);
        }
    }
}


function closeCreatedContact() {
    const createdContact = document.getElementById("created-contact");
    if (createdContact) {
        createdContact.classList.remove('visible');
        setTimeout(() => {
            createdContact.style.visibility = "hidden";
            createdContact.style.display = "none";
        }, 1000);
    }
}


function closeAddContactQuick() {
    const addOverlay = document.getElementById("overlay-add-contact");
    if (addOverlay) {
        addOverlay.style.transition = "opacity 0.1s ease";
        addOverlay.classList.remove('visible');
        setTimeout(() => {
            addOverlay.style.visibility = "hidden";
            addOverlay.style.display = "none";
            addOverlay.style.transition = "";
        }, 10);
    }
}


function showAndMarkContact(contactId, contact) {
    const initials = getInitials(contact.name);
    const avatarColor = getAvatarColor(contact.name);
    showContactDetails(
        contactId,
        contact.name,
        contact.email,
        contact.phone,
        initials,
        avatarColor
    );
    setTimeout(() => markContactCard(contactId), 50);
}


function markContactCard(contactId) {
    document.querySelectorAll('.contact-card').forEach(card => 
        card.classList.remove('selected')
    );
    const card = document.querySelector(`[data-contact-id="${contactId}"]`);
    if (card) card.classList.add('selected');
}

