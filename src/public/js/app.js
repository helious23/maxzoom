const socket = io();
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const form = welcome.querySelector("form");

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

// div#welcome 숨기고 div#room 나타나게 함. roomName 보이게 함.
const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
};

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("input");
  const message = input.value;
  socket.emit("new_message", message, roomName, () => {
    console.log(message);
    addMessage(`나 : ${message}`);
  });
  input.value = "";
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = form.querySelector("input");
  roomName = input.value;
  // socket.emit("이벤트명", payload, 서버에서 호출하는 cbFn)
  // input.value 를 payload 로 하여 enter_room event 실행, showRoom 콜백 함수 대기
  socket.emit("enter_room", input.value, showRoom);
  input.value = "";

  const msgForm = room.querySelector("form");
  msgForm.addEventListener("submit", handleMessageSubmit);
};

form.addEventListener("submit", handleRoomSubmit);

// backend 에서 welcome event 실행 시 addMessage 실행
socket.on("welcome", () => {
  addMessage("Someone Joined!");
});

socket.on("bye", () => {
  addMessage("Someone Left");
});

socket.on("new_message", addMessage);
