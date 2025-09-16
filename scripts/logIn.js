/**
 * Initializes the application
 */
function init() {
    document.addEventListener('DOMContentLoaded', initializeApp);
}


/**
 * Main application initialization function
 */
function initializeApp() {
    const elements = getUIElements();
    setupResponsiveDesign(elements);
    setupMobileStyles(elements);
    initializeAnimation(elements);
    setTimeout(() => startLogoAnimation(elements), 1000);
}


/**
 * Gets UI elements for animation
 * @returns {Object} Object containing UI elements
 */
function getUIElements() {
    return {
        startScreen: document.getElementById('start_screen'),
        contentContainer: document.getElementById('content_container'),
        animatedLogo: document.getElementById('animated_logo'),
        headerLogo: document.getElementById('header_logo')
    };
}


/**
 * Sets up responsive design parameters
 * @param {Object} elements - UI elements object
 */
function setupResponsiveDesign(elements) {
    const isMobile = window.innerWidth <= 770;
    elements.originalWidth = isMobile ? 100 : 273;
    elements.originalHeight = isMobile ? 122 : 334;
    elements.targetWidth = isMobile ? 64 : 101;
    elements.targetHeight = isMobile ? 78 : 122;
    elements.animationDuration = 0.8;
}


/**
 * Sets up mobile-specific styles
 * @param {Object} elements - UI elements object
 */
function setupMobileStyles(elements) {
    const isMobile = window.innerWidth <= 770;
    if (!isMobile) return;
    
    elements.startScreen.style.backgroundColor = '#2a3647';
    if (elements.animatedLogo.tagName === 'IMG') {
        elements.animatedLogo.src = './assets/icons/capa_white.svg';
    } else {
        elements.animatedLogo.innerHTML = '<img src="./assets/icons/capa_white.svg" alt="Logo">';
    }
}


/**
 * Initializes animation styles and properties
 * @param {Object} elements - UI elements object
 */
function initializeAnimation(elements) {
    elements.contentContainer.style.opacity = '0';
    elements.animatedLogo.style.transform = 'translate(-50%, -50%)';
    elements.contentContainer.style.display = 'block';
    elements.animatedLogo.style.width = elements.originalWidth + 'px';
    elements.animatedLogo.style.height = elements.originalHeight + 'px';
    elements.animatedLogo.style.display = 'block';
    elements.startScreen.style.display = 'flex';
    elements.headerLogo.style.visibility = 'hidden';
    setupAnimationTransitions(elements);
}


/**
 * Sets up CSS transitions for animation
 * @param {Object} elements - UI elements object
 */
function setupAnimationTransitions(elements) {
    const duration = elements.animationDuration;
    elements.animatedLogo.style.transition = `transform ${duration}s ease, width ${duration}s ease, height ${duration}s ease`;
}


/**
 * Starts the main logo animation sequence
 * @param {Object} elements - UI elements object
 */
function startLogoAnimation(elements) {
    const deltaPosition = calculateLogoPosition(elements);
    updateLogoForMobile(elements);
    applyAnimationStyles(elements, deltaPosition);
    setTimeout(() => completeAnimation(elements), elements.animationDuration * 1000 + 200);
}


/**
 * Calculates logo position for animation
 * @param {Object} elements - UI elements object
 * @returns {Object} Delta X and Y positions
 */
function calculateLogoPosition(elements) {
    const headerRect = elements.headerLogo.getBoundingClientRect();
    const animatedRect = elements.animatedLogo.getBoundingClientRect();
    
    return {
        x: headerRect.left + headerRect.width/2 - (animatedRect.left + animatedRect.width/2),
        y: headerRect.top + headerRect.height/2 - (animatedRect.top + animatedRect.height/2)
    };
}


/**
 * Updates logo for mobile display
 * @param {Object} elements - UI elements object
 */
function updateLogoForMobile(elements) {
    if (window.innerWidth > 770) return;
    
    const logoImg = elements.animatedLogo.tagName === 'IMG' ? 
                   elements.animatedLogo : 
                   elements.animatedLogo.querySelector('img');
    if (logoImg) {
        logoImg.src = './assets/icons/capa_dark.svg';
    }
}


/**
 * Applies animation styles to elements
 * @param {Object} elements - UI elements object
 * @param {Object} deltaPosition - Position changes for animation
 */
function applyAnimationStyles(elements, deltaPosition) {
    elements.animatedLogo.style.transform = `translate(-50%, -50%) translate(${deltaPosition.x}px, ${deltaPosition.y}px)`;
    elements.animatedLogo.style.width = elements.targetWidth + 'px';
    elements.animatedLogo.style.height = elements.targetHeight + 'px';
    elements.contentContainer.style.opacity = '1';
    elements.contentContainer.style.transition = 'opacity 0.6s ease';
    elements.startScreen.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    elements.startScreen.style.transition = 'background-color 1.5s ease';
}


/**
 * Completes the animation sequence
 * @param {Object} elements - UI elements object
 */
function completeAnimation(elements) {
    elements.animatedLogo.style.display = 'none';
    elements.startScreen.style.display = 'none';
    elements.headerLogo.style.visibility = 'visible';
}


/**
 * Checks privacy policy checkbox state
 */
function checkPrivacyPolicy() {
    const privacyPolicyCheckbox = document.getElementById("check-privacy-policy");
    return privacyPolicyCheckbox.checked;
}


/**
 * Handles user login process
 * @param {Event} event - Form submit event
 */
async function login(event) {
    if (event) event.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    emailInput.style.borderColor = '';
    passwordInput.style.borderColor = '';
    hideValidationError('login-email-error');
    hideValidationError('login-password-error');
    if (!validateLoginInputs(emailInput, passwordInput)) {
        return;
    }
    const userExists = await checkUserCredentials(emailInput.value, passwordInput.value);
    if (userExists) {
        redirectToSummary();
    }
}


/**
 * Validates login input fields
 * @param {HTMLElement} emailInput - Email input element
 * @param {HTMLElement} passwordInput - Password input element
 * @returns {boolean} True if inputs are valid
 */
function validateLoginInputs(emailInput, passwordInput) {
    let isValid = true;
    isValid = validateEmail(emailInput) && isValid;
    isValid = validatePassword(passwordInput) && isValid;
    return isValid;
}


/**
 * Checks user credentials against Firebase
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {boolean} True if credentials are valid
 */
async function checkUserCredentials(email, password) {
    const response = await fetch(BASE_URL + "/user.json");
    const users = await response.json();
    for (const userId in users) {
        const user = users[userId];
        if (user.email === email && user.password === password) {
            storeUserSession(userId, user.name);
            return true;
        }
    }
    document.getElementById('login-email').style.borderColor = 'red';
    document.getElementById('login-password').style.borderColor = 'red';
    showValidationError('login-password-error', 'Check your email and password.');
    return false;
}


/**
 * Stores user session data
 * @param {string} userId - User ID
 * @param {string} userName - User name
 */
function storeUserSession(userId, userName) {
    sessionStorage.setItem('currentUser', userId);
    sessionStorage.setItem('userName', userName);
}


/**
 * Redirects user to summary page
 */
function redirectToSummary() {
    window.location.replace("index.html");
}


/**
 * Checks if user is already logged in on page load
 */
function checkExistingSession() {
    if (sessionStorage.getItem('currentUser')) {
        window.location.replace("index.html");
    }
}


/**
 * Window load event handler
 */
window.onload = function() {
    checkExistingSession();
};


init();
