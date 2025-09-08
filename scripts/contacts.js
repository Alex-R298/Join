function onloadFunc() {
    fetchContacts("/user");
}

let currentSelectedContact = null;


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
        displayContactDetails(newContactId, contact, getInitials(contact.name), getAvatarColor(contact.name), false);
        if (window.innerWidth <= 1032) {
            const headline = document.querySelector('.contacts-headline');
            if (headline) {
                headline.classList.add('active');
            }
        }
        
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
    if (!validateContactInputs(nameInput, emailInput, phoneInput)) {
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


async function sendUpdatedContactToFirebase(contactId, updatedFields) {
    try {
        const response = await fetch(`${BASE_URL}/user/${contactId}.json`);
        const currentContact = await response.json();
        const updatedContact = {
            ...currentContact,
            ...updatedFields
        };
        await fetch(`${BASE_URL}/user/${contactId}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedContact)
        });
        if (currentSelectedContact && currentSelectedContact.id === contactId) {
            currentSelectedContact.name = updatedContact.name;
            currentSelectedContact.email = updatedContact.email;
            currentSelectedContact.phone = updatedContact.phone;
            currentSelectedContact.initials = getInitials(updatedContact.name);
            currentSelectedContact.avatarColor = getAvatarColor(updatedContact.name);
        }
        await fetchContacts("/user");
    } catch (error) {
        console.error("Error updating contact:", error);
    }
}


function showContactDetails(contactId, name, email, phone, initials, avatarColor) {
    currentSelectedContact = {
        id: contactId,
        name: name,
        email: email,
        phone: phone,
        initials: initials,
        avatarColor: avatarColor
    };
    const allContactCards = document.querySelectorAll('.contact-card');
    allContactCards.forEach(card => {
        card.classList.remove('selected');
    });
    const clickedCard = event.currentTarget;
    if (clickedCard) {
        clickedCard.classList.add('selected');
    }
    displayContactDetails(contactId, { name, email, phone }, initials, avatarColor);
     if (window.innerWidth <= 1032) {
        const headline = document.querySelector('.contacts-headline');
        if (headline) {
            headline.classList.add('active');
        }
    }
    closeCreatedContact();
}

    function backToContacts() {
        const headline = document.querySelector('.contacts-headline');
        if (headline) {
            headline.classList.remove('active');
        }
    }

    function toggleContact() {
    const buttonDropMenu = document.getElementById("button-drop-menu");
    const buttonDrop = document.querySelector(".button-drop");
    
    buttonDrop.classList.add("button-hidden");
    buttonDropMenu.classList.remove("d_none");
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
    setTimeout(() => {
        buttonDropMenu.classList.add("visible");
    }, 10);
}

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
    closeDropdown();
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
            }, 300);
        }
    }
}




function closeCreatedContact() {
    const createdContact = document.getElementById("created-contact");
    if (createdContact) {
        const popup = createdContact.querySelector('.created-contact-popup');
        createdContact.classList.remove('visible');
        createdContact.classList.add('closing');
        if (popup) {
            popup.classList.add('closing');
        }
        setTimeout(() => {
            createdContact.style.visibility = "hidden";
            createdContact.style.display = "none";
            createdContact.classList.remove('closing');
            if (popup) {
                popup.classList.remove('closing');
            }
        }, 10);
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


function closeDropdownOnOutsideClick() {
    closeDropdown();
}

function closeDropdown() {
    const menu = document.getElementById("button-drop-menu");
    const btn = document.querySelector(".button-drop");
    
    if (menu && btn) {
        menu.classList.remove('visible');
        menu.classList.add('closing');
        setTimeout(() => {
            menu.classList.add("d_none");
            menu.classList.remove('closing');
            menu.style.display = "none";
            menu.innerHTML = "";
            btn.classList.remove("button-hidden");
        }, 500);
    }
}

function markContactCard(contactId) {
    document.querySelectorAll('.contact-card').forEach(card => 
        card.classList.remove('selected')
    );
    const card = document.querySelector(`[data-contact-id="${contactId}"]`);
    if (card) card.classList.add('selected');
}

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



