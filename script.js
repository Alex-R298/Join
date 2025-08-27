// async function init() {
//   datetimer();
//   loadHeader();
//   loadSidebar();
//   fetchBase();
//   loadAddPage();
//   renderTasks();
//   activMediumBtn();
// }

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

  setActiveNavigation();

    await loadContacts();
    
    await renderTasks();

    initializeHighlightContainers();
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

function datetimer() {
  let date = document.getElementById("lblGreetings");
  if (date) {
    const myDate = new Date();
    const hrs = myDate.getHours();

    let greet;

    if (hrs < 12) greet = "Good Morning";
    else if (hrs >= 12 && hrs <= 17) greet = "Good Afternoon";
    else if (hrs >= 17 && hrs <= 24) greet = "Good Evening";
    const userName = sessionStorage.getItem('userName');
    if (userName) {
      date.innerHTML = `
        <h2>${greet},</h2>
        <p class="greet_name">${userName}</p>
      `;
      } else {
      date.innerHTML = `
        <h2>${greet}!</h2>
      `;
  }
}

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

async function loadAddPage() {
    const res = await fetch(BASE_URL + "/user.json");
    const data = await res.json();
    const usersArray = Object.values(data).filter(item => item.name);

    let addPageContainer = document.getElementById('add_task_template');
    let addBoardOverlay = document.getElementById("add-task-container");

      if (addPageContainer) {
        addPageContainer.innerHTML = getAddPageTemplate(usersArray)
      } else if (addBoardOverlay) {
        addBoardOverlay.innerHTML = getAddPageTemplate(usersArray);
      }
   return usersArray;
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
