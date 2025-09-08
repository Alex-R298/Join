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
}

/** Changes the visibility of buttons based on the input content */
function changeButtons() {
  let acceptButton = document.getElementById("acceptButton");
  let addButton = document.getElementById("addButton");
  let clearButton = document.getElementById("clearButton");
  let input = document.getElementById("subtask_input");
  let balken = document.getElementById("pipe");

  if (input.value.trim() !== "") {
    addButton.style.display = "none";
    acceptButton.style.display = "inline-block";
    clearButton.style.display = "inline-block";
    balken.style.display = "inline-block";
  } else {
    addButton.style.display = "inline-block";
    acceptButton.style.display = "none";
    clearButton.style.display = "none";
    balken.style.display = "none";
  }
}

/** Clears the input field and updates the buttons */
function clearInput() {
  let input = document.getElementById("subtask_input");
  input.value = "";
  changeButtons();
}

/** Enables editing of a subtask when the edit button is clicked */
function editSubtask(button) {
  let li = button.closest("li");
  let span = li.querySelector(".subtask-text");

  let input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";

  li.replaceChild(input, span);
  input.focus();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      saveEdit(input, li);
    }
  });
  input.addEventListener("blur", function () {
    saveEdit(input, li);
  });
}

/** Handles clicks on a subtask and toggles edit mode */
function handleSubtaskClick(event, li) {
  if (
    event.target.closest(".icon-btn.delete-btn") ||
    event.target.closest(".icon-btn.delete-btn img")
  )
    return;

  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let editImg = editBtn.querySelector("img");

  if (editImg.src.includes("check.svg")) {
    stopEditMode(li);
  } else {
    startEditMode(li);
  }
}

/** Starts the edit mode for a subtask and shows the input field */
function startEditMode(li) {
  li.classList.add("edit-mode");

  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let deleteBtn = li.querySelector(".icon-btn.delete-btn");
  let separator = li.querySelector(".vl-small");

  let editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/check_subtask.svg";
  editImg.alt = "Check";
  editImg.classList.add("check_icon_subtask");

  let parent = editBtn.parentNode;
  parent.insertBefore(deleteBtn, editBtn);
  parent.insertBefore(separator, editBtn);

  let span = li.querySelector(".subtask-text");
  if (!span) return;

  let input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";
  li.replaceChild(input, span);
  input.focus();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") saveEdit(input, li);
  });
  input.addEventListener("blur", function () {
    saveEdit(input, li);
  });
}

/** Stops the edit mode and saves the subtask value */
function stopEditMode(li) {
  li.classList.remove("edit-mode");

  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let deleteBtn = li.querySelector(".icon-btn.delete-btn");
  let separator = li.querySelector(".vl-small");

  let editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/edit.svg";
  editImg.alt = "Edit";
  editImg.classList.remove("check_icon_subtask");

  let parent = editBtn.parentNode;

  // Edit-Button wieder an den Anfang setzen
  parent.insertBefore(editBtn, parent.firstChild);

  // Separator wieder vor Delete setzen
  parent.insertBefore(deleteBtn, );

  // falls Input noch offen ist → speichern
  let input = li.querySelector(".edit-input");
  if (input) {
    saveEdit(input, li);
  }
}


/** Saves the edited subtask or removes it if the input is empty */

function saveEdit(input, li) {
  let newValue = input.value.trim();
  if (newValue !== "") {
    let span = document.createElement("span");
    span.className = "subtask-text list";
    span.textContent = newValue;
    li.replaceChild(span, input);

    // zurück aus dem Edit-Modus
    li.classList.remove("edit-mode");

    let editBtn = li.querySelector(".icon-btn.edit-btn");
    let editImg = editBtn.querySelector("img");
    editImg.src = "./assets/icons/edit.svg";
    editImg.alt = "Edit";
    editImg.classList.remove("check_icon_subtask");
  } else {
    li.remove();
  }
}

/** Deletes a subtask from the list */
function deleteSubtask(button) {
  let li = button.closest("li");
  if (li) li.remove();
}

/** Adds hover effects to subtasks; shows edit buttons on mouseover, hides them on mouseout */
function addSubtaskHoverEffectsWithDelegation() {
  document.body.addEventListener("mouseover", function (e) {
    const subtaskElement = e.target.closest(".subtask-listelement");
    if (subtaskElement) {
      const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
      if (editButtons) {
        editButtons.classList.remove("d-none");
      }
    }
  });

  document.body.addEventListener("mouseout", function (e) {
    const subtaskElement = e.target.closest(".subtask-listelement");
    if (subtaskElement) {
      if (!subtaskElement.contains(e.relatedTarget)) {
        const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
        if (editButtons) {
          editButtons.classList.add("d-none");
        }
      }
    }
  });
}


