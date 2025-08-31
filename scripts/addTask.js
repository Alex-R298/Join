let selectedPriority = "medium";

const priorityConfig = {
  urgent: {
    defaultIcon: "./assets/icons/prio_urgent_red.svg",
    activeIcon: "./assets/icons/prio_urgent_white.svg",
    bg: "#FF3D00",
  },
  medium: {
    defaultIcon: "./assets/icons/prio_medium_orange.svg",
    activeIcon: "./assets/icons/prio_medium_white.svg",
    bg: "#FFA800",
  },
  low: {
    defaultIcon: "./assets/icons/prio_low_green.svg",
    activeIcon: "./assets/icons/prio_low_white.svg",
    bg: "#7AE229",
  },
};

async function fetchBase() {
  try {
    const res = await fetch(BASE_URL + ".json");
    const data = await res.json();
  } catch (err) {
    console.error("Fehler beim Laden:", err);
  }
}

async function addTask() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("task_description").value;
    const dueDate = document.getElementById("datepicker").value;
    const checkedUsers = Array.from(
    document.querySelectorAll('input[type="checkbox"][id^="user-"]:checked')
    ).map(cb => cb.value);

    const category = document.getElementById("category_task").value;
    const subtaskElements = document.querySelectorAll(".subtask-text");
    try {
        if (!checkDate()) {
            throw new Error("Ungültiges Datum");
        }
        const newTask = {
            title,
            description,
            dueDate,
            priority: selectedPriority,
            assignedTo: checkedUsers,
            category,  
            subtaskElements: Array.from(subtaskElements).map(el => ({
                text: el.textContent,
                completed: false
            })),
        };
        const response = await fetch(BASE_URL + "/task.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask),
        });
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();
        console.log("Task gespeichert:", data);
        await renderTasks();
        updateHTML(); 
        showPopup();
    } catch (error) {
        console.error("Fehler beim Speichern der Task:", error);
        showErrorPopup("Fehler beim Speichern der Aufgabe!");
    } finally {
        clearInputs();
    }
}

async function loadTasksDebug() {
  const res = await fetch(BASE_URL + "/task.json");
  const data = await res.json();
}

function activMediumBtn() {
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
    document.getElementById("myList").innerHTML = "";
    const subtaskContainer = document.getElementById("subtask-container");
    if (subtaskContainer) {
        subtaskContainer.innerHTML = "";
    }
  document.getElementById("title").value = "";
  document.getElementById("task_description").value = "";
  document.getElementById("datepicker").value = "";
  document.getElementById("assigned_task").value = "";
  document.getElementById("category_task").value = "";
  document.getElementById("myList").innerHTML = "";
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

function addSubtask() {
  let input = document.getElementById("subtask_input");
  let list = document.getElementById("myList");
  let value = input.value.trim();

  if (value) {
    list.innerHTML += createListItemTemplate(value);
    input.value = "";
  }
  changeButtons();
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

function clearInput() {
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

function handleSubtaskClick(event, li) {
  if (
    event.target.closest(".icon-btn.delete-btn") ||
    event.target.closest(".icon-btn.delete-btn img")
  )
    return;

  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let editImg = editBtn.querySelector("img");

  if (editImg.src.includes("check.svg")) {
    stopEditMode(li);
  } else {
    startEditMode(li);
  }
}

function startEditMode(li) {
  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let deleteBtn = li.querySelector(".icon-btn.delete-btn");
  let separator = li.querySelector(".vl-small");

  let editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/check.svg";
  editImg.alt = "Check";

  let parent = editBtn.parentNode;
  parent.insertBefore(deleteBtn, editBtn);
  parent.insertBefore(separator, editBtn);

  let span = li.querySelector(".subtask-text");
  if (!span) return;

  let input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  li.replaceChild(input, span);
  input.focus();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") saveEdit(input, li);
  });
  input.addEventListener("blur", function () {
    saveEdit(input, li);
  });
}

function stopEditMode(li) {
  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let deleteBtn = li.querySelector(".icon-btn.delete-btn");
  let separator = li.querySelector(".vl-small");

  let editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/edit.svg";
  editImg.alt = "Edit";

  let parent = editBtn.parentNode;

  parent.insertBefore(editBtn, parent.firstChild);
  parent.insertBefore(separator, deleteBtn);

  let input = li.querySelector(".edit-input");
  if (input) saveEdit(input, li);
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

function addSubtaskHoverEffectsWithDelegation() {
  document.body.addEventListener("mouseover", function (e) {
    const subtaskElement = e.target.closest(".subtask-listelement");
    if (subtaskElement) {
      const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
      if (editButtons) {
        editButtons.classList.remove("d-none");
      }
    }
  });

  document.body.addEventListener("mouseout", function (e) {
    const subtaskElement = e.target.closest(".subtask-listelement");
    if (subtaskElement) {
      if (!subtaskElement.contains(e.relatedTarget)) {
        const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
        if (editButtons) {
          editButtons.classList.add("d-none");
        }
      }
    }
  });
}

function updateAssigneeAvatars() {
  const checkedBoxes = document.querySelectorAll(
    '#assignee-dropdown input[type="checkbox"]:checked'
  );
  const avatarsContainer = document.getElementById("assigned-avatars");

  avatarsContainer.innerHTML = "";

  checkedBoxes.forEach((checkbox) => {
    const userItem = checkbox.closest(".assigned-user-item");
    const avatar = userItem.querySelector(".contact-avatar").cloneNode(true);
    avatarsContainer.appendChild(avatar);
  });
}

function filterAssignees(searchTerm) {
  const userItems = document.querySelectorAll(".assigned-user-item");
  const search = searchTerm.toLowerCase();

  userItems.forEach((item) => {
    const name = item.getAttribute("data-name");
    if (name.includes(search)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

function toggleAssigneeDropdown() {
  const dropdown = document.getElementById("assignee-dropdown");
  const arrow = document.querySelector(".dropdown-arrow");
  const input = document.getElementById("assignee-input");
  // show dropdown
  if (dropdown.classList.contains("d-none")) {
    dropdown.classList.remove("d-none");
    arrow.classList.add("open");
    input.removeAttribute("readonly");
    input.focus();
  } else {
    // hide dropdown
    dropdown.classList.add("d-none");
    arrow.classList.remove("open");
    input.setAttribute("readonly", true);
    input.value = "";
    filterAssignees("");
  }
}
