function datetimer(){
    let date = document.getElementById('lblGreetings');
  const myDate = new Date();
  const hrs = myDate.getHours();

  let greet;

  if (hrs < 12)
    greet = 'Good Morning';
  else if (hrs >= 12 && hrs <= 17)
    greet = 'Good Afternoon';
  else if (hrs >= 17 && hrs <= 24)
    greet = 'Good Evening';
        date.innerHTML =
    '<b>' + greet + '</b> <p class="greet_name"> and welcome Alex & Marina & Alex 🙂</p>';
}
