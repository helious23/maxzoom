const socket = io();

const nickname = document.getElementById("name");
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");

const nameForm = nickname.querySelector("form");

welcome.hidden = true;
room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

const showRoomNameForm = () => {
  nickname.hidden = true;
  welcome.hidden = false;
};

// div#welcome 숨기고 div#room 나타나게 함. roomName 보이게 함.
const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("#room h3");
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

const handleNickNameSubmit = (e) => {
  e.preventDefault();
  const input = nickname.querySelector("input");
  const name = input.value;
  socket.emit("nickname", name, showRoomNameForm);
  input.value = "";

  const roomNameForm = welcome.querySelector("form");
  roomNameForm.addEventListener("submit", handleRoomSubmit);
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = welcome.querySelector("input");
  roomName = input.value;
  // socket.emit("이벤트명", payload, 서버에서 호출하는 cbFn)
  // input.value 를 payload 로 하여 enter_room event 실행, showRoom 콜백 함수 대기
  socket.emit("enter_room", roomName, showRoom);
  input.value = "";

  const msgForm = room.querySelector("form");
  msgForm.addEventListener("submit", handleMessageSubmit);
};

nameForm.addEventListener("submit", handleNickNameSubmit);

// backend 에서 welcome event 실행 시 addMessage 실행
socket.on("welcome", (user) => {
  addMessage(`${user} 이/가 방에 들어왔습니다.`);
});

socket.on("bye", (user) => {
  addMessage(`${user} 이/가 방을 나갔습니다.`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
