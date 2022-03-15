const socket = io();
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  console.log(message);
  li.innerText = message;
  ul.appendChild(li);
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector("input");
  roomName = input.value;

  // socket.emit("이벤트명", payload, 서버에서 호출하는 cbFn)
  socket.emit("enter_room", input.value, showRoom);
  input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMessage("Someone Joined!");
});
