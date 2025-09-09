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
  if (!button) return;
  let li = button.closest("li");
  if (!li) return;
  let span = li.querySelector(".subtask-text");
  if (!span) return;

  let input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.className = "edit-input";

  li.replaceChild(input, span);
  input.focus();

    input.addEventListener("keydown", e => {
    if (e.key === "Enter") saveEdit(input, li);
    });
    
  input.addEventListener("blur", function () {
    saveEdit(input, li);
  });
}

/** Handles clicks on a subtask and toggles edit mode */
function handleSubtaskClick(event, li) {
  // Verhindere Event-Handling wenn auf Delete-Button geklickt wird
  if (
    event.target.closest(".icon-btn.delete-btn") ||
    event.target.closest(".icon-btn.delete-btn img")
  ) {
    return;
  }

  // Prüfe ob bereits im Edit-Modus
  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let editImg = editBtn.querySelector("img");

  if (li.classList.contains("edit-mode")) {
    // Wenn im Edit-Modus und auf Check-Button geklickt -> beende Edit-Modus
    if (event.target.closest(".icon-btn.edit-btn") || event.target.closest(".icon-btn.edit-btn img")) {
      stopEditMode(li);
    }
    // Ansonsten tue nichts (lass Input-Field aktiv)
  } else {
    // Starte Edit-Modus
    startEditMode(li);
  }
}

/** Starts the edit mode for a subtask and shows the input field */
function startEditMode(li) {
  li.classList.add("edit-mode");

  let editBtn = li.querySelector(".icon-btn.edit-btn");
  let deleteBtn = li.querySelector(".icon-btn.delete-btn");
  let separator = li.querySelector(".vl-small");
  let buttonsContainer = li.querySelector(".subtask-edit-btns");

  // Zeige Buttons permanent im Edit-Modus
  buttonsContainer.classList.remove("d-none");

  let editImg = editBtn.querySelector("img");
  editImg.src = "./assets/icons/check_subtask.svg";
  editImg.alt = "Check";
  editImg.classList.add("check_icon_subtask");

  // Ändere Button-Reihenfolge
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

  // Event Listeners für Input
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      stopEditMode(li);
    }
  });
  
  input.addEventListener("blur", function (e) {

    setTimeout(() => {
      if (!li.classList.contains("edit-mode")) return; // Edit-Modus bereits beendet
      
      // Beende Edit-Modus nur wenn nicht auf Check-Button geklickt wurde
      let activeElement = document.activeElement;
      if (!activeElement || !activeElement.closest(".icon-btn.edit-btn")) {
        stopEditMode(li);
      }
    }, 10);
  });
}

/** Stops the edit mode and saves the subtask value */
function stopEditMode(li) {
  let input = li.querySelector(".edit-input");
  if (!input) return;

  let newValue = input.value.trim();
  
  if (newValue !== "") {
    // Erstellt neuen Span
    let span = document.createElement("span");
    span.className = "subtask-text list";
    span.textContent = newValue;
    li.replaceChild(span, input);

    // remove Edit-Modus
    li.classList.remove("edit-mode");

    let editBtn = li.querySelector(".icon-btn.edit-btn");
    let deleteBtn = li.querySelector(".icon-btn.delete-btn");
    let separator = li.querySelector(".vl-small");
    let buttonsContainer = li.querySelector(".subtask-edit-btns");

    buttonsContainer.classList.add("d-none");

    let editImg = editBtn.querySelector("img");
    editImg.src = "./assets/icons/edit.svg";
    editImg.alt = "Edit";
    editImg.classList.remove("check_icon_subtask");

    let parent = editBtn.parentNode;
    parent.insertBefore(editBtn, parent.firstChild);
    parent.insertBefore(separator, deleteBtn);
  } else {
    li.remove();
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
  console.log("Hover effects added");
  
  document.body.addEventListener("mouseover", function (e) {
    const subtaskElement = e.target.closest(".subtask-listelement");
    if (subtaskElement && !subtaskElement.classList.contains("edit-mode")) {
      const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
      if (editButtons) {
        editButtons.classList.remove("d-none");
      }
    }
  });

  document.body.addEventListener("mouseout", function (e) {
    const subtaskElement = e.target.closest(".subtask-listelement");
    if (subtaskElement && !subtaskElement.classList.contains("edit-mode")) {
      if (!subtaskElement.contains(e.relatedTarget)) {
        const editButtons = subtaskElement.querySelector(".subtask-edit-btns");
        if (editButtons) {
          editButtons.classList.add("d-none");
        }
      }
    }
  });
}


