/**
 * Toggels the visibility of the edit-user-dropdown.
 * Changes the display status of the dropdown and updates the display of the arrow.
 */
function toggleEditUserDropdown() {
  const dropdown = document.getElementById("edit-user-dropdown");
  const arrow = document.querySelector(
    "#edit-assigned-input + .dropdown-arrow"
  );
  const input = document.getElementById("edit-assigned-input");

  if (dropdown.style.display === "none" || dropdown.style.display === "") {
    dropdown.style.display = "block";
    arrow.classList.add("open");
    input.removeAttribute("readonly");
    input.focus();
  } else {
    dropdown.style.display = "none";
    arrow.classList.remove("open");
    input.setAttribute("readonly", true);
    input.value = "";
    document
      .querySelectorAll("#edit-user-dropdown .assigned-user-item")
      .forEach((item) => {
        item.style.display = "flex";
      });
  }
}


/**
 * Filters user items in edit mode based on a search term.
 * @param {string} searchTerm - The search term to filter by.
 */
function filterEditUsers(searchTerm) {
  const userItems = document.querySelectorAll(
    "#edit-user-dropdown .assigned-user-item"
  );
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
 * Updates the list of assigned user avatars in edit mode.
 * Clones the avatars of the selected users and adds them to the avatar container.
 */
function updateEditAssignedAvatars() {
  const checkedBoxes = document.querySelectorAll(
    '#edit-user-dropdown input[type="checkbox"]:checked'
  );
  const avatarsContainer = document.getElementById("edit-assigned-avatars");

  avatarsContainer.innerHTML = "";

  checkedBoxes.forEach((checkbox) => {
    const userItem = checkbox.closest(".assigned-user-item");
    const avatar = userItem.querySelector(".contact-avatar").cloneNode(true);
    avatarsContainer.appendChild(avatar);
  });
}

// Subtask-Functions for editing

/**
 * Changes the visibility of buttons in edit mode based on the input field value.
 * Shows "accept" and "delete" buttons, if the value is not empty
 * otherwise it displays the "Add" button.
 */
function changeEditButtons() {
  let acceptButton = document.getElementById("editAcceptButton");
  let addButton = document.getElementById("editAddButton");
  let clearButton = document.getElementById("editClearButton");
  let input = document.getElementById("edit-subtask-input");
  let divider = document.getElementById("vertical-divider");

  if (input.value.trim() !== "") {
    addButton.classList.add("d-none");
    divider.classList.remove("d-none");
    acceptButton.classList.remove("d-none");
    clearButton.classList.remove("d-none");
  } else {
    addButton.classList.remove("d-none");
    divider.classList.add("d-none");
    acceptButton.classList.add("d-none");
    clearButton.classList.add("d-none");
  }
}

/**
 * Adds a new subtask to the worklist.
* Creates a new list item from the input field value and updates the buttons.
 */
function addEditSubtask() {
  let input = document.getElementById("edit-subtask-input");
  let list = document.getElementById("editMyList");
  let value = input.value.trim();

  if (value) {
    list.innerHTML += createListItemTemplate(value);
    input.value = "";
  }
  changeEditButtons();
}


/**
* Clears the contents of the edit input field and updates the buttons.
*/
function clearEditInput() {
  let input = document.getElementById("edit-subtask-input");
  input.value = "";
  changeEditButtons();
}


/**
* Handles click events on subtasks in edit mode.
* Checks whether the user wants to start or cancel editing,
* and changes the mode accordingly.
* @param {Event} event - The click event.
* @param {HTMLElement} li - The list item that was clicked.
*/
function handleEditSubtaskClick(event, li) {
  if (
    event.target.closest(".icon-btn.delete-btn") ||
    event.target.closest(".icon-btn.delete-btn img")
  )
    return;

  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let editImg = editBtn.querySelector("img");

  if (editImg.src.includes("check_subtask.svg")) {
    stopEditSubtaskEditMode(li);
  } else {
    startEditSubtaskEditMode(li);
  }
}


/**
* Activates edit mode for a subtask list item.
* Adds the "edit-mode" CSS class and replaces the text with an input field.
* @param {HTMLElement} li - The list item to be edited.
*/

function startEditSubtaskEditMode(li) {
  li.classList.add("edit-mode");

  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let deleteBtn = li.querySelector(".icon-btn.delete-btn");
  let separator = li.querySelector(".vl-small");

  let editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/check_subtask.svg";
  editImg.alt = "Check";

  let parent = editBtn.parentNode;
  parent.insertBefore(deleteBtn, editBtn);
  parent.insertBefore(separator, editBtn);

  let span = li.querySelector(".subtask-text.list");
  if (!span) return;

  let input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  li.replaceChild(input, span);
  input.focus();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") saveEditSubtaskEdit(input, li);
  });
  input.addEventListener("blur", function () {
    saveEditSubtaskEdit(input, li);
  });
}


