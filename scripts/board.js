
// To do / In progress / Await feedback / Done


let currentDraggedElement;

function updateHTML() {
  const categories = ["toDo", "inProgress", "awaitFeedback", "done"];
  categories.forEach(cat => {
    const container = document.getElementById(cat);
    container.innerHTML = "";
    todos.filter(t => t.category === cat)
         .forEach(todo => container.innerHTML += generateTodoHTML(todo));
  });
}

function startDragging(id) {
    currentDraggedElement = id;
}

function generateTodoHTML(element) {
    return `<div draggable="true" ondragstart="startDragging(${element['id']})" class="todo">${element['title']}</div>`;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(category) {
    todos[currentDraggedElement]['category'] = category;
    updateHTML();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

async function loadUsers() {
    const res = await fetch(BASE_URL + "/user.json");
    const data = await res.json();

    return Object.values(data).filter((user) => user.name);
}

async function loadTasks() {
  const res = await fetch(BASE_URL + "/task.json");
  const data = await res.json();

   console.log("Tasks geladen:", data); // prüfen, was zurückkommt

   if (!data) return [];

  // Alle Tasks in ein Array umwandeln
  const tasks = Object.entries(data).map(([id, task]) => ({ id, ...task }));
  return tasks;
}

function getBadgeData(task) {
    const category = task.category || "unknown"; 
  // Text für das Badge: Bindestriche → Leerzeichen, jedes Wort groß
  const text = category
    .replace(/-/g, " ")                       // Bindestriche zu Leerzeichen
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // CSS-Klasse: alles klein, Leerzeichen durch Bindestriche ersetzen
  const className = category.toLowerCase().replace(/\s+/g, "-");

  return { text, className };
}

async function renderTasks() {
  const taskBoard = document.getElementById("toDo");
  const tasks = await loadTasks();

  taskBoard.innerHTML = tasks.map(taskOnBoardTemplate).join("");
    tasks.forEach((task) => {
      renderAssignedAvatarData(task.assignedTo, task.id);
    });
}

let contactsMap = {};

async function loadContacts() {
  const res = await fetch(BASE_URL + "/user.json");
  const data = await res.json();

  // Map: email -> contact
  contactsMap = Object.values(data || {}).reduce((acc, contact) => {
    acc[contact.email] = contact;
    return acc;
  }, {});
}

function renderAssignedAvatar(email) {
  if (!email) return ""; // if no mail, then there's no avatar

  const contact = contactsMap[email]; // get contact via email
  const name = contact ? contact.name : email.split("@")[0];

  const initials = getInitials(name);
  const color = getAvatarColor(name);

  return { initials, color };
}

function renderAssignedAvatarData(email, taskId) {
  if (!email) return ""; // if there's no assignedTo
  const { initials, color } = renderAssignedAvatar(email);
  const container = document.getElementById(`editor-${taskId}`);

  if (container) {
    container.innerHTML += `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`;
  }
}

function getPriorityIcon(priority) {
  if (!priority) return "";
  return `./assets/icons/prio_${priority}_${priority === "urgent" ? "red" : priority === "medium" ? "orange" : "green"}.svg`;
}

async function showAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    const container = document.getElementById("add-task-container");
    
    const usersArray = await loadUsers();
    
    overlay.classList.remove("d-none");
    document.body.style.overflow = "hidden";
    
    container.innerHTML = getAddPageTemplate(usersArray);
    document.getElementById("btn-overlay-close").classList.remove("d-none");
    
    container.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("click", closeAddTaskOverlay);
}

function closeAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    overlay.classList.add("d-none");
    document.body.style.overflow = "auto";
}