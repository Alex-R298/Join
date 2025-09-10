
// To do / In progress / Await feedback / Done

let allTasks = [];



// Live Search Funktionnen 
function liveSearchBoards() {
    let input = document.getElementById('searchInputBoards');

    input.addEventListener('input', async () => {
        const query = input.value.trim().toLowerCase();
        if (query.length < 2) {
            await loadTasks();
            updateHTML();
        } else {
            await filterTasks(query);
        }
    });
}


async function filterTasks(query) {
    let filteredTasks = allTasks.filter(task => {
        let title = task.title.toLowerCase();
        return title.includes(query);
    });
    updateHTML(filteredTasks);
    filteredTasks.forEach(task => {
        const progressData = calculateSubtaskProgress(task);
        const progressBar = document.querySelector(`[id="task-${task.id}"] .progress`);
        const progressText = document.querySelector(`[id="task-${task.id}"] .subtasks`);
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progressData.progressPercent}%`;
            progressText.textContent = progressData.progressText;
        }
    });
}
// Ende! 

async function resetTaskStatus() {
  try {
    const res = await fetch(BASE_URL + "/task.json");
    const data = await res.json();
    
    if (!data) return;
    allTasks = allTasks.map(task => {
      if (data[task.id]) {
        return {
          ...task,
          status: data[task.id].status
        };
      }
      return task;
    });
    
   // console.log("Task-Kategorien zurückgesetzt:", allTasks);
    updateHTML();
  } catch (error) {
    console.error("Fehler beim Zurücksetzen der Kategorien:", error);
  }
}

function clearAllContainers() {
    const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    });
}


function updateHTML(tasks = allTasks) {
    ["toDo", "inProgress", "awaitFeedback", "done"].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const tasksForContainer = tasks.filter(task => task.status === containerId);
        const placeholder = container.querySelector('.drag-placeholder');
        container.innerHTML = '';

        if (tasksForContainer.length === 0) {
            container.innerHTML = `<div class="empty-container"><p class="empty-container-text">${getEmptyText(containerId)}</p></div>`;
        } else {
            tasksForContainer.forEach(task => {
                container.insertAdjacentHTML('beforeend', taskOnBoardTemplate(task));
                if (Array.isArray(task.assignedTo)) {
                    task.assignedTo.forEach(email => {
                        renderAssignedUserData(email, task.id);
                    });
                }
            });
        }

        if (placeholder) container.appendChild(placeholder);
    });
}



function getEmptyText(containerId) {
    const texts = {
        'toDo': 'No Tasks To Do',
        'inProgress': 'No Tasks In Progress',
        'awaitFeedback': 'No Tasks Await Feedback',
        'done': 'No Tasks Done'
    };
    return texts[containerId] || `No Tasks ${containerId}`;
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



function renderTasksInContainer(container, tasks) {
    const placeholder = container.querySelector('.drag-placeholder');
    container.innerHTML = '';
    tasks.forEach(task => {
        container.insertAdjacentHTML('beforeend', taskOnBoardTemplate(task));
        if (task.assignedTo) {
            const editorContainer = document.getElementById(`editor-${task.id}`);
            if (editorContainer) {
                editorContainer.innerHTML = "";
                renderAssignedUserData(task.assignedTo, task.id);
            }
        }
    });
    if (placeholder) container.appendChild(placeholder);
}



function parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}


function updateEmptyContainers() {
    ["toDo", "inProgress", "awaitFeedback", "done"].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const hasTasks = container.querySelector('.task-container');
        const emptyContainer = container.querySelector('.empty-container');
        if (!hasTasks && !emptyContainer) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-container';
            emptyDiv.innerHTML = `<p class="empty-container-text">${getEmptyText(containerId)}</p>`;
            container.appendChild(emptyDiv);
        } else if (!hasTasks && emptyContainer) {
            emptyContainer.style.display = 'flex';
        } else if (hasTasks && emptyContainer) {
            emptyContainer.remove();
        }
    });
}



function updateContainer(status) {
  const container = document.getElementById(status);
  if (!container) {
    console.error(`Container mit ID ${status} nicht gefunden`);
    return;
  }
  container.innerHTML = "";
  const tasksInStatus = allTasks.filter(t => t.status === status);
   
   //console.log(`Tasks in Kategorie ${status} nach Update:`, tasksInStatus.length);
  tasksInStatus.forEach(todo => {
    container.innerHTML += taskOnBoardTemplate(todo);
  });
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
      const category = task.category;
      const status = task.status  || "toDo";
      if (task.subtaskElements && typeof task.subtaskElements[0] === 'string') {
                task.subtaskElements = task.subtaskElements.map(text => ({
                    text: text,
                    completed: false
                }));
            }
      return {
        id,
        ...task,
        category,
        status,
      };
    });
    
    return tasks;
  } catch (error) {
    return [];
  }
}


async function toggleSubtask(taskId, subtaskIndex) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    if (typeof task.subtaskElements[0] === 'string') {
        task.subtaskElements = task.subtaskElements.map(text => ({
            text: text,
            completed: false
        }));
    }
    task.subtaskElements[subtaskIndex].completed = !task.subtaskElements[subtaskIndex].completed;
    await saveTaskToFirebase(task);
    const progressData = calculateSubtaskProgress(task);
    const progressBar = document.querySelector(`[id="task-${task.id}"] .progress`);
    const progressText = document.querySelector(`[id="task-${task.id}"] .subtasks`);
    if (progressBar && progressText) {
        progressBar.style.transition = 'width 0.3s ease';
        progressBar.style.width = `${progressData.progressPercent}%`;
        progressText.textContent = progressData.progressText;
    }
}


function getCategoryData(task) {
    
  const category = task.category;
   
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
    updateHTML();
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


// function renderAssignedUser(email) {
//     if (!email) return ""; // if no mail, then there's no avatar

//     const contact = contactsMap[email]; // get contact via email
//     const userName = contact ? contact.name : email.split("@")[0];

//     const name = getName(userName);
//     const initials = getInitials(name);
//     const color = getAvatarColor(name);

//     return { initials, color, name };
// }

function renderAssignedUser(email) {
    if (typeof email !== 'string' || !email) {
        console.warn('Invalid or missing email:', email);
        return { initials: '??', color: '#ccc', name: 'Unknown' };
    }

    const contact = contactsMap[email];
    const userName = contact ? contact.name : email.split('@')[0];

    const name = getName(userName);
    const initials = getInitials(name);
    const color = getAvatarColor(name);

    return { initials, color, name };
}



// function renderAssignedUserData(email, taskId) {
//   if (!email) return ""; // if there's no assignedTo
//   const { initials, color } = renderAssignedUser(email);
//   const container = document.getElementById(`editor-${taskId}`);

//   if (container) {
//     container.innerHTML += `<div class="editor-avatar" style="background-color:${color}">${initials}</div>`;
//   }
// }

function renderAssignedUserData(email, taskId) {
    if (typeof email !== 'string' || !email) {
        console.warn('Invalid or missing email in renderAssignedUserData:', email);
        return "";
    }

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


async function showAddTaskOverlay(status = 'toDo') {
  currentTaskStatus = status;
  const overlay = document.getElementById("add-task-overlay");
  const container = document.getElementById("add-task-container");
  
  overlay.classList.remove("d-none");
  document.body.style.overflow = "hidden";
   document.body.classList.add("no-markers");
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
    document.body.classList.add("no-markers"); 
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
        document.body.classList.remove("no-markers");
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

function calculateSubtaskProgress(task) {
  // are there subtasks?
  const subtasks = task.subtaskElements || task.subTasks;

  // if there are no subtasks
  if (!subtasks || subtasks.length === 0) {
    return {
      progressPercent: 0,
      progressText: "No Subtasks",
      progressClass: "d-none",
    };
  }

  const total = subtasks.length;
  const done = subtasks.filter((subtask) => subtask.completed === true).length;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;
  const progressText = `${done}/${total} Subtasks`;

  return {
    progressPercent,
    progressText,
    progressClass: "task-progress",
  };
}