/**
* Disables edit mode for a subtask list item.
* Removes the "edit-mode" CSS class and updates the element's appearance.
* @param {HTMLElement} li - The list item whose editing should be ended.
*/
function stopEditSubtaskEditMode(li) {
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
  if (input) saveEditSubtaskEdit(input, li);
}


/**
* Saves the changes to a subtask list item.
* Replaces the input field with a text node and updates the display.
* @param {HTMLInputElement} input - The input field with the new value.
* @param {HTMLElement} li - The list item to be saved.
*/
function saveEditSubtaskEdit(input, li) {
  let newValue = input.value.trim();
  if (newValue !== "") {
    let span = document.createElement("span");
    span.className = "subtask-text list";
    span.textContent = newValue;
    li.replaceChild(span, input);
  } else {
    li.remove();
  }
  li.classList.remove("edit-mode");
}


/**
* Deletes a subtask list item.
* Removes the parent list item.
*/
function deleteEditSubtask(button) {
  let li = button.closest("li");
  if (li) li.remove();
}


/**
* Saves the edited task to the database.
* Creates an updated version of the task and saves it via Firebase.
* @param {string} taskId - The ID of the task to save.
* @returns {Promise<void>} A promise representing the async operation.
*/
async function saveEditedTask(taskId) {
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return;

  const assignedCheckboxes = document.querySelectorAll(
    '#edit-user-dropdown input[type="checkbox"]:checked'
  );
  const assignedUsers = Array.from(assignedCheckboxes).map((cb) => cb.value);
  const subtaskElements = [];
  const subtaskItems = document.querySelectorAll(
    "#editMyList .subtask-text.list"
  );
  subtaskItems.forEach((item, index) => {
    const originalSubtask = task.subtaskElements && task.subtaskElements[index];
    const originalCompleted = originalSubtask ? originalSubtask.completed : false;
    
    subtaskElements.push({
      text: item.textContent,
      completed: originalCompleted,
    });
  });

  task.title = document.getElementById("edit-title").value;
  task.description = document.getElementById("edit-description").value;
  task.dueDate = document.getElementById("edit-datepicker").value;
  task.priority = selectedPriority;
  task.assignedTo = assignedUsers.length > 0 ? [...assignedUsers] : [];
  task.subtaskElements = subtaskElements;

  await saveTaskToFirebase(task);
  closeTaskOverlay();
  const taskElement = document.getElementById(`task-${taskId}`);
  if (taskElement) {
    taskElement.outerHTML = taskOnBoardTemplate(task);
}
updateHTML();
}


/**
* Prepares for processing a task.
* Loads the task data and initializes the processing form.
* @param {string} taskId - The ID of the task to be processed.
* @returns {Promise<void>} A promise representing the async operation.
*/
async function editTask(taskId) {
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return;

  const container = document.getElementById("task-detail-container");
  const usersArray = await loadUsers();
  selectedPriority = task.priority;
  container.innerHTML = getEditTaskTemplate(task, usersArray);
  document.body.classList.remove("no-markers");
  addSubtaskHoverEffectsWithDelegation();
}


/** Deletes a task from the database and refreshes the display. */
async function deleteTask(taskId) {
  const response = await fetch(`${BASE_URL}/task/${taskId}.json`, {
    method: "DELETE",
  });
  if (response.ok) {
    allTasks = allTasks.filter((t) => t.id !== taskId);
    updateHTML();
    closeTaskOverlay();
  }
}


/** Closes the editing overlay and resets its visibility. */
function closeEditTaskOverlay() {
  const overlay = document.getElementById("edit-task-overlay");
  overlay.classList.remove("visible");
  setTimeout(() => {
    overlay.classList.add("d-none");
  }, 500);
}
