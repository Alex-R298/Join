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
    
    initializeAnimation(elements);
    setTimeout(() => startLogoAnimation(elements), 500);
}

function initializeAnimation(elements) {
    elements.contentContainer.style.opacity = '0';
    elements.headerLogo.style.opacity = '0';
    elements.animatedLogo.style.transform = 'translate(-50%, -50%)';
    elements.contentContainer.style.display = 'block';
}

function startLogoAnimation(elements) {
    const headerRect = elements.headerLogo.getBoundingClientRect();
    const targetX = (headerRect.left + headerRect.width/2) / window.innerWidth * 100;
    const targetY = (headerRect.top + headerRect.height/2) / window.innerHeight * 100;
    
    elements.animatedLogo.style.transform = `translate(-50%, -50%) translate(${targetX - 50}vw, ${targetY - 50}vh)`;
    elements.animatedLogo.style.width = elements.headerLogo.width + 'px';
    elements.contentContainer.style.opacity = '1';
    elements.startScreen.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    
//    setTimeout(() => elements.signUp.style.opacity = '1', 500);
//     setTimeout(() => elements.logInForm.style.opacity = '1', 1000);
//     setTimeout(() => elements.logInFooter.style.opacity = '1', 1500);
    setTimeout(() => completeAnimation(elements), 1500);
}

function completeAnimation(elements) {
    elements.startScreen.style.display = 'none';
    elements.headerLogo.style.opacity = '1';
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
