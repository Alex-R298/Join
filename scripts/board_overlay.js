/**
 * Öffnet das Overlay zum Hinzufügen eines Tasks.
 * @param {string} [status="toDo"] - Vorgabe-Status.
 */
async function showAddTaskOverlay(status = 'toDo') {
    if (window.matchMedia("(max-width: 800px)").matches) {
        window.location.href = 'add_task.html';
        return; 
    }
    currentTaskStatus = status;
    const overlay = document.getElementById("add-task-overlay");
    const container = document.getElementById("add-task-container");
    overlay.classList.remove("d-none");
    document.body.style.overflow = "hidden";
    document.getElementById("btn-overlay-close").classList.remove("d-none");
    container.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("click", closeAddTaskOverlay);
    setTimeout(() => {
        overlay.classList.add("visible");
    }, 10);
}


/**
 * Öffnet das Overlay für Details eines Tasks.
 * @param {string} taskId - ID des Tasks.
 */
function openTaskOverlay(taskId) {
    const overlay = document.getElementById("detailed-task-overlay");
    const container = document.getElementById("task-detail-container");
    const task = allTasks.find((t) => t.id === taskId);
    document.body.style.overflow = 'hidden';
    if (!task) return;
    overlay.classList.remove("d-none");
    container.innerHTML = taskDetailOverlayTemplate(task);
    document.body.classList.add("no-markers"); 
    container.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("click", closeTaskOverlay);
    setTimeout(() => {
        overlay.classList.add("visible");
    }, 10);
}


/**
 * Schließt das Task-Detail-Overlay.
 */
function closeTaskOverlay() {
    const overlay = document.getElementById("detailed-task-overlay");
    const container = document.getElementById("task-detail-container");
    container.classList.add("closing");
    overlay.classList.remove("visible");
    setTimeout(() => {
        overlay.classList.add("d-none");
        document.body.style.overflow = "auto";
        document.body.classList.remove("no-markers");
        container.classList.remove("closing");
    }, 500);
}
