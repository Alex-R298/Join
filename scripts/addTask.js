 function addTask() {
    }

let selectedPriority = null;

function selectPriority(button) {
  const buttons = document.querySelectorAll(".priority-btn");

  buttons.forEach((btn) => {
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
  console.log("Ausgewählte Priorität:", selectedPriority);
}