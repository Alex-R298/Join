let selectedPriority = "medium";
let currentTaskStatus = "toDo";
let selectedCategory = null;
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


/**
 * Sets the current task status to the specified value.
 * @param {string} status - The new status of the task (e.g., "toDo", "inProgress", "done").
 */
function saveTaskStatusToFirebase(status) {
    currentTaskStatus = status;
}


/**
 * Reads all values from the add-task form.
 * @returns {{title: string, description: string, dueDate: string, category: string, checkedUsers: string[], subtaskElements: Object[]}} Form data containing title, description, date, category, users, and subtasks.
 */
function getFormValues() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("task_description").value,
    dueDate: document.getElementById("datepicker").value,
    category: document.getElementById("category_task").value,
    assignedTo: Array.from(
      document.querySelectorAll('input[type="checkbox"][id^="user-"]:checked')
    ).map(cb => cb.value),
    subtaskElements: getSubtasks(),
    priority: selectedPriority,
    status: currentTaskStatus,
  };
}


/**
 * Reads all subtasks from the DOM and returns them in normalized format.
 * @returns {Object[]} Array of subtask objects with text and completed properties.
 */
function getSubtasks() {
  const list = document.getElementById("myList");
  if (!list) return [];
  return Array.from(list.querySelectorAll(".subtask-text")).map(el => ({
    text: el.textContent,
    completed: false
  }));
}


/**
 * Adds a new task, saves it to the database, and updates the UI.
 * @returns {Promise<void>}
 */
async function addTask() {
  if (!checkDate()) return;
  const newTask = getFormValues();
  await postTaskData(newTask);
  await renderTasks();
  updateHTML();
  if (document.getElementById("add-task-overlay")) {
    closeAddTaskOverlay();
  }
  showPopup();
  clearInputs();
}


/**
 * Activates the medium priority button by default when the DOM is loaded.
 */
function activMediumBtn() {
  document.addEventListener("DOMContentLoaded", () => {
    selectPriority(document.querySelector('[data-priority="medium"]'));
  });
}


/**
 * Selects a priority level and updates the UI accordingly.
 * Removes any existing selection and highlights the newly selected priority.
 * @param {HTMLElement} button - The button element corresponding to the priority.
 */
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


/**
 * Returns today's date in YYYY-MM-DD format.
 * @returns {string} Today's date as a string.
 */
function getTodaysDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}


/**
 * Sets the minimum selectable date in the date picker to today.
 */
function setMinDate() {
  const dateInput = document.getElementById("datepicker");
  dateInput.min = getTodaysDate();
}


/**
 * Validates all required form fields.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function validateAddTask() {
    const isTitleValid = checkTitle();
    const isDateValid = checkDate();
    const isCategoryValid = checkCategory();
    return isTitleValid && isDateValid && isCategoryValid;
}



/**
 * Rendert ein einzelnes Avatar-Element und hängt es in den Container.
 * @param {HTMLInputElement} checkbox - Die Checkbox, von der das Avatar kommt.
 * @param {HTMLElement} container - Der Container, in den das Avatar eingefügt wird.
 */
function renderAvatar(checkbox, container) {
  const userItem = checkbox.closest(".assigned-user-item");
  if (!userItem) return;
  const avatar = userItem.querySelector(".contact-avatar").cloneNode(true);
  container.appendChild(avatar);
}


/**
 * Rendert bis zu drei Avatare sowie ggf. ein "mehr"-Avatar.
 * @param {string} checkboxSelector - CSS-Selector für die Checkboxen.
 * @param {string} containerId - ID des Containers für die Avatare.
 */
function renderAvatars(checkboxSelector, containerId) {
  const checkedBoxes = getCheckedBoxes(checkboxSelector);
  const avatarsContainer = document.getElementById(containerId);
  if (!avatarsContainer) return;

  avatarsContainer.innerHTML = "";
  checkedBoxes.forEach((box, i) => i < 3 && renderAvatar(box, avatarsContainer));

  if (checkedBoxes.length > 3) {
    const moreAvatar = document.createElement("div");
    moreAvatar.className = "contact-avatar more-avatar";
    moreAvatar.textContent = `+${checkedBoxes.length - 3}`;
    avatarsContainer.appendChild(moreAvatar);
  }
}


/**
 * Aktualisiert die Avatar-Anzeige im "Assignee"-Bereich,
 * basierend auf den im Dropdown ausgewählten Checkboxen.
 */
function updateAssigneeAvatars() {
  renderAvatars('#assignee-dropdown input[type="checkbox"]', "assigned-avatars");
}


/**
 * Aktualisiert die Avatar-Anzeige im "Edit-Assignee"-Bereich,
 * basierend auf den im Dropdown ausgewählten Checkboxen.
 */
function updateEditAssignedAvatars() {
  renderAvatars('#edit-user-dropdown input[type="checkbox"]', "edit-assigned-avatars");
}


