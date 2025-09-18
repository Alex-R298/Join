/**
 * Shows name input error with message and red border.
 * @param {HTMLElement} input - Name input element.
 * @param {string} message - Error message to display.
 */
function showNameError(input, message) {
    input.style.borderColor = 'red';
    showValidationError(input.id + '-error', message);
}


/**
 * Clears name input error and removes red border.
 * @param {HTMLElement} input - Name input element.
 */
function clearNameError(input) {
    input.style.borderColor = '';
    hideValidationError(input.id + '-error');
}


/**
 * Formats a name string: capitalizes first letter of each part.
 * @param {string} name - Raw name string.
 * @returns {string} Formatted name string.
 */
function formatName(name) {
    return name
        .trim()
        .split(' ')
        .map(part => part.length > 0
            ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            : part
        )
        .join(' ');
}


/**
 * Validates the name input: must contain first and last name.
 * Formats the name and updates the input value if valid.
 * @param {HTMLElement} nameInput - Name input element.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateName(nameInput) {
    if (!nameInput.value.trim() || !nameInput.value.includes(' ')) {
        showNameError(nameInput, 'Please enter your first and last name');
        return false;
    }
    nameInput.value = formatName(nameInput.value);
    clearNameError(nameInput);
    return true;
}


/**
 * Validates email input field
 * @param {HTMLElement} emailInput - Email input element
 * @returns {boolean} True if email has valid format
 */
function validateEmail(emailInput) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
        emailInput.style.borderColor = 'red';
        showValidationError(emailInput.id + '-error', 'Please enter a valid email address');
        return false;
    } else {
        emailInput.style.borderColor = '';
        hideValidationError(emailInput.id + '-error');
        return true;
    }
}


/**
 * Validates phone number input field
 * @param {HTMLElement} phoneInput - Phone input element
 * @returns {boolean} True if phone number is valid or empty (optional field)
 */
function validatePhone(phoneInput) {
    if (!phoneInput.value.trim()) {
        hideValidationError(phoneInput.id + '-error');
        return true;
    }
    const phoneRegex = /^(\+)?\d[\d\s]{9,14}$/;
    if (!phoneRegex.test(phoneInput.value.replace(/\s/g, ''))) {
        phoneInput.style.borderColor = 'red';
        showValidationError(phoneInput.id + '-error', 'Please enter a valid phone number');
        return false;
    } else {
        phoneInput.style.borderColor = '';
        hideValidationError(phoneInput.id + '-error');
        return true;
    }
}


/**
 * Validates password input field
 * @param {HTMLElement} passwordInput - Password input element
 * @returns {boolean} True if password meets minimum requirements (8 characters)
 */
function validatePassword(passwordInput) {
    const password = passwordInput.value;
    
    if (!password.trim() || password.length < 8) {
        passwordInput.style.borderColor = 'red';
        showValidationError(passwordInput.id + '-error', 'The password must be 8+ characters');
        return false;
    } else {
        passwordInput.style.borderColor = '';
        hideValidationError(passwordInput.id + '-error');
        return true;
    }
}


/**
 * Highlights the confirm password input with error styling and message.
 * @param {HTMLElement} input - Confirm password input element.
 * @param {string} message - Error message to display.
 */
function showConfirmPasswordError(input, message) {
    input.style.borderColor = 'red';
    showValidationError(input.id + '-error', message);
}


/**
 * Clears error styling and hides validation error for confirm password.
 * @param {HTMLElement} input - Confirm password input element.
 */
function clearConfirmPasswordError(input) {
    input.style.borderColor = '';
    hideValidationError(input.id + '-error');
}


/**
 * Validates that confirm password is not empty.
 * @param {HTMLElement} input - Confirm password input element.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateConfirmPasswordNotEmpty(input) {
    if (!input.value.trim()) {
        showConfirmPasswordError(input, 'Please confirm your password');
        return false;
    }
    return true;
}


/**
 * Validates that confirm password matches original password.
 * @param {HTMLElement} confirmInput - Confirm password input element.
 * @param {HTMLElement} passwordInput - Original password input element.
 * @returns {boolean} True if match, false otherwise.
 */
function validateConfirmPasswordMatch(confirmInput, passwordInput) {
    if (confirmInput.value !== passwordInput.value) {
        showConfirmPasswordError(
            confirmInput, 
            'Your passwords don’t match. Please try again.'
        );
        return false;
    }
    return true;
}


/**
 * Validates confirm password input against the original password.
 * @param {HTMLElement} confirmPasswordInput - Confirm password input element.
 * @param {HTMLElement} passwordInput - Original password input element.
 * @returns {boolean} True if confirmation is valid.
 */
function validateConfirmPassword(confirmPasswordInput, passwordInput) {
    if (!validateConfirmPasswordNotEmpty(confirmPasswordInput)) return false;
    if (!validateConfirmPasswordMatch(confirmPasswordInput, passwordInput)) return false;
    clearConfirmPasswordError(confirmPasswordInput);
    return true;
}


/**
 * Validates acceptance checkbox (terms and conditions)
 * @param {HTMLElement} acceptInput - Checkbox input element
 * @returns {boolean} True if checkbox is checked
 */
function validateAccept(acceptInput) {
    if (!acceptInput.checked) {
        showValidationError(acceptInput.id + '-error', 'Please accept the privacy policy');
        return false;
    } else {
        hideValidationError(acceptInput.id + '-error');
        return true;
    }
}


/**
 * Creates a validation error element for the given input.
 * @param {string} errorId - ID of the error element.
 * @returns {HTMLElement|null} The created element or null if no container found.
 */
function createValidationErrorElement(errorId) {
    const el = document.createElement('div');
    el.id = errorId;
    el.className = 'validation-error';

    const inputId = errorId.replace('-error', '');
    const input = document.getElementById(inputId);
    const container = input?.closest('.input-with-icon, .sign-up-checkbox');

    if (container) {
        container.style.position = 'relative';
        container.appendChild(el);
        return el;
    }
    return null;
}


/**
 * Returns an existing error element or creates one if missing.
 * @param {string} errorId - ID of the error element.
 * @returns {HTMLElement|null} The error element.
 */
function getOrCreateErrorElement(errorId) {
    return document.getElementById(errorId) || createValidationErrorElement(errorId);
}


/**
 * Displays a validation error message below the input field.
 * @param {string} errorId - ID of the error element.
 * @param {string} message - Error message to display.
 */
function showValidationError(errorId, message) {
    const errorElement = getOrCreateErrorElement(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}


/**
 * Hides validation error message
 * @param {string} errorId - ID of the error element to hide
 */
function hideValidationError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}