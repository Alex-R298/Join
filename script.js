async function init() {
  datetimer();
  loadHeader();
  loadSidebar();
  fetchBase();
  loadAddPage();
}

function user_button_show_links() {
  document.getElementById("myPopup").classList.toggle("show");
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
    date.innerHTML = `
      <h2>${greet}</h2>
      <p class="greet_name">and welcome Alex & Marina & Alex 🙂</p>
    `;
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
        
    return usersArray;
  }
