/**
 * Checks if the click event was on the edit button.
 * @param {Event} event - The click event object.
 * @returns {boolean} True if the edit button was clicked, false otherwise.
 */
function clickedEdit(event) {
  return event.target.closest(".icon-btn.edit-btn") ||
         event.target.closest(".icon-btn.edit-btn img");
}


/**
 * Shows edit buttons and changes edit button appearance for edit mode.
 * @param {HTMLLIElement} li - The list item to show edit buttons for.
 */
function showEditButtons(li) {
  const editBtn = li.querySelector(".icon-btn.edit-btn");
  const deleteBtn = li.querySelector(".icon-btn.delete-btn");
  const separator = li.querySelector(".vl-small");
  const buttonsContainer = li.querySelector(".subtask-edit-btns");

  buttonsContainer.classList.remove("d-none"); // Show buttons permanently
  const editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/check_subtask.svg";
  editImg.alt = "Check";
  editImg.classList.add("check_icon_subtask");

  // Reorder buttons: delete button and separator before edit button
  const parent = editBtn.parentNode;
  parent.insertBefore(deleteBtn, editBtn);
  parent.insertBefore(separator, editBtn);
}


/**
 * Main function to start edit mode for a subtask.
 * @param {HTMLLIElement} li - The list item to put into edit mode.
 */
function startEditMode(li) {
  li.classList.add("edit-mode");
  showEditButtons(li);
  const input = replaceSpanWithInput(li);
  if (input) attachInputEvents(input, li);
}


/**
 * Resets edit buttons and icons to their default state.
 * @param {HTMLLIElement} li - The list item to reset button states for.
 */
function resetEditButtons(li) {
  const editBtn = li.querySelector(".icon-btn.edit-btn");
  const deleteBtn = li.querySelector(".icon-btn.delete-btn");
  const separator = li.querySelector(".vl-small");
  const buttonsContainer = li.querySelector(".subtask-edit-btns");

  buttonsContainer.classList.add("d-none");

  const editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/edit.svg";
  editImg.alt = "Edit";
  editImg.classList.remove("check_icon_subtask");

  const parent = editBtn.parentNode;
  parent.insertBefore(editBtn, parent.firstChild);
  parent.insertBefore(separator, deleteBtn);
}


/**
 * Main function to stop edit mode and save the subtask.
 * @param {HTMLLIElement} li - The list item to exit from edit mode.
 */
function stopEditMode(li) {
  const input = li.querySelector(".edit-input");
  if (!input) return;

  const span = replaceInputWithSpan(input, li);
  if (span) {
    li.classList.remove("edit-mode");
    resetEditButtons(li);
  } else {
    li.remove(); // Remove subtask if input is empty
  }
}


/**
 * Saves the edited subtask value and exits edit mode, or removes the item if empty.
 * @param {HTMLInputElement} input - The input element containing the edited value.
 * @param {HTMLLIElement} li - The list item element being edited.
 */
function saveEdit(input, li) {
  const span = replaceInputWithSpanSave(input, li);
  if (span) {
    li.classList.remove("edit-mode");
    resetEditButton(li);
  } else {
    li.remove(); // Remove subtask if input is empty
  }
}


/**
 * Shows edit buttons on mouseover if the subtask is not in edit mode.
 * @param {HTMLElement} subtaskElement - The subtask element to show buttons for.
 */
function showEditButtonsOnHover(subtaskElement) {
  const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
  if (editButtons) editButtons.classList.remove("d-none");
}