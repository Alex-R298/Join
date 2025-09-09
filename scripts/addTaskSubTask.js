/** Adds a new subtask to the list if the input is not empty */
function addSubtask() {
  let input = document.getElementById("subtask_input");
  let list = document.getElementById("myList");
  let value = input.value.trim();

  if (value) {
    list.innerHTML += createListItemTemplate(value);
    input.value = "";
  }
  changeButtons();
  addSubtaskHoverEffectsWithDelegation();
}

// Get references to all relevant buttons and input
function getButtonElements() {
  return {
    acceptButton: document.getElementById("acceptButton"),
    addButton: document.getElementById("addButton"),
    clearButton: document.getElementById("clearButton"),
    input: document.getElementById("subtask_input"),
    pipe: document.getElementById("pipe")
  };
}

// Show buttons when input has content
function showButtons({acceptButton, addButton, clearButton, pipe}) {
  addButton.style.display = "none";
  acceptButton.style.display = "inline-block";
  clearButton.style.display = "inline-block";
  pipe.style.display = "inline-block";
}

// Hide buttons when input is empty
function hideButtons({acceptButton, addButton, clearButton, pipe}) {
  addButton.style.display = "inline-block";
  acceptButton.style.display = "none";
  clearButton.style.display = "none";
  pipe.style.display = "none";
}

// Main function to toggle button visibility based on input content
function changeButtons() {
  const elements = getButtonElements();
  if (elements.input.value.trim() !== "") {
    showButtons(elements);
  } else {
    hideButtons(elements);
  }
}


/** Clears the input field and updates the buttons */
function clearInput() {
  let input = document.getElementById("subtask_input");
  input.value = "";
  changeButtons();
}

// Get the list item and text span related to the clicked edit button
function getSubtaskElements(button) {
  if (!button) return {};
  const li = button.closest("li");
  if (!li) return {};
  const span = li.querySelector(".subtask-text");
  if (!span) return {};
  return { li, span };
}

// Create an input element for editing a subtask
function createEditInput(span) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  return input;
}

// Add event listeners to save the edit on Enter key or blur
function attachEditEvents(input, li) {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") saveEdit(input, li);
  });
  input.addEventListener("blur", () => saveEdit(input, li));
}

// Main function to enable editing of a subtask
function editSubtask(button) {
  const { li, span } = getSubtaskElements(button);
  if (!li || !span) return;

  const input = createEditInput(span);
  li.replaceChild(input, span);
  input.focus();
  attachEditEvents(input, li);
}


// Check if the click was on the delete button
function clickedDelete(event) {
  return event.target.closest(".icon-btn.delete-btn") ||
         event.target.closest(".icon-btn.delete-btn img");
}

// Check if the click was on the edit button
function clickedEdit(event) {
  return event.target.closest(".icon-btn.edit-btn") ||
         event.target.closest(".icon-btn.edit-btn img");
}

// Handle subtask click: toggle edit mode appropriately
function handleSubtaskClick(event, li) {
  if (clickedDelete(event)) return; // Ignore clicks on delete button

  const inEditMode = li.classList.contains("edit-mode");

  if (inEditMode) {
    if (clickedEdit(event)) {
      stopEditMode(li); // Finish editing if edit button clicked again
    }
    // Otherwise do nothing, input stays active
  } else {
    startEditMode(li); // Start edit mode
  }
}


// Show edit buttons and change edit button appearance
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

// Replace span with input for editing
function replaceSpanWithInput(li) {
  const span = li.querySelector(".subtask-text");
  if (!span) return null;

  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  li.replaceChild(input, span);
  input.focus();
  return input;
}

// Attach event listeners to handle Enter key and blur
function attachInputEvents(input, li) {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      stopEditMode(li);
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (!li.classList.contains("edit-mode")) return;
      const active = document.activeElement;
      if (!active || !active.closest(".icon-btn.edit-btn")) {
        stopEditMode(li);
      }
    }, 10);
  });
}

// Main function to start edit mode for a subtask
function startEditMode(li) {
  li.classList.add("edit-mode");
  showEditButtons(li);
  const input = replaceSpanWithInput(li);
  if (input) attachInputEvents(input, li);
}


// Replace input with a span containing the new subtask text
function replaceInputWithSpan(input, li) {
  const newValue = input.value.trim();
  if (newValue === "") return null;

  const span = document.createElement("span");
  span.className = "subtask-text list";
  span.textContent = newValue;
  li.replaceChild(span, input);
  return span;
}

// Reset edit buttons and icons to default state
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

// Main function to stop edit mode and save subtask
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

/** Saves the edited subtask or removes it if the input is empty */

// Replace input with a span containing the new subtask text
function replaceInputWithSpanSave(input, li) {
  const newValue = input.value.trim();
  if (newValue === "") return null;

  const span = document.createElement("span");
  span.className = "subtask-text list";
  span.textContent = newValue;
  li.replaceChild(span, input);
  return span;
}

// Reset the edit button to its default state
function resetEditButton(li) {
  const editBtn = li.querySelector(".icon-btn.edit-btn");
  const editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/edit.svg";
  editImg.alt = "Edit";
  editImg.classList.remove("check_icon_subtask");
}

// Main function to save subtask edits
function saveEdit(input, li) {
  const span = replaceInputWithSpanSave(input, li);
  if (span) {
    li.classList.remove("edit-mode");
    resetEditButton(li);
  } else {
    li.remove(); // Remove subtask if input is empty
  }
}

/** Deletes a subtask from the list */
function deleteSubtask(button) {
  let li = button.closest("li");
  if (li) li.remove();
}

// Show edit buttons on mouseover if not in edit mode
function showEditButtonsOnHover(subtaskElement) {
  const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
  if (editButtons) editButtons.classList.remove("d-none");
}

// Hide edit buttons on mouseout if not in edit mode
function hideEditButtonsOnMouseOut(subtaskElement, relatedTarget) {
  if (!subtaskElement.contains(relatedTarget)) {
    const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
    if (editButtons) editButtons.classList.add("d-none");
  }
}

// Attach hover effects to subtasks using event delegation
function addSubtaskHoverEffectsWithDelegation() {
  document.body.addEventListener("mouseover", e => {
    const subtask = e.target.closest(".subtask-listelement");
    if (subtask && !subtask.classList.contains("edit-mode")) {
      showEditButtonsOnHover(subtask);
    }
  });

  document.body.addEventListener("mouseout", e => {
    const subtask = e.target.closest(".subtask-listelement");
    if (subtask && !subtask.classList.contains("edit-mode")) {
      hideEditButtonsOnMouseOut(subtask, e.relatedTarget);
    }
  });
}


