 function addTask() {

    }
let selectedPriority = null;

function selectPriority(button) {
  const buttons = document.querySelectorAll('.priority-btn');

  
  buttons.forEach(btn => {
    btn.style.backgroundColor = '';
    btn.style.color = '';
  });

 
  if (button.dataset.priority === 'urgent') {
    button.style.backgroundColor = 'red';
    button.style.color = 'white';
  } else if (button.dataset.priority === 'medium') {
    button.style.backgroundColor = 'orange';
    button.style.color = 'white';
  } else if (button.dataset.priority === 'low') {
    button.style.backgroundColor = 'green';
    button.style.color = 'white';
  }

  selectedPriority = button.dataset.priority;
  console.log("Ausgewählte Priorität:", selectedPriority);
}