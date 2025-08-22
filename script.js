async function init() {
  datetimer();
  loadHeader();
  loadSidebar();
  fetchBase();
  loadAddPage();
  renderTasks();
  activMediumBtn();
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

        console.log("info", data);
        
   return usersArray;
  }
