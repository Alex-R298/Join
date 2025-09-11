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
     
  if (typeof fetchBase === 'function') {
    fetchBase();
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
}


function user_button_show_links() {
  document.getElementById("myPopup").classList.toggle("show");
}


function getInitials(name) {
    return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
}

/**
 * Returns a greeting based on current time.
 * @returns {string} "Good Morning/Afternoon/Evening"
 */
function getTimeGreeting() {
  const hrs = new Date().getHours();
  if (hrs < 12) return "Good Morning";
  if (hrs <= 17) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Updates the greeting label (#lblGreetings) with name if available.
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
 * Shows the overlay once per session (only time greeting, no name).
 */
function showGreetingOverlay() {
  const greet = getTimeGreeting();
  if (sessionStorage.getItem("overlayShown") || !window.matchMedia("(max-width: 970px)").matches) return;
  showOverlay(greet, null); // Name null → nur Zeitgruß
  sessionStorage.setItem("overlayShown", "true");
}

/**
 * Main function to call on page load.
 */
function datetimer() {
  updateGreetingLabel();
  showGreetingOverlay();
}


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


function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.innerHTML = getHeaderTemplate();
  }
}


function loadSidebar() {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = getSidebarTemplate();
  }
}


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



// (function() {
//     const currentPage = window.location.pathname;
//     const protectedPages = [
//         'board.html', 
//         'contacts.html', 
//         'index.html',
//         'legal_notice.html',
//         'help.html',
//         'privacy_policy.html',
//         'add_task.html'
//     ];
    
//     const isProtectedPage = protectedPages.some(page => 
//         currentPage.endsWith(page) || currentPage.includes(page)
//     );
    

//     if (isProtectedPage && !sessionStorage.getItem('currentUser')) {
//         document.documentElement.style.display = 'none';
//         window.location.replace("log_in.html");
//     }
// })();



function logOut() {
    document.documentElement.style.display = 'none';
    sessionStorage.clear();
    window.location.replace("log_in.html");
    window.addEventListener('popstate', function() {
        window.location.replace("log_in.html");
    });
    
    return false;
}


// document.addEventListener('DOMContentLoaded', function() {
//     const currentPage = window.location.pathname;
//     const protectedPages = [
//         'board.html', 
//         'contacts.html', 
//         'index.html',
//         'legal_notice.html',
//         'help.html',
//         'privacy_policy.html',
//         'add_task.html'
//     ];
    
//     const isProtectedPage = protectedPages.some(page => 
//         currentPage.endsWith(page) || currentPage.includes(page)
//     );
    
//     if (isProtectedPage && !sessionStorage.getItem('currentUser')) {
//         window.location.replace("log_in.html");
//     }
// });

function setActiveNavigation() {
  const navLinks = document.querySelectorAll(".sidebar a");

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // remove active
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // find link and add active
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    // is link current page?
    if (
      href === currentPage ||
      (currentPage === "" && href === "index.html") ||
      (currentPage === "index.html" && href === "index.html")
    ) {
      link.classList.add("active");
    }
  });
}

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
