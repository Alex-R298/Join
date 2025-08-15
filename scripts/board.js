let todos = [{
    'id': 0,
    'title': 'Putzen',
    'category': 'toDo'
}, 
{
    'id': 1,
    'title': 'Kochen',
    'category': 'toDo'
},
 {
    'id': 2,
    'title': 'laufen',
    'category': 'inProgress'
},
{
    'id': 3,
    'title': 'bauen',
    'category': 'inProgress'
},
{
    'id': 4,
    'title': 'schwimmen',
    'category': 'awaitFeedback'
},
{
    'id': 5,
    'title': 'gehen',
    'category': 'awaitFeedback'
},
{
    'id': 6,
    'title': 'diesdas',
    'category': 'done'
},
{
    'id': 7,
    'title': 'schlafen',
    'category': 'done'
}
];


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