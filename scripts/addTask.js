 function addTask() {

    }
function changePriority(selectElement) {
    const value = selectElement.value;

    if (value === "low") {
        selectElement.style.backgroundColor = "lightgreen";
        selectElement.style.color = "black";
    } else if (value === "medium") {
        selectElement.style.backgroundColor = "orange";
        selectElement.style.color = "white";
    } else if (value === "urgent") {
        selectElement.style.backgroundColor = "red";
        selectElement.style.color = "white";
    } else {
        selectElement.style.backgroundColor = "white";
        selectElement.style.color = "black";
    }
}