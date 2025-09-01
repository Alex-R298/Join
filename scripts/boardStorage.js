
function saveCategoriesToLocalStorage() {
  try {
    const categories = {};
    allTasks.forEach(task => {
      categories[task.id] = {
        category: task.category,
        originalCategory: task.originalCategory || task.category
      };
    });
    
    const categoriesJSON = JSON.stringify(categories);
    localStorage.setItem('taskCategories', categoriesJSON);
    return true;
  } catch (error) {
    return false;
  }
}


function loadCategoriesFromLocalStorage() {
  try {
    const categoriesJSON = localStorage.getItem('taskCategories');
    if (!categoriesJSON) return null;
    
    return JSON.parse(categoriesJSON);
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


async function setSpecialCategories() {
  if (!isLocalStorageAvailable()) return;
  
  const savedCategories = loadCategoriesFromLocalStorage();
  
  if (savedCategories) {
    allTasks.forEach(task => {
      if (savedCategories[task.id]) {
        task.category = savedCategories[task.id].category;
        task.originalCategory = savedCategories[task.id].originalCategory;
      }
    });
  } else {
    const tasksToModify = allTasks.slice(0, 2);
    
    if (tasksToModify.length >= 2) {
      tasksToModify[0].originalCategory = "technical-task"; // die muss gar nicht geändert werden, kann also eigentlich raus
      tasksToModify[0].category = "toDo"; // sollte lieber "status" sein. Ergibt vom naming mehr Sinn
      
      tasksToModify[1].originalCategory = "user-story";
      tasksToModify[1].category = "toDo";
      
      saveCategoriesToLocalStorage();
    }
  }
  
  updateHTML();
}

