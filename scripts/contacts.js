function onloadFunc() {
    fetchContacts("/user");
}

const BASE_URL = "https://joinstorage-e210a-default-rtdb.europe-west1.firebasedatabase.app/";

async function fetchContacts(path) {
    const response = await fetch(BASE_URL + path + ".json");
    const data = await response.json();
    const contactsList = document.getElementById('contacts-list');
    const contactsListDetails = document.getElementById('contacts-metrics');

    if (contactsList && contactsListDetails) {
        contactsList.innerHTML = getContactsTemplate(data);
        contactsListDetails.innerHTML = "";
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


