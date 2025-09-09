/**
 * Handles user signup process
 */
function signup() {
    const inputElements = getSignupInputElements();
    
    if (!validateSignupInputs(inputElements.name, inputElements.email, inputElements.password, inputElements.confirmPassword, inputElements.accept)) {
        return;
    }
    
    const newUser = createUserObject(inputElements);
    registerUserInFirebase(newUser);
    closeSignupForm();
    showSuccessMessageSignUp();
}


/**
 * Gets signup input elements from form
 * @returns {Object} Object containing input elements
 */
function getSignupInputElements() {
    return {
        name: document.getElementById('signup-name'),
        email: document.getElementById('signup-email'),
        password: document.getElementById('signup-password'),
        confirmPassword: document.getElementById('signup-confirm-password'),
        accept: document.getElementById('check-privacy-policy')
    };
}


/**
 * Creates user object from input data
 * @param {Object} inputElements - Input elements with values
 * @returns {Object} New user object
 */
function createUserObject(inputElements) {
    return {
        name: inputElements.name.value.trim(),
        email: inputElements.email.value.trim(),
        password: inputElements.password.value,
        createdAt: new Date().toISOString()
    };
}


/**
 * Validates all signup input fields
 * @param {HTMLElement} nameInput - Name input element
 * @param {HTMLElement} emailInput - Email input element
 * @param {HTMLElement} passwordInput - Password input element
 * @param {HTMLElement} confirmPasswordInput - Confirm password input element
 * @param {HTMLElement} acceptInput - Privacy policy checkbox element
 * @returns {boolean} True if all inputs are valid
 */
function validateSignupInputs(nameInput, emailInput, passwordInput, confirmPasswordInput, acceptInput) {
    let isValid = true;
    isValid = validateName(nameInput) && isValid;
    isValid = validateEmail(emailInput) && isValid;
    isValid = validatePassword(passwordInput) && isValid;
    isValid = validateConfirmPassword(confirmPasswordInput, passwordInput) && isValid;
    isValid = validateAccept(acceptInput) && isValid;
    return isValid;
}


/**
 * Clears signup form input fields
 */
function closeSignupForm() {
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
}


/**
 * Registers new user in Firebase database
 * @param {Object} user - User object to register
 */
async function registerUserInFirebase(user) {
    const response = await fetch(BASE_URL + "/user.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
    
    if (!response.ok) {
        showErrorMessage("Registration failed. Please try again.");
    }
}


/**
 * Shows success message after successful signup
 */
function showSuccessMessageSignUp() {
    const signedUp = document.getElementById("signed-up");
    const overlaySignup = document.getElementById("overlay-signup");
    
    if (signedUp && overlaySignup) {
        prepareSuccessElements(signedUp, overlaySignup);
        setTimeout(redirectToLogin, 1500);
    }
}


/**
 * Prepares success message elements for display
 * @param {HTMLElement} signedUp - Success message element
 * @param {HTMLElement} overlaySignup - Overlay element
 */
function prepareSuccessElements(signedUp, overlaySignup) {
    signedUp.classList.remove('d-none');
    overlaySignup.classList.remove('d-none');
    signedUp.innerHTML = signedUpTemplate();
    setupSuccessElementStyles(signedUp, overlaySignup);
}


/**
 * Sets up styles for success elements
 * @param {HTMLElement} signedUp - Success message element
 * @param {HTMLElement} overlaySignup - Overlay element
 */
function setupSuccessElementStyles(signedUp, overlaySignup) {
    overlaySignup.style.display = "flex";
    overlaySignup.style.visibility = "visible";
    overlaySignup.classList.add('visible');
    signedUp.style.display = "flex";
    signedUp.style.visibility = "visible";
    signedUp.classList.add('visible');
}


/**
 * Redirects user to login page
 */
function redirectToLogin() {
    window.location.replace("log_in.html");
}


/**
 * Checks for existing user session on page load
 */
function checkUserSession() {
    if (sessionStorage.getItem('currentUser')) {
        window.location.replace("index.html");
    }
}


/**
 * Window load event handler
 */
window.onload = function() {
    checkUserSession();
};