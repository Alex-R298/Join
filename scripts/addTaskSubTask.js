/**
 * Updates the scroll height of the subtask list based on the number of items.
 * Sets a maximum height to show only 3 items and enables scrolling if there are more.
 */
function updateSubtaskScroll() {
  const list = document.getElementById("myList");
  const items = list.querySelectorAll("li");
  
  const subtaskHeight = items[0]?.offsetHeight || 40;
  const maxVisible = 3;
  
  list.style.maxHeight = items.length > maxVisible 
    ? `${subtaskHeight * maxVisible}px` 
    : "auto";
}


/**
 * Adds a new subtask to the list if the input is not empty.
 */
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
  updateSubtaskScroll();
}


/**
 * Gets references to all relevant buttons and input elements for subtask management.
 * @returns {{acceptButton: HTMLElement, addButton: HTMLElement, clearButton: HTMLElement, input: HTMLInputElement, pipe: HTMLElement}} Object containing button and input element references.
 */
function getButtonElements() {
  return {
    acceptButton: document.getElementById("acceptButton"),
    addButton: document.getElementById("addButton"),
    clearButton: document.getElementById("clearButton"),
    input: document.getElementById("subtask_input"),
    pipe: document.getElementById("pipe")
  };
}


/**
 * Shows action buttons when input has content.
 * @param {Object} elements - Object containing button element references.
 * @param {HTMLElement} elements.acceptButton - Accept button element.
 * @param {HTMLElement} elements.addButton - Add button element.
 * @param {HTMLElement} elements.clearButton - Clear button element.
 * @param {HTMLElement} elements.pipe - Pipe separator element.
 */
function showButtons({acceptButton, addButton, clearButton, pipe}) {
  addButton.style.display = "none";
  acceptButton.style.display = "inline-block";
  clearButton.style.display = "inline-block";
  pipe.style.display = "inline-block";
}


/**
 * Hides action buttons when input is empty.
 * @param {Object} elements - Object containing button element references.
 * @param {HTMLElement} elements.acceptButton - Accept button element.
 * @param {HTMLElement} elements.addButton - Add button element.
 * @param {HTMLElement} elements.clearButton - Clear button element.
 * @param {HTMLElement} elements.pipe - Pipe separator element.
 */
function hideButtons({acceptButton, addButton, clearButton, pipe}) {
  addButton.style.display = "inline-block";
  acceptButton.style.display = "none";
  clearButton.style.display = "none";
  pipe.style.display = "none";
}


/**
 * Main function to toggle button visibility based on input content.
 */
function changeButtons() {
  const elements = getButtonElements();
  if (elements.input.value.trim() !== "") {
    showButtons(elements);
  } else {
    hideButtons(elements);
  }
}


/**
 * Clears the input field and updates the button states.
 */
function clearInput() {
  let input = document.getElementById("subtask_input");
  input.value = "";
  changeButtons();
}


/**
 * Gets the list item and text span elements related to the clicked edit button.
 * @param {HTMLElement} button - The clicked edit button element.
 * @returns {{li: HTMLLIElement|undefined, span: HTMLSpanElement|undefined}} Object containing the list item and span elements.
 */
function getSubtaskElements(button) {
  if (!button) return {};
  const li = button.closest("li");
  if (!li) return {};
  const span = li.querySelector(".subtask-text");
  if (!span) return {};
  return { li, span };
}


/**
 * Creates an input element for editing a subtask.
 * @param {HTMLSpanElement} span - The span element containing the current subtask text.
 * @returns {HTMLInputElement} Input element configured for editing.
 */
function createEditInput(span) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  return input;
}


/**
 * Adds event listeners to save the edit on Enter key press or blur event.
 * @param {HTMLInputElement} input - The input element being edited.
 * @param {HTMLLIElement} li - The list item containing the input.
 */
function attachEditEvents(input, li) {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") saveEdit(input, li);
  });
  input.addEventListener("blur", () => saveEdit(input, li));
}


