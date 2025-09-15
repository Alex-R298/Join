/**
 * Validates name input field
 * @param {HTMLElement} nameInput - Name input element
 * @returns {boolean} True if name is valid (contains first and last name)
 */
function validateName(nameInput) {
    if (!nameInput.value.trim() || !nameInput.value.includes(' ')) {
        nameInput.style.borderColor = 'red';
        showValidationError(nameInput.id + '-error', 'Bitte Vor- und Nachname eingeben');
        return false;
    } else {
        const nameParts = nameInput.value.trim().split(' ');
        const formattedName = nameParts.map(part => {
            if (part.length > 0) {
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }
            return part;
        }).join(' ');
        nameInput.value = formattedName;
        nameInput.style.borderColor = '';
        hideValidationError(nameInput.id + '-error');
        return true;
    }
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
        showValidationError(emailInput.id + '-error', 'Bitte eine gültige E-Mail-Adresse eingeben');
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
        showValidationError(phoneInput.id + '-error', 'Bitte eine gültige Telefonnummer eingeben');
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
        showValidationError(passwordInput.id + '-error', 'Das Passwort muss mindestens 8 Zeichen lang sein');
        return false;
    } else {
        passwordInput.style.borderColor = '';
        hideValidationError(passwordInput.id + '-error');
        return true;
    }
}


/**
 * Validates password confirmation field
 * @param {HTMLElement} confirmPasswordInput - Confirm password input element
 * @param {HTMLElement} passwordInput - Original password input element
 * @returns {boolean} True if confirmation password matches original password
 */
function validateConfirmPassword(confirmPasswordInput, passwordInput) {
    const confirmPassword = confirmPasswordInput.value;
    const password = passwordInput.value;
    
    if (!confirmPassword.trim()) {
        confirmPasswordInput.style.borderColor = 'red';
        showValidationError(confirmPasswordInput.id + '-error', 'Bitte bestätige dein Passwort');
        return false;
    } else if (confirmPassword !== password) {
        confirmPasswordInput.style.borderColor = 'red';
        showValidationError(confirmPasswordInput.id + '-error', 'Die Passwörter stimmen nicht überein');
        return false;
    } else {
        confirmPasswordInput.style.borderColor = '';
        hideValidationError(confirmPasswordInput.id + '-error');
        return true;
    }
}


/**
 * Validates acceptance checkbox (terms and conditions)
 * @param {HTMLElement} acceptInput - Checkbox input element
 * @returns {boolean} True if checkbox is checked
 */
function validateAccept(acceptInput) {
    if (!acceptInput.checked) {
        showValidationError(acceptInput.id + '-error', 'Bitte akzeptiere die Nutzungsbedingungen');
        return false;
    } else {
        hideValidationError(acceptInput.id + '-error');
        return true;
    }
}


/**
 * Shows validation error message below input field
 * @param {string} errorId - ID of the error element
 * @param {string} message - Error message to display
 */
function showValidationError(errorId, message) {
    let errorElement = document.getElementById(errorId);
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'validation-error';
        errorElement.style = "color: red; font-size: 12px; position: absolute; top: 100%; left: 0; margin-top: 5px; z-index: 1;";
        const inputId = errorId.replace('-error', '');
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            const inputContainer = inputElement.closest('.input-with-icon, .sign-up-checkbox');
            if (inputContainer) {
                inputContainer.style.position = 'relative';
                inputContainer.appendChild(errorElement);
            }
        }
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
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