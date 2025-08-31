function toggleEditUserDropdown() {
    const dropdown = document.getElementById('edit-user-dropdown');
    const arrow = document.querySelector('#edit-assigned-input + .dropdown-arrow');
    const input = document.getElementById('edit-assigned-input');
    
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
        document.querySelectorAll("#edit-user-dropdown .assigned-user-item").forEach((item) => {
            item.style.display = "flex";
        });
    }
}

function filterEditUsers(searchTerm) {
    const userItems = document.querySelectorAll('#edit-user-dropdown .assigned-user-item');
    const search = searchTerm.toLowerCase();
    
    userItems.forEach(item => {
        const name = item.getAttribute('data-name');
        if (name.includes(search)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function updateEditAssignedAvatars() {
    const checkedBoxes = document.querySelectorAll('#edit-user-dropdown input[type="checkbox"]:checked');
    const avatarsContainer = document.getElementById('edit-assigned-avatars');
    
    avatarsContainer.innerHTML = '';
    
    checkedBoxes.forEach(checkbox => {
        const userItem = checkbox.closest('.assigned-user-item');
        const avatar = userItem.querySelector('.contact-avatar').cloneNode(true);
        avatarsContainer.appendChild(avatar);
    });
}

// Subtask-Funktionen für Edit
function changeEditButtons() {
    let acceptButton = document.getElementById("editAcceptButton");
    let addButton = document.getElementById("editAddButton");
    let clearButton = document.getElementById("editClearButton");
    let input = document.getElementById("edit-subtask-input");

    if (input.value.trim() !== "") {
        addButton.style.display = "none";
        acceptButton.style.display = "inline-block";
        clearButton.style.display = "inline-block";
    } else {
        addButton.style.display = "inline-block";
        acceptButton.style.display = "none";
        clearButton.style.display = "none";
    }
}

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

function clearEditInput() {
    let input = document.getElementById("edit-subtask-input");
    input.value = "";
    changeEditButtons();
}

function handleEditSubtaskClick(event, li) {
    if (
        event.target.closest(".icon-btn.delete-btn") ||
        event.target.closest(".icon-btn.delete-btn img")
    )
        return;

    let editBtn = li.querySelector(".icon-btn.edit-btn");
    let editImg = editBtn.querySelector("img");

    if (editImg.src.includes("check.svg")) {
        stopEditSubtaskEditMode(li);
    } else {
        startEditSubtaskEditMode(li);
    }
}

function startEditSubtaskEditMode(li) {
    let editBtn = li.querySelector(".icon-btn.edit-btn");
    let deleteBtn = li.querySelector(".icon-btn.delete-btn");
    let separator = li.querySelector(".vl-small");

    let editImg = editBtn.querySelector("img");
    editImg.src = "./assets/icons/check.svg";
    editImg.alt = "Check";

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
        if (e.key === "Enter") saveEditSubtaskEdit(input, li);
    });
    input.addEventListener("blur", function () {
        saveEditSubtaskEdit(input, li);
    });
}

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

function saveEditSubtaskEdit(input, li) {
    let newValue = input.value.trim();
    if (newValue !== "") {
        let span = document.createElement("span");
        span.className = "subtask-text";
        span.textContent = newValue;
        li.replaceChild(span, input);
    } else {
        li.remove();
    }
}

function deleteEditSubtask(button) {
    let li = button.closest("li");
    if (li) li.remove();
}


// async function saveEditedTask(taskId) {
//     const task = allTasks.find(t => t.id === taskId);
//     if (!task) return;
    
//     const assignedCheckboxes = document.querySelectorAll('#edit-user-dropdown input[type="checkbox"]:checked');
//     const assignedUsers = Array.from(assignedCheckboxes).map(cb => cb.value);
//     const subtaskElements = [];
//     const subtaskItems = document.querySelectorAll('#editMyList .subtask-text');
//     subtaskItems.forEach(item => {
//         subtaskElements.push({
//             text: item.textContent,
//             completed: false
//         });
//     });
    
//     task.title = document.getElementById('edit-title').value;
//     task.description = document.getElementById('edit-description').value;
//     task.dueDate = document.getElementById('edit-datepicker').value;
//     task.priority = selectedPriority;
//     task.assignedTo = assignedUsers.length > 0 ? assignedUsers[0] : null;
//     task.subtaskElements = subtaskElements;
    
//     await saveTaskToFirebase(task);
//     closeTaskOverlay();
//     updateHTML();
// }

// 3. ANGEPASSTE saveEditedTask Funktion
async function saveEditedTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const assignedCheckboxes = document.querySelectorAll('#edit-user-dropdown input[type="checkbox"]:checked');
    const assignedUsers = Array.from(assignedCheckboxes).map(cb => cb.value);
    const subtaskElements = [];
    const subtaskItems = document.querySelectorAll('#editMyList .subtask-text');
    subtaskItems.forEach(item => {
        subtaskElements.push({
            text: item.textContent,
            completed: false
        });
    });
    
    task.title = document.getElementById('edit-title').value;
    task.description = document.getElementById('edit-description').value;
    task.dueDate = document.getElementById('edit-datepicker').value;
    task.priority = selectedPriority;
    task.assignedTo = assignedUsers.length > 0 ? [...assignedUsers] : [];
    task.subtaskElements = subtaskElements;
    
    await saveTaskToFirebase(task);
    closeTaskOverlay();
    updateHTML();
}


async function saveTaskToFirebase(task) {
    const response = await fetch(`${BASE_URL}/task/${task.id}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
    return response.ok;
}

async function editTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const container = document.getElementById("task-detail-container");
    const usersArray = await loadUsers();
    selectedPriority = task.priority;
    container.innerHTML = getEditTaskTemplate(task, usersArray);

     addSubtaskHoverEffectsWithDelegation();
}

async function deleteTask(taskId) {
    const response = await fetch(`${BASE_URL}/task/${taskId}.json`, {
        method: "DELETE"
    });
    if (response.ok) {
        allTasks = allTasks.filter(t => t.id !== taskId);
        updateHTML();
        closeTaskOverlay();
    }
}


function closeEditTaskOverlay() {
    const overlay = document.getElementById("edit-task-overlay");
    overlay.classList.remove("visible");
    setTimeout(() => {
        overlay.classList.add("d-none");
    }, 500);
}