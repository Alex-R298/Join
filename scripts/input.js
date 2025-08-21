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


function validatePhone(phoneInput) {
    if (!phoneInput.value.trim()) {
        hideValidationError(phoneInput.id + '-error');
        return true;
    }
    
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phoneInput.value.replace(/\s/g, ''))) {
        phoneInput.style.borderColor = 'red';
        showValidationError(phoneInput.id + '-error', 'Bitte eine gültige Telefonnummer mit 11 Ziffern eingeben');
        return false;
    } else {
        phoneInput.style.borderColor = '';
        hideValidationError(phoneInput.id + '-error');
        return true;
    }
}


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


function validateAccept(acceptInput) {
    if (!acceptInput.checked) {
        showValidationError(acceptInput.id + '-error', 'Bitte akzeptiere die Nutzungsbedingungen');
        return false;
    } else {
        hideValidationError(acceptInput.id + '-error');
        return true;
    }
}





function showValidationError(errorId, message) {
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'validation-error';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        
        const inputId = errorId.replace('-error', '');
        const inputElement = document.getElementById(inputId);
        if (inputElement && inputElement.parentNode) {
            inputElement.parentNode.appendChild(errorElement);
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}


function hideValidationError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}