
function saveStatusToLocalStorage() {
  try {
    const status = {};
    allTasks.forEach(task => {
      status[task.id] = {
        status: task.status
      };
    });
    
    const statusJSON = JSON.stringify(status);
    localStorage.setItem('taskStatus', statusJSON);
    return true;
  } catch (error) {
    return false;
  }
}


function loadStatusFromLocalStorage() {
  try {
    const statusJSON = localStorage.getItem("taskStatus");
    if (!statusJSON) return null;
    
    return JSON.parse(statusJSON);
  } catch (error) {
    return null;
  }
}


function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}


async function setTaskStatus() {
  if (!isLocalStorageAvailable()) return;
  
  const savedStatus = loadStatusFromLocalStorage();
  
  if (savedStatus) {
    allTasks.forEach(task => {
      if (savedStatus[task.id]) {
        task.status = savedStatus[task.id].status;
      }
    });
  } else {
    const tasksToModify = allTasks.slice(0, 2);
    
    if (tasksToModify.length >= 2) {
      tasksToModify[0].status = "toDo";
      
      tasksToModify[1].status = "toDo";
      
      saveStatusToLocalStorage();
    }
  }
  
  updateHTML();
}

