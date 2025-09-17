
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
 * Also removes active state styling from user items and custom checkboxes.
 */
function resetCheckboxesAndAvatars() {
  document.querySelectorAll('input[type="checkbox"][id^="user-"]').forEach(cb => {
    cb.checked = false;
    const userItem = cb.closest(".assigned-user-item");
    const checkboxCustom = cb.parentNode.querySelector(".checkbox-custom");
    userItem?.classList.remove("active");
    checkboxCustom?.classList.remove("active");
  });
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

