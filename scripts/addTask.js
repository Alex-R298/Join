let selectedPriority = "medium";
let currentTaskStatus = "toDo";


/**
 * Sets the current task status to the specified value.
 * @param {string} status - The new status of the task (e.g., "toDo", "inProgress", "done").
 */
function saveTaskStatusToFirebase(status) {
    currentTaskStatus = status;
}


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
 * Reads all values from the add-task form.
 * @returns {{title: string, description: string, dueDate: string, category: string, checkedUsers: string[], subtaskElements: Object[]}} Form data containing title, description, date, category, users, and subtasks.
 */
function getFormValues() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("task_description").value,
    dueDate: document.getElementById("datepicker").value,
    category: document.getElementById("category_task").value,
    checkedUsers: Array.from(
      document.querySelectorAll('input[type="checkbox"][id^="user-"]:checked')
    ).map(cb => cb.value),
    subtaskElements: getSubtasks()
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
 * Builds a task object from form values and global status/priority.
 * @param {Object} values - Form data object.
 * @param {string} values.title - Task title.
 * @param {string} values.description - Task description.
 * @param {string} values.dueDate - Task due date.
 * @param {string} values.category - Task category.
 * @param {string[]} values.checkedUsers - Array of assigned user emails.
 * @param {Object[]} values.subtaskElements - Array of subtask objects.
 * @returns {Object} New task object with all required properties.
 */
function buildTask({title, description, dueDate, category, checkedUsers, subtaskElements}) {
  return {
    title,
    description,
    dueDate,
    priority: selectedPriority,
    assignedTo: checkedUsers,
    category,
    status: currentTaskStatus,
    subtaskElements,
  };
}


/**
 * Adds a new task, saves it to the database, and updates the UI.
 * @returns {Promise<void>}
 */
async function addTask() {
  if (!checkDate()) return;
  const values = getFormValues();
  const newTask = buildTask(values);
  const savedTask = await postTaskData(newTask);
  await renderTasks();
  updateHTML();
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
 * Shows a success popup after adding a task.
 */
function showPopup() {
    document.getElementById("taskPopup").classList.remove('d-none');
    setTimeout(() => {
        closePopup();
        window.location.href = "board.html";
    }, 1500);
}


/**
 * Closes the popup and optionally the overlay.
 */
function closePopup() {
  document.getElementById("taskPopup").classList.add('d-none');
  if (document.getElementById("add-task-overlay")) {
    closeAddTaskOverlay();
  }
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
 * Validates the title field and shows/hides error message.
 * @returns {boolean} True if title is set and valid, false otherwise.
 */
function checkTitle() {
    const titleRef = document.getElementById("title");
    const errorTitleRef = document.getElementById("title-error-message");
    const inputValue = titleRef.value.trim();
    if (!inputValue) {
        titleRef.classList.add("invalid");
        errorTitleRef.classList.remove("d-none");
        return false;
    } else {
        titleRef.classList.remove("invalid");
        errorTitleRef.classList.add("d-none");
        return true;
    }
}


/**
 * Validates the date field (not empty, not in the past).
 * @returns {boolean} True if date is valid, false otherwise.
 */
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


/**
 * Validates the category field and shows/hides error message.
 * @returns {boolean} True if category is selected, false otherwise.
 */
function checkCategory() {
    const categoryRef = document.getElementById("category_task");
    const errorCategoryRef = document.getElementById("category-error-message");
    const inputValue = categoryRef.value.trim();
    if (!inputValue) {
        categoryRef.classList.add("invalid");
        errorCategoryRef.classList.remove("d-none");
        return false;
    } else {
        categoryRef.classList.remove("invalid");
        errorCategoryRef.classList.add("d-none");
        return true;
    }
}


/**
 * Resets all validation states (errors and styles) to their initial state.
 */
function resetValidationState() {
    document.querySelectorAll('.invalid').forEach(element => {
        element.classList.remove('invalid');
    });
    document.querySelectorAll('[id$="-error-message"]').forEach(errorElement => {
        errorElement.classList.add('d-none');
    });
}


/**
 * Clears all form text inputs and resets the task creation form to its initial state.
 */
function clearTextInputs() {
  document.getElementById("title").value = "";
  document.getElementById("task_description").value = "";
  document.getElementById("datepicker").value = "";
  document.getElementById("assignee-input").value = "";
  document.getElementById("myList").innerHTML = "";
}


/**
 * Resets the task category input and placeholder text.
 */
function resetCategory() {
  const placeholder = document.getElementById("selected-category-placeholder");
  const input = document.getElementById("category_task");
  if (placeholder) placeholder.textContent = "Select task category";
  if (input) input.value = "";
}


/**
 * Clears all subtasks from the subtask container.
 */
function clearSubtasks() {
  const container = document.getElementById("subtask-container");
  if (container) container.innerHTML = "";
}


/**
 * Resets the priority selection to default (medium).
 */
function resetPriority() {
  selectedPriority = "medium";
  selectPriority(document.querySelector('[data-priority="medium"]'));
}


/**
 * Unchecks all user checkboxes and clears assigned user avatars.
 */
function resetCheckboxesAndAvatars() {
  document.querySelectorAll('input[type="checkbox"][id^="user-"]').forEach(cb => cb.checked = false);
  const avatars = document.getElementById("assigned-avatars");
  if (avatars) avatars.innerHTML = "";
}


/**
 * Main function to clear all form inputs and reset UI state to initial values.
 * @returns {Promise<void>}
 */
async function clearInputs() {
  clearTextInputs();
  resetCategory();
  clearSubtasks();
  resetPriority();
  resetCheckboxesAndAvatars();
  resetValidationState();
}


/**
 * Handles the add task action by validating the form and adding the task if valid.
 */
function handleAddTask() {
    if (validateAddTask()) {
        addTask();
    }
}


/**
 * Updates the visual representation of selected assignees.
 * Shows avatars of all selected users below the select field.
 */
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
 * Toggles the visibility of the assignee dropdown menu.
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
    dropdown.classList.add("d-none");
    arrow.classList.remove("open");
    input.setAttribute("readonly", true);
    input.value = "";
    filterAssignees("");
  }
}


/**
 * Currently selected category value.
 * @type {string|null}
 */
let selectedCategory = null;


/**
 * Toggles the visibility of the category dropdown menu.
 */
function toggleCategoryDropdown() {
  document.getElementById("assignee-dropdown").classList.add("d-none");
  const categoryDropdown = document.getElementById("category-dropdown");
  categoryDropdown.classList.toggle("d-none");
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

  document.getElementById("selected-category-placeholder").textContent =
    label[value] || "Select category";
  document.getElementById("category-dropdown").classList.add("d-none");
  document.getElementById("category_task").value = value;

  e.stopPropagation();
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