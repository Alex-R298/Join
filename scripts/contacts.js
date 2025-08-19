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
    const sortedContacts = sortContacts(data);

    if (sortedContacts.length === 0) {
        return "<p>Keine gültigen Kontakte gefunden</p>";
    }
    let template = '';
    let currentLetter = '';
    sortedContacts.forEach(user => {
        const firstLetter = user.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            template += createLetterDivider(firstLetter);
            currentLetter = firstLetter;
        }

        template += createContactCard(user);
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


function editContact(name, email, phone, initials, avatarColor) {
    const editOverlay = document.getElementById("overlay-add-contact");
    if (editOverlay) {
        editOverlay.innerHTML = editContactTemplate(name, email, phone, initials, avatarColor);
        editOverlay.style.display = "flex";
        editOverlay.style.visibility = "visible";
        setTimeout(() => {
            editOverlay.classList.add('visible');
        }, 10);
    }
}




function createdContact() { 
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


