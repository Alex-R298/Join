function init() {
  datetimer();
  loadHeader();
  loadSidebar();
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
  const headerContainer = document.getElementById("header-container");
  if (headerContainer) {
    headerContainer.innerHTML = `
            <header>
                <p>Kanban Project Management Tool</p>
                <div class="header-icons">
                    <div class="help-icon">?</div>
                    <div class="name-icon" onclick="user_button_show_links()">
                        <p>SW</p>
                    </div>
                    <div class="popup">
                        <span class="popuptext" id="myPopup">
                            <a href="help.html">Help</a>
                            <a href="legal_notice.html">Legal Notice</a>
                            <a href="privacy_policy.html">Privacy Policy</a>
                            <a href="log_in.html">Log out</a>
                        </span>
                    </div>
                </div>
            </header>
        `;
  }
}

function loadSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
            <div class="sidebar">
                <div class="side-bar-logo">
                    <img class="side_bar_img" src="./assets/icons/capa_white.svg" alt="">
                </div>
                <div class="sidebar-menu">
                    <a href="index.html"><img src="./assets/icons/summary.svg" alt="">Summary</a>
                    <a href="add_task.html"><img src="./assets/icons/add.svg" alt="">Add Task</a>
                    <a href="board.html"><img src="./assets/icons/board.svg" alt="">Board</a>
                    <a href="contacts.html"><img src="./assets/icons/contacts.svg" alt="">Contacts</a>
                </div>
                <div class="sidebar_footer">
                    <a href="privacy_policy.html">Privacy Policy</a>
                    <a href="legal_notice.html">Legal notice</a>
                </div>
            </div>
        `;
  }
}
