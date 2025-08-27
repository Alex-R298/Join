
// To do / In progress / Await feedback / Done

let currentDraggedElement = null;
let draggedTaskHeight = 0;
let removedTaskElement = null;
let allTasks = [];

async function resetTaskCategories() {
  try {
    const res = await fetch(BASE_URL + "/task.json");
    const data = await res.json();
    
    if (!data) return;
    allTasks = allTasks.map(task => {
      if (data[task.id]) {
        return {
          ...task,
          category: data[task.id].category
        };
      }
      return task;
    });
    
    console.log("Task-Kategorien zurückgesetzt:", allTasks);
    updateHTML();
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Kategorien:", error);
  }
}


function updateHTML() {
  const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const highlightContainer = document.getElementById(`highlight-${containerId}`);
    if (highlightContainer && container.contains(highlightContainer)) {
      container.removeChild(highlightContainer);
    }
    container.innerHTML = "";
    const tasksForContainer = allTasks.filter(task => task.category === containerId);
    if (tasksForContainer.length === 0) {
      renderEmptyContainer(container, containerId);
    } else {
      renderTasksInContainer(container, tasksForContainer);
    }
    if (highlightContainer) {
      container.appendChild(highlightContainer);
    }
  });
}

function renderTasksInContainer(container, tasks) {
  tasks.forEach(task => {
    container.innerHTML += taskOnBoardTemplate(task);
  });
  
  tasks.forEach(task => {
    if (task.assignedTo) {
      const editorContainer = document.getElementById(`editor-${task.id}`);
      if (editorContainer) {
        editorContainer.innerHTML = "";
        renderAssignedUserData(task.assignedTo, task.id);
      }
    }
  });
}


function renderEmptyContainer(container, containerId) {
  let displayText;
  
  switch (containerId) {
    case 'toDo':
      displayText = 'No Tasks To Do';
      break;
    case 'inProgress':
      displayText = 'No Tasks Progress';
      break;
    case 'awaitFeedback':
      displayText = 'No Tasks Await Feedback';
      break;
    case 'done':
      displayText = 'No Tasks Done';
      break;
    default:
      displayText = `No Tasks ${containerId}`;
  }
  
  container.innerHTML = `
    <div class="empty-container">
      <p class="empty-container-text">${displayText}</p>
    </div>`;
}


function allowDrop(event) {
  event.preventDefault();
}



async function moveTo(category, event) {
    event.preventDefault();
    let taskId;
    if (event.dataTransfer) {
        taskId = event.dataTransfer.getData('text/plain');
    } else {
        taskId = currentDraggedElement;
    }
    if (!taskId) {
        return;
    }
    try {
        const taskIndex = allTasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return;
        }
        allTasks[taskIndex].category = category;
        updateHTML();
        const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
        containers.forEach(id => removeHighlight(id));
        if (isLocalStorageAvailable()) {
            saveCategoriesToLocalStorage();
        } else {
            try {
                await saveTaskToFirebase(taskId, category);
            } catch (error) {
            }
        }
        if (typeof updateDashboardCounts === 'function') {
            updateDashboardCounts();
        }
    } catch (error) {
    } finally {
        currentDraggedElement = null;
    }
}


function updateContainer(category) {
  const container = document.getElementById(category);
  if (!container) {
    console.error(`Container mit ID ${category} nicht gefunden`);
    return;
  }
  container.innerHTML = "";
  const tasksInCategory = allTasks.filter(t => t.category === category);
  console.log(`Tasks in Kategorie ${category} nach Update:`, tasksInCategory.length);
  tasksInCategory.forEach(todo => {
    container.innerHTML += taskOnBoardTemplate(todo);
  });
}


function startDragging(id, event) {
    currentDraggedElement = id;
    const taskIndex = allTasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        originalTaskCategory = allTasks[taskIndex].category;
    }
    const taskElement = event.target.closest('.task-container');
    if (taskElement) {
        draggedTaskHeight = taskElement.offsetHeight;
        if (event.dataTransfer) {
            event.dataTransfer.setDragImage(taskElement, 0, 0);
        }
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', id);
        }
        setTimeout(() => {
            if (currentDraggedElement === id) {
                removedTaskElement = taskElement;
                if (taskElement.parentNode) {
                    taskElement.parentNode.removeChild(taskElement);
                }
            }
        }, 1);
    }
}


function cancelDragging() {
    if (currentDraggedElement && removedTaskElement) {
        const container = document.getElementById(originalTaskCategory);
        if (container) {
            container.appendChild(removedTaskElement);
        }
        
        removedTaskElement = null;
    }
    const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
    containers.forEach(id => removeHighlight(id));
    currentDraggedElement = null;
    originalTaskCategory = null;
}


