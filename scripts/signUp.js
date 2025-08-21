function signup() { 
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const acceptInput = document.getElementById('check-privacy-policy');
    if (!validateSignupInputs(nameInput, emailInput, passwordInput, confirmPasswordInput, acceptInput)) {
        return;
    }
    const newUser = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        createdAt: new Date().toISOString()
    };
    registerUserInFirebase(newUser);
    closeSignupForm();
    showSuccessMessageSignUp();
}



function validateSignupInputs(nameInput, emailInput, passwordInput, confirmPasswordInput , acceptInput) {
    let isValid = true;
    isValid = validateName(nameInput) && isValid;
    isValid = validateEmail(emailInput) && isValid;
    isValid = validatePassword(passwordInput) && isValid;
    isValid = validateConfirmPassword(confirmPasswordInput, passwordInput) && isValid;
    isValid = validateAccept(acceptInput) && isValid;
    
    return isValid;
}


function closeSignupForm() {
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
}


async function registerUserInFirebase(user) {
    try {
        const response = await fetch(BASE_URL + "/user.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            throw new Error();
        }

    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        showErrorMessage("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
    }
}



function showSuccessMessageSignUp() {
    const signedUp = document.getElementById("signed-up");
    const overlaySignup = document.getElementById("overlay-signup");
    
    if (signedUp && overlaySignup) {
        prepareSuccessElements(signedUp, overlaySignup);
        setTimeout(() => {
            redirectToLogin();
        }, 1500); 
    }
}

function prepareSuccessElements(signedUp, overlaySignup) {
    signedUp.classList.remove('d-none');
    overlaySignup.classList.remove('d-none');
    signedUp.innerHTML = signedUpTemplate();
    overlaySignup.style.display = "flex";
    overlaySignup.style.visibility = "visible";
    overlaySignup.classList.add('visible');
    signedUp.style.display = "flex";
    signedUp.style.visibility = "visible";
    signedUp.classList.add('visible');
}

function redirectToLogin() {
    window.location.href = "log_in.html";
}