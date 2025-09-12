/**
 * Initializes the application by loading various components and setting up Firebase listeners.
 * Conditionally calls multiple initialization functions if they exist.
 * @returns {Promise<void>}
 */
async function init() {
  if (typeof datetimer === 'function') {
    datetimer();
  }
     
  if (typeof loadHeader === 'function') {
    loadHeader();
  }
     
  if (typeof loadSidebar === 'function') {
    loadSidebar();
  }
  
  if (typeof loadAddPage === 'function') {
    loadAddPage();
  }
     
  if (typeof renderTasks === 'function') {
    renderTasks();
  }
     
  if (typeof activMediumBtn === 'function') {
    activMediumBtn();
  }

  if (typeof setActiveNavigation === 'function') {
    setActiveNavigation();
  }

  if (typeof clearAllContainers === 'function') {
    clearAllContainers();
  }
     
  if (typeof loadContacts === 'function') {
    await loadContacts();
  }
         
  if (typeof renderTasks === 'function') {
    await renderTasks();
  }

  if (typeof updateHTML === 'function') {
    updateHTML();
  }

  if (typeof firebase !== 'undefined') {
  const taskRef = firebase.database().ref('/task');
  taskRef.on('value', async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const tasks = Object.entries(data)
        .filter(([id, task]) => task.category)
        .map(([id, task]) => ({ id, ...task }));
      allTasks = tasks;
      updateHTML();
      
      // Update dashboard as well
      if (typeof updateDashboardCounts === 'function') {
        updateDashboardCounts();
      }
    }
  });
}
}


/**
 * Toggles the visibility of the user popup menu.
 */
function user_button_show_links() {
  document.getElementById("myPopup").classList.toggle("show");
}


/**
 * Extracts initials from a full name.
 * @param {string} name - The full name to extract initials from.
 * @returns {string} Uppercase initials extracted from the name.
 */
function getInitials(name) {
    return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
}


/**
 * Returns a greeting based on current time.
 * @returns {string} Time-appropriate greeting: "Good Morning", "Good Afternoon", or "Good Evening".
 */
function getTimeGreeting() {
  const hrs = new Date().getHours();
  if (hrs < 12) return "Good Morning";
  if (hrs <= 17) return "Good Afternoon";
  return "Good Evening";
}


/**
 * Updates the greeting label element with personalized greeting if user name is available.
 */
function updateGreetingLabel() {
  const date = document.getElementById("lblGreetings");
  if (!date) return;
  const greet = getTimeGreeting();
  const userName = sessionStorage.getItem("userName");
  date.innerHTML = userName 
    ? `<h2>${greet},</h2><p class="greet-name">${userName}</p>` 
    : `<h2>${greet}!</h2>`;
}


/**
 * Shows the greeting overlay once per session on mobile devices.
 * Only displays time-based greeting without user name.
 */
function showGreetingOverlay() {
  const greet = getTimeGreeting();
  if (sessionStorage.getItem("overlayShown") || !window.matchMedia("(max-width: 970px)").matches) return;
  showOverlay(greet, null); // Name null → only time greeting
  sessionStorage.setItem("overlayShown", "true");
}


/**
 * Main function to initialize date/time related functionality on page load.
 * Updates greeting label and shows overlay if conditions are met.
 */
function datetimer() {
  updateGreetingLabel();
  showGreetingOverlay();
}


/**
 * Displays a temporary greeting overlay with optional user name.
 * @param {string} greet - The greeting message to display.
 * @param {string|null} userName - Optional user name to include in greeting.
 */
function showOverlay(greet, userName) {
  const overlay = document.getElementById("welcome-overlay");
  const overlayContent = overlay.querySelector(".overlay-content");

  overlayContent.innerHTML = userName
    ? `<h2>${greet},</h2><p class="greet_name">${userName}</p>`
    : `<h2>${greet}!</h2>`;

  overlay.classList.remove("d-none");

  setTimeout(() => {
    overlay.classList.add("d-none");
  }, 3000);
}


/**
 * Loads and renders the header component into the designated container.
 */
function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = getHeaderTemplate();
  }
}


/**
 * Loads and renders the sidebar component into the designated container.
 */
function loadSidebar() {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = getSidebarTemplate();
  }
}


/**
 * Loads the add task page/overlay with user data and task information.
 * Fetches users from the database and renders the add task template.
 * @param {Object} [task={}] - Optional task object for editing existing tasks.
 * @returns {Promise<Object[]>} Array of user objects, or empty array if error occurs.
 */
async function loadAddPage(task = {}) {
  try {
    const res = await fetch(BASE_URL + "/user.json");
    const data = await res.json();
    const usersArray = Object.values(data).filter((user) => user.name);

    let addPageContainer = document.getElementById("add_task_template");
    let addBoardOverlay = document.getElementById("add-task-container");

    if (addPageContainer) {
      addPageContainer.innerHTML = getAddPageTemplate(task, usersArray);
    } else if (addBoardOverlay) {
      addBoardOverlay.innerHTML = getAddPageTemplate(task, usersArray);
    }

    updateAssigneeAvatars();

    return usersArray;
  } catch (error) {
    
    return [];
  }
  }


/**
 * Immediately invoked function expression (IIFE) that handles session-based page protection.
 * Redirects users to login page if accessing protected pages without valid session.
 */
(function() {
    const currentPage = window.location.pathname;
    const protectedPages = [
        'board.html', 
        'contacts.html', 
        'index.html',
        'legal_notice.html',
        'help.html',
        'privacy_policy.html',
        'add_task.html'
    ];
    const isProtectedPage = protectedPages.some(page => 
        currentPage.endsWith(page) || currentPage.includes(page)
    );
    const hasValidSession = sessionStorage.getItem('currentUser') || sessionStorage.getItem('guestUser');
    
    if (isProtectedPage && !hasValidSession) {
        document.documentElement.style.display = 'none';
        window.location.replace("log_in.html");
    }
})();


/**
 * Handles guest user login by setting session storage and redirecting to main page.
 */
function guestLogin() {
    sessionStorage.setItem('guestUser', 'true');
    window.location.href = 'index.html';
}


/**
 * Logs out the current user by clearing session data and redirecting to login page.
 * Prevents browser back navigation to protected pages after logout.
 * @returns {boolean} Always returns false.
 */
function logOut() {
    document.documentElement.style.display = 'none';
    sessionStorage.clear();
    window.location.replace("log_in.html");
    window.addEventListener('popstate', function() {
        window.location.replace("log_in.html");
    });
    
    return false;
}


/**
 * Sets the active navigation item based on the current page URL.
 * Removes existing active classes and adds active class to current page link.
 */
function setActiveNavigation() {
  const navLinks = document.querySelectorAll(".sidebar a");

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // remove active classes
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // find matching link and add active class
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    // check if link matches current page
    if (
      href === currentPage ||
      (currentPage === "" && href === "index.html") ||
      (currentPage === "index.html" && href === "index.html")
    ) {
      link.classList.add("active");
    }
  });
}


/**
 * Closes the add task overlay with animation and resets form state.
 * Clears inputs and validation states before hiding the overlay.
 */
function closeAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const container = document.getElementById("add-task-container");
  container.classList.add("closing");
  overlay.classList.remove("visible");
  clearInputs();
  resetValidationState();
  setTimeout(() => {
    overlay.classList.add("d-none");
    document.body.style.overflow = "auto";
    container.classList.remove("closing");
  }, 500);
} 