/**
 * Toggles the selection state of a user checkbox
 * @param {string} email - The email of the user to toggle selection for
 */
function toggleUserSelection(email) {
    const checkbox = document.getElementById("user-" + email);
    checkbox.checked = !checkbox.checked;
    const userItem = checkbox.closest(".assigned-user-item");
    const checkboxCustom = checkbox.parentNode.querySelector(".checkbox-custom");
    if (checkbox.checked) {
        userItem.classList.add("active");
        checkboxCustom.classList.add("active");
    } else {
        userItem.classList.remove("active");
        checkboxCustom.classList.remove("active");
    }
    updateAssigneeAvatars();
}


/**
 * Filters the assignee list based on the provided search term.
 * @param {string} searchTerm - The search term to filter assignees by.
 */
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


/**
 * Opens or closes the assignee dropdown.
 * - Hides the category dropdown when it is opened.
 * - Makes the input focusable as soon as the dropdown is open.
 * - Closes the dropdown via closeAssigneeDropdown() if it is already open.
 */
function toggleAssigneeDropdown() {
  const dropdown = document.getElementById("assignee-dropdown");
  const arrow = document.querySelector(".dropdown-arrow");
  const input = document.getElementById("assignee-input");
  const categoryDropdown = document.getElementById("category-dropdown");

  if (dropdown.classList.contains("d-none")) {
    dropdown.classList.remove("d-none");
    categoryDropdown.classList.add("d-none");
    arrow.classList.add("open");
    input.removeAttribute("readonly");
    input.focus();
  } else {
    closeAssigneeDropdown();
  }
}


/**
 * Closes the assignee dropdown and resets the state.
 * - Re-enables the readonly mode for the input field.
 * - Clears the input field.
 * - Calls filterAssignees("") to reset filters.
 */
function closeAssigneeDropdown() {
  const categoryDropdown = document.getElementById("category-dropdown");
  categoryDropdown.classList.add("d-none");
  document.getElementById("category-select").classList.remove("category-select-active");
  document.querySelector(".arrow-category").classList.remove("open");

  const dropdown = document.getElementById("assignee-dropdown");
  const arrow = document.querySelector(".dropdown-arrow");
  const input = document.getElementById("assignee-input");

  dropdown.classList.add("d-none");
  arrow.classList.remove("open");
  input.setAttribute("readonly", true);
  input.value = "";
  filterAssignees("");
}


/**
 * Closes the assignee dropdown when clicking outside.
 * @param {MouseEvent} event - The click event on the document.
 */
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById("assignee-dropdown");
  const assigneeContainer = document.querySelector(".assigned-dropdown");

  if (!dropdown.classList.contains("d-none")) {
    if (!assigneeContainer.contains(event.target) && !dropdown.contains(event.target)) {
      closeAssigneeDropdown();
    }
  }
});

/**
 * Closes the category dropdown when clicking outside.
 * @param {MouseEvent} event - The click event on the document.
 */
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById("category-dropdown");
  const userDropdown = document.querySelector(".category-select-header");

  if (!dropdown.classList.contains("d-none")) {
    if (!userDropdown.contains(event.target) && !dropdown.contains(event.target)) {
      closeAssigneeDropdown();
    }
  }
});


/**
 * Toggles the visibility of the category dropdown menu.
 */
function toggleCategoryDropdown() {
  document.getElementById("assignee-dropdown").classList.add("d-none");
  const categorySelect = document.getElementById("category-select");
  const categoryDropdown = document.getElementById("category-dropdown");
  const arrow = document.querySelector(".arrow-category"); 
  categoryDropdown.classList.toggle("d-none");

  if (categoryDropdown.classList.contains("d-none")) {
    arrow.classList.remove("open");
    categorySelect.classList.remove("category-select-active");
  } else {
    arrow.classList.add("open");
    categorySelect.classList.add("category-select-active");
  }
}


/**
 * Selects a category and updates the display text.
 * @param {string} value - The category value to select.
 * @param {Event} e - The event object to prevent propagation.
 */
function selectCategory(value, e) {
  const label = {
    "technical-task": "Technical Task",
    "user-story": "User Story",
  };
  document.getElementById("selected-category-placeholder").textContent = label[value] || "Select category";
  document.getElementById("category-dropdown").classList.add("d-none");
  document.getElementById("category_task").value = value;
  e.stopPropagation();
    closeAssigneeDropdown();
}


/**
 * Saves the edited subtask value and exits edit mode, or removes the item if empty.
 * @param {HTMLInputElement} input - The input element containing the edited value.
 * @param {HTMLLIElement} li - The list item element being edited.
 */
function saveEdit(input, li) {
  let newValue = input.value.trim();
  if (newValue !== "") {
    let span = document.createElement("span");
    span.className = "subtask-text list";
    span.textContent = newValue;
    li.replaceChild(span, input);
    li.classList.remove("edit-mode");
    editImg.classList.remove("check_icon_subtask");
  } else {
    li.remove();
  }
}