/**
 * Main function to enable editing mode for a subtask.
 * @param {HTMLElement} button - The edit button that was clicked.
 */
function editSubtask(button) {
  const { li, span } = getSubtaskElements(button);
  if (!li || !span) return;

  const input = createEditInput(span);
  li.replaceChild(input, span);
  input.focus();
  attachEditEvents(input, li);
}


/**
 * Checks if the click event was on the delete button.
 * @param {Event} event - The click event object.
 * @returns {boolean} True if the delete button was clicked, false otherwise.
 */
function clickedDelete(event) {
  return event.target.closest(".icon-btn.delete-btn") ||
         event.target.closest(".icon-btn.delete-btn img");
}


/**
 * Handles subtask click events and toggles edit mode appropriately.
 * @param {Event} event - The click event object.
 * @param {HTMLLIElement} li - The list item that was clicked.
 */
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


/**
 * Replaces the span element with an input element for editing.
 * @param {HTMLLIElement} li - The list item containing the span to replace.
 * @returns {HTMLInputElement|null} The created input element, or null if span not found.
 */
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


/**
 * Attaches event listeners to handle Enter key press and blur events for input.
 * @param {HTMLInputElement} input - The input element to attach events to.
 * @param {HTMLLIElement} li - The list item containing the input.
 */
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


/**
 * Replaces the input element with a span containing the new subtask text.
 * @param {HTMLInputElement} input - The input element to replace.
 * @param {HTMLLIElement} li - The list item containing the input.
 * @returns {HTMLSpanElement|null} The created span element, or null if input is empty.
 */
function replaceInputWithSpan(input, li) {
  const newValue = input.value.trim();
  if (newValue === "") return null;

  const span = document.createElement("span");
  span.className = "subtask-text list";
  span.textContent = newValue;
  li.replaceChild(span, input);
  return span;
}


/**
 * Replaces the input element with a span containing the new subtask text (save version).
 * @param {HTMLInputElement} input - The input element to replace.
 * @param {HTMLLIElement} li - The list item containing the input.
 * @returns {HTMLSpanElement|null} The created span element, or null if input is empty.
 */
function replaceInputWithSpanSave(input, li) {
  const newValue = input.value.trim();
  if (newValue === "") return null;

  const span = document.createElement("span");
  span.className = "subtask-text list";
  span.textContent = newValue;
  li.replaceChild(span, input);
  return span;
}


/**
 * Resets the edit button to its default state.
 * @param {HTMLLIElement} li - The list item containing the edit button to reset.
 */
function resetEditButton(li) {
  const editBtn = li.querySelector(".icon-btn.edit-btn");
  const editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/edit.svg";
  editImg.alt = "Edit";
  editImg.classList.remove("check_icon_subtask");
}


/**
 * Deletes a subtask from the list.
 * @param {HTMLElement} button - The delete button that was clicked.
 */
function deleteSubtask(button) {
  let li = button.closest("li");
  if (li) li.remove();
}


/**
 * Hides edit buttons on mouseout if the subtask is not in edit mode.
 * @param {HTMLElement} subtaskElement - The subtask element to hide buttons for.
 * @param {HTMLElement} relatedTarget - The element the mouse moved to.
 */
function hideEditButtonsOnMouseOut(subtaskElement, relatedTarget) {
  if (!subtaskElement.contains(relatedTarget)) {
    const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
    if (editButtons) editButtons.classList.add("d-none");
  }
}


/**
 * Attaches hover effects to subtasks using event delegation for better performance.
 */
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


/**
 * Global event listener for handling Enter key press on input fields.
 * Handles both subtask input and edit subtask input fields.
 * @param {KeyboardEvent} e - The keyboard event object.
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        if (e.target.id === 'subtask_input') {
            e.preventDefault();
            addSubtask();
        } else if (e.target.id === 'edit-subtask-input') {
            e.preventDefault();
            addEditSubtask();
        }
    }
});