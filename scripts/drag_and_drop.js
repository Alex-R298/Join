let currentDraggedElement = null;
let draggedTaskHeight = 0;
let taskStatus = null;
let placeholderElement = null;


function allowDrop(event) {
    event.preventDefault();
}


function startDragging(id, event) {
    currentDraggedElement = id;
    const taskIndex = allTasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) taskStatus = allTasks[taskIndex].status;
    else return;
    const taskElement = event.target.closest('.task-container');
    if (!taskElement) return;
    draggedTaskHeight = taskElement.offsetHeight;
    createPlaceholder(taskElement, draggedTaskHeight, taskElement.offsetWidth);
    setupDragImage(event, taskElement, id);
    requestAnimationFrame(() => {
        taskElement.classList.add('dragging');
        if (placeholderElement) setTimeout(() => placeholderElement.classList.add('visible'), 100);
    });
}


function setupDragImage(event, taskElement, id) {
    if (!event.dataTransfer) return;
    const rect = taskElement.getBoundingClientRect();
    const clone = taskElement.cloneNode(true);
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    event.dataTransfer.setDragImage(clone, event.clientX - rect.left, event.clientY - rect.top);
    event.dataTransfer.setData('text/plain', id);
    setTimeout(() => document.body.removeChild(clone), 0);
}


function createPlaceholder(taskElement, height, width) {
    if (placeholderElement && placeholderElement.parentNode) {
        placeholderElement.parentNode.removeChild(placeholderElement);
    }
    placeholderElement = document.createElement('div');
    placeholderElement.className = 'drag-placeholder';
    placeholderElement.id = `placeholder-${currentDraggedElement}`;
    placeholderElement.style.width = '246px';
    placeholderElement.style.border = '1px dashed #a8a8a8';
    placeholderElement.style.borderRadius = '24px';
    placeholderElement.style.backgroundColor = '#e7e7e7';
    placeholderElement.style.margin = '0 0 16px 0';
    placeholderElement.style.height = height + 'px';
    placeholderElement.style.display = 'flex';
    placeholderElement.style.justifyContent = 'center';
    placeholderElement.style.alignItems = 'center';
    placeholderElement.style.pointerEvents = 'none';
    taskElement.parentNode.insertBefore(placeholderElement, taskElement.nextSibling);
}


function handleDragOver(event, containerId) {
    event.preventDefault();
    const container = document.getElementById(containerId);
    if (!placeholderElement) return;
    const emptyContainer = container.querySelector('.empty-container');
    if (emptyContainer) emptyContainer.style.display = 'none';
    container.classList.add('drag-over');
    const afterElement = getDragAfterElement(container, event.clientY);
    if (shouldMovePlaceholder(afterElement, container)) {
        movePlaceholder(container, afterElement);
    }
}


function shouldMovePlaceholder(afterElement, container) {
    const currentParent = placeholderElement.parentNode;
    const currentNextSibling = placeholderElement.nextSibling;
    return afterElement == null 
        ? currentParent !== container || currentNextSibling !== null
        : currentNextSibling !== afterElement;
}


function movePlaceholder(container, afterElement) {
    placeholderElement.style.transition = 'none';
    if (afterElement == null) container.appendChild(placeholderElement);
    else container.insertBefore(placeholderElement, afterElement);
    void placeholderElement.offsetHeight;
    placeholderElement.style.transition = 'all 0.3s ease';
    placeholderElement.classList.add('visible');
}


function handleDragLeave(event, containerId) {
    event.preventDefault();
    const container = document.getElementById(containerId);
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !container.contains(relatedTarget)) {
        container.classList.remove('drag-over');
    }
}


function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-container:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}


async function moveTo(status, event) {
    event.preventDefault();
    let taskId = event.dataTransfer ? event.dataTransfer.getData('text/plain') : currentDraggedElement;
    if (!taskId) return;
    const draggingItem = document.getElementById(`task-${taskId}`);
    if (!draggingItem) return;
    replacePlaceholderWithTask(draggingItem);
    animateTaskIn(draggingItem);
    cleanupDragState();
    updateTaskStatus(taskId, status);
    updateAllTasksFromDOM();
    setTimeout(() => updateEmptyContainers(), 400);
    await saveTask(taskId, status);
    if (typeof updateDashboardCounts === 'function') updateDashboardCounts();
    currentDraggedElement = null;
}


function replacePlaceholderWithTask(draggingItem) {
    draggingItem.style.transition = 'none';
    draggingItem.style.transform = 'scale(0.8)';
    draggingItem.style.opacity = '0';
    if (placeholderElement && placeholderElement.parentNode) {
        placeholderElement.parentNode.replaceChild(draggingItem, placeholderElement);
        placeholderElement = null;
    }
}


function animateTaskIn(draggingItem) {
    requestAnimationFrame(() => {
        draggingItem.style.transition = 'all 0.3s ease';
        draggingItem.style.transform = 'scale(1)';
        draggingItem.style.opacity = '1';
        draggingItem.classList.remove('dragging');
    });
}


function cleanupDragState() {
    document.querySelectorAll('.drag-over').forEach(container => {
        container.classList.remove('drag-over');
    });
}


function updateTaskStatus(taskId, status) {
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        allTasks[taskIndex].status = status;
    }
}


async function saveTask(taskId, status) {
    if (isLocalStorageAvailable()) {
        saveStatusToLocalStorage();
    } else {
        await saveTaskToFirebase(taskId, status);
    }
}


function updateAllTasksFromDOM() {
    const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
    let newAllTasks = [];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        const tasksInContainer = [...container.querySelectorAll('.task-container')];
        tasksInContainer.forEach((taskElement, index) => {
            const taskId = taskElement.id.replace('task-', '');
            const task = allTasks.find(t => t.id === taskId);
            if (task) {
                task.status = containerId;
                task.order = index;
                newAllTasks.push(task);
            }
        });
    });
    allTasks = newAllTasks;
}


function cancelDragging() {
    if (!currentDraggedElement) return;
    const draggingItem = document.getElementById(`task-${currentDraggedElement}`);
    if (draggingItem) {
        draggingItem.style.display = '';
        draggingItem.classList.remove('dragging');
    }
    document.querySelectorAll('.drag-over').forEach(container => {
        container.classList.remove('drag-over');
    });
    if (placeholderElement && placeholderElement.parentNode) {
        placeholderElement.parentNode.removeChild(placeholderElement);
        placeholderElement = null;
    }
    updateHTML();
    currentDraggedElement = null;
}


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentDraggedElement) {
        cancelDragging();
    }
});


document.addEventListener('dragend', (e) => {
    if (currentDraggedElement && placeholderElement) {
        setTimeout(() => {
            if (placeholderElement && placeholderElement.parentNode) {
                cancelDragging();
            }
        }, 100);
    }
});


