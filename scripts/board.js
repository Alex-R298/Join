
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

async function showAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    const container = document.getElementById("add-task-container");
    
    const usersArray = await loadUsers();

    overlay.classList.remove("d-none");
    document.body.style.overflow = "hidden";

    container.innerHTML = getAddPageTemplate(usersArray);
    
    container.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("click", closeAddTaskOverlay);
}

function closeAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    overlay.classList.add("d-none");
    document.body.style.overflow = "auto";
}