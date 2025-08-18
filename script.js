async function init() {
  datetimer();
  loadHeader();
  loadSidebar();
  fetchen();
}

const BASE_URL = 'https://join-269aa-default-rtdb.europe-west1.firebasedatabase.app/'; 



async function fetchen() {
    let respone = await fetch(`${BASE_URL}.json`);
    let data = await respone.json();
    console.log(data);
    
}