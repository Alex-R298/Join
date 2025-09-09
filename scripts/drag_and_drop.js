/**
 * Global drag state variables
 */
let currentDraggedElement = null;
let draggedTaskHeight = 0;
let taskStatus = null;
let placeholderElement = null;


/**
 * Allows drop events on containers
 * @param {DragEvent} event - Drag event
 */
function allowDrop(event) {
    event.preventDefault();
}


/**
 * Starts the dragging operation for a task
 * @param {string} id - Task ID
 * @param {DragEvent} event - Drag start event
 */
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


/**
 * Sets up drag image for better visual feedback
 * @param {DragEvent} event - Drag event
 * @param {HTMLElement} taskElement - Task element being dragged
 * @param {string} id - Task ID
 */
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


/**
 * Creates a visual placeholder for the dragged task
 * @param {HTMLElement} taskElement - Original task element
 * @param {number} height - Height of the placeholder
 * @param {number} width - Width of the placeholder
 */
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


/**
 * Handles drag over events on containers
 * @param {DragEvent} event - Drag over event
 * @param {string} containerId - Container ID
 */
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


/**
 * Determines if placeholder should be moved
 * @param {HTMLElement|null} afterElement - Element to insert after
 * @param {HTMLElement} container - Target container
 * @returns {boolean} Should move placeholder
 */
function shouldMovePlaceholder(afterElement, container) {
    const currentParent = placeholderElement.parentNode;
    const currentNextSibling = placeholderElement.nextSibling;
    return afterElement == null 
        ? currentParent !== container || currentNextSibling !== null
        : currentNextSibling !== afterElement;
}


/**
 * Moves the placeholder to new position
 * @param {HTMLElement} container - Target container
 * @param {HTMLElement|null} afterElement - Element to insert after
 */
function movePlaceholder(container, afterElement) {
    placeholderElement.style.transition = 'none';
    if (afterElement == null) container.appendChild(placeholderElement);
    else container.insertBefore(placeholderElement, afterElement);
    void placeholderElement.offsetHeight;
    placeholderElement.style.transition = 'all 0.3s ease';
    placeholderElement.classList.add('visible');
}


/**
 * Handles drag leave events
 * @param {DragEvent} event - Drag leave event
 * @param {string} containerId - Container ID
 */
function handleDragLeave(event, containerId) {
    event.preventDefault();
    const container = document.getElementById(containerId);
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !container.contains(relatedTarget)) {
        container.classList.remove('drag-over');
    }
}


/**
 * Gets element that comes after drag position
 * @param {HTMLElement} container - Target container
 * @param {number} y - Y coordinate
 * @returns {HTMLElement|undefined} Element after drag position
 */
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


/**
 * Moves task to new status column
 * @param {string} status - New task status
 * @param {DragEvent} event - Drop event
 */
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


/**
 * Replaces placeholder with the actual task element
 * @param {HTMLElement} draggingItem - Task element being dragged
 */
function replacePlaceholderWithTask(draggingItem) {
    if (placeholderElement && placeholderElement.parentNode) {
        placeholderElement.parentNode.replaceChild(draggingItem, placeholderElement);
        placeholderElement = null;
        draggingItem.style.transition = 'all 0.3s ease';
        draggingItem.style.transform = 'scale(1)';
        draggingItem.style.opacity = '1';
        draggingItem.classList.remove('dragging');
    }
}


/**
 * Animates task into its new position
 * @param {HTMLElement} draggingItem - Task element
 */
function animateTaskIn(draggingItem) {
    requestAnimationFrame(() => {
        draggingItem.style.transition = 'all 0.3s ease';
        draggingItem.style.transform = 'scale(1)';
        draggingItem.style.opacity = '1';
        draggingItem.classList.remove('dragging');
    });
}


/**
 * Cleans up drag state from DOM elements
 */
function cleanupDragState() {
    document.querySelectorAll('.drag-over').forEach(container => {
        container.classList.remove('drag-over');
    });
}


/**
 * Updates task status and saves to Firebase
 * @param {string} taskId - Task ID
 * @param {string} status - New status
 */
async function updateTaskStatus(taskId, status) {
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        allTasks[taskIndex].status = status;
        await saveTaskToFirebase(allTasks[taskIndex]);
        updateHTML();
    }
}


/**
 * Saves task with new status to Firebase
 * @param {string} taskId - Task ID
 * @param {string} status - New status
 */
async function saveTask(taskId, status) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.status = status;
    await saveTaskToFirebase(task);
}


/**
 * Updates all tasks from current DOM structure
 */
async function updateAllTasksFromDOM() {
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
    
    for (const task of allTasks) {
        await saveTaskToFirebase(task);
    }
}


/**
 * Cancels current drag operation
 */
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


/**
 * Event listener for ESC key to cancel dragging
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentDraggedElement) {
        cancelDragging();
    }
});


/**
 * Event listener for drag end to cleanup
 */
document.addEventListener('dragend', (e) => {
    if (currentDraggedElement && placeholderElement) {
        setTimeout(() => {
            if (placeholderElement && placeholderElement.parentNode) {
                cancelDragging();
            }
        }, 100);
    }
});


