 
const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

//events that happen only on chat rooms
if (messageForm != null) {
   const name = prompt('What is your name?')
   appendMessage('You joined')
   socket.emit('new-user', roomName, name)

   messageForm.addEventListener("submit", (e) => {
      e.preventDefault() //avoids page from refreshing
      const message = messageInput.value
      //don't send empty messages
      if (message) {
         appendMessage(`You: ${message}`)
         //sends information from the client to the server 
         socket.emit("send-chat-message", roomName, message)
         messageInput.value = '' //clear input
      } else {
         messageInput.value = '' 
      }
   })
}

//display the new room on screen
socket.on('room-created', room => {
   const roomElement = document.createElement('div')
   roomElement.innerText = room
   roomElement.classList.add("room-name") //for styling
   const roomLink = document.createElement('a')
   roomLink.href = `/${room}`
   roomLink.innerText = 'join'
   roomContainer.append(roomElement)
   roomContainer.append(roomLink)
})

socket.on("chat-message", data => {
	appendMessage(`${data.name}: ${data.message}`)
})

socket.on("user-connected", name => {
	appendMessage(`${name} connected`)
})

socket.on("user-disconnected", name => {
	appendMessage(`${name} disconnected`)
})


function appendMessage(message) {
   const messageElement = document.createElement('div')
   messageElement.innerText = message
   messageContainer.append(messageElement)
}