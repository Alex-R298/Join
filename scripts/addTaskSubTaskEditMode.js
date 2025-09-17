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

  buttonsContainer.classList.remove("d-none"); 
  const editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/check_subtask.svg";
  editImg.alt = "Check";
  editImg.classList.add("check_icon_subtask");
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
 * Resets the edit icon back to its default state.
 * @param {HTMLElement} editBtn - The edit button element.
 */
function resetEditIcon(editBtn) {
  const editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/edit.svg";
  editImg.alt = "Edit";
  editImg.classList.remove("check_icon_subtask");
}


/**
 * Restores the default order of buttons inside the list item.
 * @param {HTMLElement} editBtn - The edit button element.
 * @param {HTMLElement} deleteBtn - The delete button element.
 * @param {HTMLElement} separator - The separator element.
 */
function resetButtonOrder(editBtn, deleteBtn, separator) {
  const parent = editBtn.parentNode;
  parent.appendChild(editBtn);
  parent.appendChild(separator);
  parent.appendChild(deleteBtn);
}


/**
 * Resets edit buttons and icons of a subtask list item
 * back to their default state.
 * @param {HTMLLIElement} li - The list item containing buttons.
 */
function resetEditButtons(li) {
  const editBtn = li.querySelector(".icon-btn.edit-btn");
  const deleteBtn = li.querySelector(".icon-btn.delete-btn");
  const separator = li.querySelector(".vl-small");
  const buttonsContainer = li.querySelector(".subtask-edit-btns");

  buttonsContainer.classList.add("d-none");
  resetEditIcon(editBtn);
  resetButtonOrder(editBtn, deleteBtn, separator);
}


/**
 * Stops edit mode for a subtask list item.
 * @param {HTMLLIElement} li - The list item to take out of edit mode.
 */
function stopEditMode(li) {
  const input = li.querySelector(".edit-input");
  if (input) {
    const span = replaceInputWithSpan(input, li);
    if (span) {
      li.classList.remove("edit-mode");
      resetEditButtons(li);
      updateSubtaskScroll();
    } else {
      // If input is empty, remove the entire list item
      li.remove();
      updateSubtaskScroll();
    }
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

