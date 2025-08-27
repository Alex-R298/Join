let selectedPriority = "medium";

const priorityConfig = {
  urgent: {
    defaultIcon: "./assets/icons/prio_urgent_red.svg",
    activeIcon: "./assets/icons/prio_urgent_white.svg",
    bg: "#FF3D00"
  },
  medium: {
    defaultIcon: "./assets/icons/prio_medium_orange.svg",
    activeIcon: "./assets/icons/prio_medium_white.svg",
    bg: "#FFA800"
  },
  low: {
    defaultIcon: "./assets/icons/prio_low_green.svg",
    activeIcon: "./assets/icons/prio_low_white.svg",
    bg: "#7AE229"
  }
};


async function fetchBase() {
  try {
    const res = await fetch(BASE_URL + ".json");
    const data = await res.json();
    console.log(data);
    console.log("Aktuelle Tasks:", data);
  } catch (err) {
    console.error("Fehler beim Laden:", err);
  }
}

async function addTask() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("task_description").value;
  const dueDate = document.getElementById("datepicker").value;
  const assignedTo = document.getElementById("assigned_task").value;
  const category = document.getElementById("category_task").value;

  try {
    // validate date
    if (!checkDate()) {
      throw new Error("Ungültiges Datum");
    }
    // Perform more validations

    const newTask = {
      title,
      description,
      dueDate,
      priority: selectedPriority,
      assignedTo,
      category,
    };

    // Wait for POST-Request
    const response = await fetch(BASE_URL + "/task.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    // Wait for JSON-Response
    const data = await response.json();

    console.log("Task gespeichert:", data);
    showPopup();
  } catch (error) {
    console.error("Fehler beim Speichern der Task:", error);
    showErrorPopup("Fehler beim Speichern der Aufgabe!");
  } finally {
    clearInputs();
  }
}

async function loadTasksDebug(){
  const res = await fetch(BASE_URL + "/task.json");
  const data = await res.json();
  // console.log(data);
}

function activMediumBtn(){
  document.addEventListener("DOMContentLoaded", () => {
  selectPriority(document.querySelector('[data-priority="medium"]'));
});

}

function selectPriority(button) {
  const buttons = document.querySelectorAll(".priority-btn");

  buttons.forEach((btn) => {
    const confi = priorityConfig[btn.dataset.priority];
    btn.classList.remove("active");
    btn.style.backgroundColor = "";
    btn.style.color = "";
    btn.querySelector("img").src = confi.defaultIcon;
  });

  const confi = priorityConfig[button.dataset.priority];
  button.classList.add("active");
  button.style.backgroundColor = confi.bg;
  button.style.color = "white";
  button.querySelector("img").src = confi.activeIcon;

  selectedPriority = button.dataset.priority;
}


async function clearInputs() {
  document.getElementById("title").value = "";
  document.getElementById("task_description").value = "";
  document.getElementById("datepicker").value = ""; 
  document.getElementById("assigned_task").value = "";   
  document.getElementById("category_task").value = "";
}

function showPopup() {
  document.getElementById("taskPopup").style.display = "flex";

  setTimeout(() => {
    closePopup();
  }, 1500);
}

function closePopup() {
  document.getElementById("taskPopup").style.display = "none";
}

function getTodaysDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function setMinDate() {
  const dateInput = document.getElementById("datepicker");
  dateInput.min = getTodaysDate();
}

function checkDate() {
  const dateRef = document.getElementById("datepicker");
  const errorDateRef = document.getElementById("date-error-message");
  const inputValue = dateRef.value.trim();
  const todayStr = getTodaysDate();

  if (!inputValue || inputValue < todayStr) {
    dateRef.classList.add("invalid");
    errorDateRef.classList.remove("d-none");
    return false;
  } else {
    dateRef.classList.remove("invalid");
    errorDateRef.classList.add("d-none");
    return true;
  }
}

// Subtask


function createListItem(value) {
  return `
    <li class="subtask-item">
      <span class="subtask-text">${value}</span>
      <div class="subtask-actions">
        <button class="edit-btn" onclick="editSubtask(this)">✎</button>
        <button class="delete-btn" onclick="deleteSubtask(this)">🗑</button>
      </div>
    </li>`; 
}

function addSubtask(){
  let input = document.getElementById("subtask_input");
  let list = document.getElementById("myList");
  let value = input.value.trim();

  if (value) {
    list.innerHTML += createListItem(value)
    input.value = "";
  }
}

function changeButtons() {
  let acceptButton = document.getElementById("acceptButton");
  let addButton = document.getElementById("addButton");
  let clearButton = document.getElementById("clearButton");
  let input = document.getElementById("subtask_input");

  if (input.value.trim() !== "") {
    addButton.style.display = "none";
    acceptButton.style.display = "inline-block";
    clearButton.style.display = "inline-block";
  } else {
    addButton.style.display = "inline-block";
    acceptButton.style.display = "none";
    clearButton.style.display = "none";
  }
}

function clearInput(){
  let input = document.getElementById("subtask_input");
  input.value = "";
  changeButtons();
}

function editSubtask(button) {
  let li = button.closest("li");
  let span = li.querySelector(".subtask-text");

  let input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;  
  input.className = "edit-input";

  
  li.replaceChild(input, span);
  input.focus();

  
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      saveEdit(input, li);
    }
  });

  
  input.addEventListener("blur", function () {
    saveEdit(input, li);
  });
}

function saveEdit(input, li) {
  let newValue = input.value.trim();
  if (newValue !== "") {
    let span = document.createElement("span");
    span.className = "subtask-text";
    span.textContent = newValue;
    li.replaceChild(span, input);
  } else {
    
    li.remove();
  }
}
function deleteSubtask(button) {
  let li = button.closest("li"); 
  if (li) li.remove();
}