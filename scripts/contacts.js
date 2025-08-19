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

}


function createdContact() { 
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    if (!nameInput || !nameInput.value.trim() || !emailInput || !emailInput.value.trim()) {
        alert('Please fill in at least name and email!');
        return;
    }
    const newContact = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput ? phoneInput.value.trim() : '',
        createdAt: new Date().toISOString()
    };
    closeAddContactQuick();
    saveContactToFirebase(newContact);
}


async function saveContactToFirebase(contact) {
    await fetch(BASE_URL + "/user.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    });

    const data = await response.json();
    const newContactId = data.name;
    
    closeAddContactQuick();
  await fetchContacts("/user");
  displayNewContact(newContactId, contact);
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
     sendUpdatedContactToFirebase(contactId, updatedContact);
     editContact();
}


async function sendUpdatedContactToFirebase(contactId, updatedContact) {
    await fetch(`${BASE_URL}/user/${contactId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContact)
    });
    
    closeAddContact();
  await fetchContacts("/user");
    showLatestContact(contactId);
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
    const contactsMetrics = document.getElementById('contacts-container-details');
    contactsMetrics.innerHTML = generateContactDetailsHTML(contactId, name, email, phone, initials, avatarColor);
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


function getContactsTemplate(data) {
    if (!data) return "<p>Keine Kontakte gefunden</p>";
    
    let template = '';
    let currentLetter = '';
    const sortedContacts = [];
    for (const contactId in data) {
        const contact = data[contactId];
        if (contact && contact.name && contact.email) {
            sortedContacts.push({
                id: contactId, 
                ...contact
            });
        }
    }
    
    sortedContacts.sort((a, b) => a.name.localeCompare(b.name, 'de'));
    
    sortedContacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        
        if (firstLetter !== currentLetter) {
            template += createLetterDivider(firstLetter);
            currentLetter = firstLetter;
        }
        
        template += createContactCard(contact);
    });
    
    return template || "<p>Keine gültigen Kontakte gefunden</p>";
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

