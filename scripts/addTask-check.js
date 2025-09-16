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
    const dropdownHeader = document.querySelector(".category-select-header");
    const errorCategoryRef = document.getElementById("category-error-message");
    const inputValue = categoryRef.value.trim();
    if (!inputValue) {
        dropdownHeader.classList.add("invalid");
        errorCategoryRef.classList.remove("d-none");
        return false;
    } else {
        dropdownHeader.classList.remove("invalid");
        errorCategoryRef.classList.add("d-none");
        return true;
    }
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
 * Holt alle angehakten Checkboxen für ein bestimmtes Selector-Muster.
 * @param {string} checkboxSelector - CSS-Selector für die Checkboxen.
 * @returns {NodeListOf<HTMLInputElement>} Liste der angehakten Checkboxen.
 */
function getCheckedBoxes(checkboxSelector) {
  return document.querySelectorAll(`${checkboxSelector}:checked`);
}