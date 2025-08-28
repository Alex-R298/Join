let currentDraggedElement = null;
let draggedTaskHeight = 0;
let removedTaskElement = null;
let originalTaskCategory = null;

function allowDrop(event) {
  event.preventDefault();
}

async function moveTo(category, event) {
    event.preventDefault();
    let taskId;
    if (event.dataTransfer) {
        taskId = event.dataTransfer.getData('text/plain');
    } else {
        taskId = currentDraggedElement;
    }
    if (!taskId) {
        return;
    }
    try {
        const taskIndex = allTasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return;
        }
        allTasks[taskIndex].category = category;
        updateHTML();
        const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
        containers.forEach(id => removeHighlight(id));
        if (isLocalStorageAvailable()) {
            saveCategoriesToLocalStorage();
        } else {
            try {
                await saveTaskToFirebase(taskId, category);
            } catch (error) {
            }
        }
        if (typeof updateDashboardCounts === 'function') {
            updateDashboardCounts();
        }
    } catch (error) {
    } finally {
        currentDraggedElement = null;
    }
}

function startDragging(id, event) {
    currentDraggedElement = id;
    const taskIndex = allTasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        originalTaskCategory = allTasks[taskIndex].category;
    }
    const taskElement = event.target.closest('.task-container');
    if (taskElement) {
        draggedTaskHeight = taskElement.offsetHeight;
        if (event.dataTransfer) {
            event.dataTransfer.setDragImage(taskElement, 0, 0);
        }
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', id);
        }
        setTimeout(() => {
            if (currentDraggedElement === id) {
                removedTaskElement = taskElement;
                if (taskElement.parentNode) {
                    taskElement.parentNode.removeChild(taskElement);
                }
            }
        }, 1);
    }
}

function cancelDragging() {
    if (currentDraggedElement && removedTaskElement) {
        const container = document.getElementById(originalTaskCategory);
        if (container) {
            container.appendChild(removedTaskElement);
        }
        
        removedTaskElement = null;
    }
    const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
    containers.forEach(id => removeHighlight(id));
    currentDraggedElement = null;
    originalTaskCategory = null;
}

function initializeHighlightContainers() {
  const containers = ["toDo", "inProgress", "awaitFeedback", "done"];
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    let existingHighlight = document.getElementById(`highlight-${containerId}`);
    if (existingHighlight) {
      return;
    }
    const highlightContainer = document.createElement('div');
    highlightContainer.className = 'highlight-container';
    highlightContainer.id = `highlight-${containerId}`;
    highlightContainer.style.width = '100%';
    highlightContainer.style.border = '1px dashed #a8a8a8';
    highlightContainer.style.borderRadius = '24px';
    highlightContainer.style.backgroundColor = '#e7e7e7';
    highlightContainer.style.margin = '10px 0';
    highlightContainer.style.animation = 'pulse 1.5s infinite';
    highlightContainer.style.height = '100px';
    highlightContainer.style.display = 'none';
    highlightContainer.style.justifyContent = 'center';
    highlightContainer.style.alignItems = 'center';
    highlightContainer.style.pointerEvents = 'none';
    container.appendChild(highlightContainer);
  });
}

function highlight(id) {
  const highlightContainer = document.getElementById(`highlight-${id}`);
  if (highlightContainer) {
    highlightContainer.style.height = draggedTaskHeight > 0 ? `${draggedTaskHeight}px` : '100px';
    highlightContainer.style.display = 'flex';
  }
}

function removeHighlight(id) {
  const highlightContainer = document.getElementById(`highlight-${id}`);
  if (highlightContainer) {
    highlightContainer.style.display = 'none';
  }
}