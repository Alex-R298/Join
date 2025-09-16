/**
 * Öffnet das Edit-User-Dropdown und setzt Input und Pfeil.
 * @param {HTMLElement} dropdown
 * @param {HTMLElement} arrow
 * @param {HTMLInputElement} input
 */
function openEditDropdown(dropdown, arrow, input) {
  dropdown.style.display = "block";
  arrow.classList.add("open");
  input.removeAttribute("readonly");
  input.focus();
}


/**
 * Schließt das Edit-User-Dropdown, setzt Input readonly und zeigt alle Items.
 * @param {HTMLElement} dropdown
 * @param {HTMLElement} arrow
 * @param {HTMLInputElement} input
 */
function closeEditDropdown(dropdown, arrow, input) {
  dropdown.style.display = "none";
  arrow.classList.remove("open");
  input.setAttribute("readonly", true);
  input.value = "";
  dropdown.querySelectorAll(".assigned-user-item")
          .forEach(item => item.style.display = "flex");
}


/**
 * Toggles die Sichtbarkeit des Edit-User-Dropdowns.
 */
function toggleEditUserDropdown() {
  const dropdown = document.getElementById("edit-user-dropdown");
  const arrow = document.querySelector("#edit-assigned-input + .dropdown-arrow");
  const input = document.getElementById("edit-assigned-input");

  if (!dropdown.style.display || dropdown.style.display === "none") {
    openEditDropdown(dropdown, arrow, input);
  } else {
    closeEditDropdown(dropdown, arrow, input);
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
 * Zeigt oder versteckt Buttons basierend auf dem Eingabewert.
 * @param {HTMLElement} addBtn - "Add"-Button
 * @param {HTMLElement} acceptBtn - "Accept"-Button
 * @param {HTMLElement} clearBtn - "Clear"-Button
 * @param {HTMLElement} divider - Trennlinie
 * @param {boolean} show - true: akzeptieren/löschen anzeigen, false: Add anzeigen
 */
function toggleEditButtons(addBtn, acceptBtn, clearBtn, divider, show) {
  addBtn.classList.toggle("d-none", show);
  divider.classList.toggle("d-none", !show);
  acceptBtn.classList.toggle("d-none", !show);
  clearBtn.classList.toggle("d-none", !show);
}

/**
 * Prüft den Wert des Edit-Subtask-Inputs und passt die Buttons an.
 */
function changeEditButtons() {
  const acceptBtn = document.getElementById("editAcceptButton");
  const addBtn = document.getElementById("editAddButton");
  const clearBtn = document.getElementById("editClearButton");
  const input = document.getElementById("edit-subtask-input");
  const divider = document.getElementById("vertical-divider");

  toggleEditButtons(addBtn, acceptBtn, clearBtn, divider, input.value.trim() !== "");
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
  updateEditSubtaskScroll();
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
 * Ersetzt den Text-Span durch ein Input-Feld und fokussiert es.
 * @param {HTMLElement} li - List Item
 * @returns {HTMLInputElement} Das erstellte Input-Feld
 */
function replaceTextWithInput(li) {
  const span = li.querySelector(".subtask-text.list");
  if (!span) return null;

  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  li.replaceChild(input, span);
  input.focus();

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") saveEditSubtaskEdit(input, li);
  });
  input.addEventListener("blur", () => saveEditSubtaskEdit(input, li));
  return input;
}


/**
 * Ändert das Edit-Icon zu einem Check und verschiebt Buttons.
 * @param {HTMLElement} li - List Item
 */
function updateEditButtonToCheck(li) {
  const editBtn = li.querySelector(".icon-btn.edit-btn");
  const deleteBtn = li.querySelector(".icon-btn.delete-btn");
  const separator = li.querySelector(".vl-small");

  const editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/check_subtask.svg";
  editImg.alt = "Check";

  const parent = editBtn.parentNode;
  parent.insertBefore(deleteBtn, editBtn);
  parent.insertBefore(separator, editBtn);
}


/**
 * Aktiviert den Edit-Modus für eine Subtask-Liste.
 * @param {HTMLElement} li - List Item
 */
function startEditSubtaskEditMode(li) {
  li.classList.add("edit-mode");
  updateEditButtonToCheck(li);
  replaceTextWithInput(li);
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
  updateEditSubtaskScroll();
} 

/**
 * Passt die maximale Höhe der Edit-Subtask-Liste an.
 * Wenn mehr als 3 Subtasks vorhanden sind, wird die Liste scrollbar,
 * ansonsten wird die Höhe automatisch angepasst.
 */
function updateEditSubtaskScroll() {
  const list = document.getElementById("editMyList");
  const items = list.querySelectorAll("li");
  if (items.length === 0) {
    list.style.maxHeight = "auto";
    return;
  }
  const subtaskHeight = items[0].offsetHeight;
  const maxVisible = 3;
  list.style.maxHeight = items.length > maxVisible
    ? `${subtaskHeight * maxVisible}px`
    : "auto";
}


/**
 * Holt die aktuell ausgewählten Benutzer aus dem Edit-User-Dropdown.
 * @returns {string[]} Array der ausgewählten E-Mails.
 */
function getAssignedUsers() {
  const assignedCheckboxes = document.querySelectorAll(
    '#edit-user-dropdown input[type="checkbox"]:checked'
  );
  return Array.from(assignedCheckboxes).map(cb => cb.value);
}


/**
 * Erstellt ein Array von Subtask-Objekten basierend auf der Edit-Liste.
 * @param {Object} task - Original-Task für den Vergleich.
 * @returns {Array} Array von Subtask-Objekten.
 */
function getEditedSubtasks(task) {
  const subtaskElements = [];
  document.querySelectorAll("#editMyList .subtask-text.list").forEach((item, index) => {
    const originalSubtask = task.subtaskElements?.[index];
    subtaskElements.push({
      text: item.textContent,
      completed: originalSubtask ? originalSubtask.completed : false,
    });
  });
  return subtaskElements;
}


/**
 * Speichert die bearbeitete Aufgabe, aktualisiert HTML und schließt das Overlay.
 * @param {string} taskId - ID der Task.
 * @returns {Promise<void>}
 */
async function saveEditedTask(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;
  task.title = document.getElementById("edit-title").value;
  task.description = document.getElementById("edit-description").value;
  task.dueDate = document.getElementById("edit-datepicker").value;
  task.priority = selectedPriority;
  task.assignedTo = getAssignedUsers();
  task.subtaskElements = getEditedSubtasks(task);
  await saveTaskToFirebase(task);
  closeTaskOverlay();
  const taskElement = document.getElementById(`task-${taskId}`);
  if (taskElement) taskElement.outerHTML = taskOnBoardTemplate(task);
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
  initializeEditCheckboxStates();
  renderAssignedUserData();
}


/** Deletes a task from the database and refreshes the display. */
async function deleteTask(taskId) {
  const response = await deleteTaskService(taskId);
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


/**
 * Toggles the selection state of a user checkbox in edit mode
 * @param {string} email - The email of the user to toggle selection for
 */
function toggleUserSelectionEdit(email) {
    const checkbox = document.getElementById('edit-user-' + email);
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
    updateEditAssignedAvatars();
}


/**
 * Initializes the visual state of checkboxes in edit mode
 */
function initializeEditCheckboxStates() {
    const checkboxes = document.querySelectorAll('#edit-user-dropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const userItem = checkbox.closest(".assigned-user-item");
        const checkboxCustom = checkbox.parentNode.querySelector(".checkbox-custom");
        
        if (checkbox.checked) {
            userItem.classList.add("active");
            checkboxCustom.classList.add("active");
        } else {
            userItem.classList.remove("active");
            checkboxCustom.classList.remove("active");
        }
    });
}