function initializeHighlightContainers() {
  const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    let existingHighlight = document.getElementById(`highlight-${containerId}`);
    if (existingHighlight) {
      return;
    }
    const highlightContainer = document.createElement('div');
    highlightContainer.className = 'highlight-container';
    highlightContainer.id = `highlight-${containerId}`;
    highlightContainer.style.width = '100%';
    highlightContainer.style.border = '1px dashed #a8a8a8';
    highlightContainer.style.borderRadius = '24px';
    highlightContainer.style.backgroundColor = '#e7e7e7';
    highlightContainer.style.margin = '10px 0';
    highlightContainer.style.animation = 'pulse 1.5s infinite';
    highlightContainer.style.height = '100px';
    highlightContainer.style.display = 'none';
    highlightContainer.style.justifyContent = 'center';
    highlightContainer.style.alignItems = 'center';
    highlightContainer.style.pointerEvents = 'none';
    container.appendChild(highlightContainer);
  });
}


function highlight(id) {
  const highlightContainer = document.getElementById(`highlight-${id}`);
  if (highlightContainer) {
    highlightContainer.style.height = draggedTaskHeight > 0 ? `${draggedTaskHeight}px` : '100px';
    highlightContainer.style.display = 'flex';
  }
}

function removeHighlight(id) {
  const highlightContainer = document.getElementById(`highlight-${id}`);
  if (highlightContainer) {
    highlightContainer.style.display = 'none';
  }
}


async function loadUsers() {
    const res = await fetch(BASE_URL + "/user.json");
    const data = await res.json();
    return Object.values(data).filter((user) => user.name);
}


async function loadTasks() {
  try {
    const res = await fetch(BASE_URL + "/task.json");
    const data = await res.json();
    if (!data) return [];
    const tasks = Object.entries(data).map(([id, task]) => {
      const originalCategory = task.category;
      const normalizedCategory = normalizeCategory(originalCategory);
      
      return {
        id,
        ...task,
        category: normalizedCategory,
        originalCategory: originalCategory
      };
    });
    
    return tasks;
  } catch (error) {
    return [];
  }
}


function normalizeCategory(category) {
  if (category === 'technical-task' || category === 'user-story') {
    return 'toDo';
  }
  if (!['toDo', 'inProgress', 'awaitFeedback', 'done'].includes(category)) {
    return 'toDo';
  }
  return category;
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
  try {
    const tasks = await loadTasks();
    allTasks = tasks;
    await setSpecialCategories();
    if (typeof updateDashboardCounts === 'function') {
      updateDashboardCounts();
    }
  } catch (error) {
  }
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


function getName(userName) {
  if (!userName) return "";

  const cleaned = userName.replace(/[._]/g, " ");

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


function renderAssignedUser(email) {
    if (!email) return ""; // if no mail, then there's no avatar

    const contact = contactsMap[email]; // get contact via email
    const userName = contact ? contact.name : email.split("@")[0];

    const name = getName(userName);
    const initials = getInitials(name);
    const color = getAvatarColor(name);

    return { initials, color, name };
}


function renderAssignedUserData(email, taskId) {
  if (!email) return ""; // if there's no assignedTo
  const { initials, color } = renderAssignedUser(email);
  const container = document.getElementById(`editor-${taskId}`);

  if (container) {
    container.innerHTML += `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`;
  }
}


function getPriorityData(priority) {
  if (!priority) return { text: "", icon: "" };

  const colors = {
    urgent: "red",
    medium: "orange",
    low: "green",
  };

  const text = priority.charAt(0).toUpperCase() + priority.slice(1);

  const icon = `./assets/icons/prio_${priority}_${colors[priority]}.svg`;

  return { text, icon };
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

    setTimeout(() => {
        overlay.classList.add("visible");
    }, 10);
}

function openTaskOverlay(taskId) {
    const overlay = document.getElementById("detailed-task-overlay");
    const container = document.getElementById("task-detail-container");
    const task = allTasks.find((t) => t.id === taskId); // tasks ist dein Array aus Firebase

    if (!task) return;

    overlay.classList.remove("d-none");
    container.innerHTML = taskDetailOverlayTemplate(task);

    container.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("click", closeTaskOverlay);

    setTimeout(() => {
        overlay.classList.add("visible");
    }, 10);
}


function closeTaskOverlay() {
    const overlay = document.getElementById("detailed-task-overlay");
    const container = document.getElementById("task-detail-container");
    container.classList.add("closing");
    overlay.classList.remove("visible");
    setTimeout(() => {
        overlay.classList.add("d-none");
        document.body.style.overflow = "auto";
        container.classList.remove("closing");
    }, 500);
}


function closeAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    const container = document.getElementById("add-task-container");
    container.classList.add("closing");
    overlay.classList.remove("visible");
    setTimeout(() => {
        overlay.classList.add("d-none");
        document.body.style.overflow = "auto";
        container.classList.remove("closing");
    }, 500);
}

function formatDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}