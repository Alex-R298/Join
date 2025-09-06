function init() {
    document.addEventListener('DOMContentLoaded', initializeApp);
}


function initializeApp() {
    const elements = {
        startScreen: document.getElementById('start_screen'),
        contentContainer: document.getElementById('content_container'),
        animatedLogo: document.getElementById('animated_logo'),
        headerLogo: document.getElementById('header_logo'),
    };
    const isMobile = window.innerWidth <= 427;
    elements.originalWidth = isMobile ? 100 : 273;
    elements.originalHeight = isMobile ? 122 : 334;
    elements.targetWidth = isMobile ? 64 : 101;
    elements.targetHeight = isMobile ? 78 : 122;
    if (isMobile) {
        elements.startScreen.style.backgroundColor = '#2a3647';
        if (elements.animatedLogo.tagName === 'IMG') {
            elements.animatedLogo.src = '/assets/icons/capa_white.svg';
        } else {
            elements.animatedLogo.innerHTML = '<img src="/assets/icons/capa_white.svg" alt="Logo">';
        }
    }
    elements.headerLogo.style.visibility = 'hidden';
    elements.animationDuration = 0.8;
    
    initializeAnimation(elements);
    setTimeout(() => startLogoAnimation(elements), 1000);
}

function initializeAnimation(elements) {
    elements.contentContainer.style.opacity = '0';
    elements.animatedLogo.style.transform = 'translate(-50%, -50%)';
    elements.contentContainer.style.display = 'block';
    elements.animatedLogo.style.width = elements.originalWidth + 'px';
    elements.animatedLogo.style.height = elements.originalHeight + 'px';
    elements.animatedLogo.style.display = 'block';
    elements.startScreen.style.display = 'flex';
    elements.animatedLogo.style.transition = `transform ${elements.animationDuration}s ease, width ${elements.animationDuration}s ease, height ${elements.animationDuration}s ease`;
}

function startLogoAnimation(elements) {
    const headerRect = elements.headerLogo.getBoundingClientRect();
    const animatedRect = elements.animatedLogo.getBoundingClientRect();
    
    const deltaX = headerRect.left + headerRect.width/2 - (animatedRect.left + animatedRect.width/2);
    const deltaY = headerRect.top + headerRect.height/2 - (animatedRect.top + animatedRect.height/2);
    
    if (window.innerWidth <= 427) {
        const logoImg = elements.animatedLogo.tagName === 'IMG' ? elements.animatedLogo : elements.animatedLogo.querySelector('img');
        if (logoImg) {
            logoImg.src = '/assets/icons/capa_dark.svg';
        }
    }
    
    elements.animatedLogo.style.transform = `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px)`;
    elements.animatedLogo.style.width = elements.targetWidth + 'px';
    elements.animatedLogo.style.height = elements.targetHeight + 'px';
    elements.contentContainer.style.opacity = '1';
    elements.contentContainer.style.transition = 'opacity 0.6s ease';
    elements.startScreen.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    elements.startScreen.style.transition = 'background-color 1.5s ease';
    
    setTimeout(() => completeAnimation(elements), elements.animationDuration * 1000 + 200);
}

function completeAnimation(elements) {
    elements.animatedLogo.style.display = 'none';
    elements.startScreen.style.display = 'none';
    elements.headerLogo.style.visibility = 'visible';
}

init();

function checkPrivacyPolicy() {
  const privacyPolicyCheckbox = document.getElementById("check-privacy-policy");

  if (privacyPolicyCheckbox.checked) {

  } else {

  }
}


async function login(event) {
    if (event) event.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (!validateLoginInputs(emailInput, passwordInput)) {
        return;
    }
    const userExists = await checkUserCredentials(emailInput.value, passwordInput.value);
    
    if (userExists) {
        redirectToSummary();
    }
}


function validateLoginInputs(emailInput, passwordInput) {
    let isValid = true;
    isValid = validateEmail(emailInput) && isValid;
    isValid = validatePassword(passwordInput) && isValid;
    return isValid;
}


async function checkUserCredentials(email, password) {
    try {
        const response = await fetch(BASE_URL + "/user.json");
        const users = await response.json();
        for (const userId in users) {
            const user = users[userId];
            if (user.email === email && user.password === password) {
                sessionStorage.setItem('currentUser', userId);
                sessionStorage.setItem('userName', user.name);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Fehler beim Überprüfen der Anmeldedaten:", error);
        return false;
    }
}




function redirectToSummary() {
    window.location.replace("index.html");
}


window.onload = function() {
    if (sessionStorage.getItem('currentUser')) {
        window.location.replace("index.html");
    }
};

