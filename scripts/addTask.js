let selectedPriority = "medium";

async function fetchBase() {
  try {
    const res = await fetch(BASE_URL + "/task.json");
    const data = await res.json();
    console.log("Aktuelle Tasks:", data);
  } catch (err) {
    console.error("Fehler beim Laden:", err);
  }
}


async function addTask() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("task_description").value;
  const dueDate = document.getElementById("datepicker").value;
  const assignedTo = document.getElementById("assigned_task").value;   
  const category = document.getElementById("category_task").value;
  
  
  const newTask = { title, description, dueDate, priority: selectedPriority, assignedTo, category };

  fetch(BASE_URL + "/task.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask)
  })
  .then(res => res.json())
  .then(data => {
  console.log("Task gespeichert:", data);
  showPopup();
})
  clearInputs();
}

// function noch kürzen
function selectPriority(button) {
  const buttons = document.querySelectorAll(".priority-btn");

  buttons.forEach((btn) => {
    btn.classList.remove("active");
    btn.style.backgroundColor = "";
    btn.style.color = "";
    const img = btn.querySelector("img");
    if (btn.dataset.priority === "urgent") {
      img.src = "./assets/icons/prio_urgent_red.svg";
    } else if (btn.dataset.priority === "medium") {
      img.src = "./assets/icons/prio_medium_orange.svg";
    } else if (btn.dataset.priority === "low") {
      img.src = "./assets/icons/prio_low_green.svg";
    }
  });

  button.classList.add("active");
  const img = button.querySelector("img");
  switch (button.dataset.priority) {
    case "urgent":
      button.style.backgroundColor = "#FF3D00";
      button.style.color = "white";
      img.src = "./assets/icons/prio_urgent_white.svg"; 
      break;
    case "medium":
      button.style.backgroundColor = "#FFA800";
      button.style.color = "white";
      img.src = "./assets/icons/prio_medium_white.svg"; 
      break;
    case "low":
      button.style.backgroundColor = "#7AE229";
      button.style.color = "white";
      img.src = "./assets/icons/prio_low_white.svg";
      break;
  }

  selectedPriority = button.dataset.priority;
}

async function clearInputs() {
  document.getElementById("title").value = "";
  document.getElementById("task_description").value = "";
  document.getElementById("datepicker").value = ""; 
  document.getElementById("assigned_task").value = "";   
  document.getElementById("category_task").value = "";
}

function showPopup() {
  document.getElementById("taskPopup").style.display = "flex";

  setTimeout(() => {
    closePopup();
  }, 1500);
}

function closePopup() {
  document.getElementById("taskPopup").style.display = "none";
}