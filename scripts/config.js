 const BASE_URL = "https://joinstorage-e210a-default-rtdb.europe-west1.firebasedatabase.app/";

 
const firebaseConfig = {
  databaseURL: "https://joinstorage-e210a-default-rtdb.europe-west1.firebasedatabase.app/"
};


if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}