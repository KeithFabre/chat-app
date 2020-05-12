const express = require("express")
const app = express()
const server = require("http").Server(app) //server that will comunicate with socket.io
const io = require("socket.io")(server) //creates a server in port 3000

app.set("views", "./views")
//use ejs to parse our views
app.set("view engine", "ejs")
app.use(express.static("public"))
//use urlencoded params instead of a body for a form
app.use(express.urlencoded({ extended: true }))

const rooms = {}

app.get("/", (req, res) => {
	res.render("index", { rooms: rooms }) //rooms variable will be passed to view
})

app.post("/room", (req, res) => {
	//check with room already exists
	if (rooms[req.body.room] != null) {
		return res.redirect("/") //exit
	}
	//adding new room to rooms variable
	rooms[req.body.room] = { users: {} } //begins with no users
	res.redirect(req.body.room)
	//send message that new room was created
	io.emit("room-created", req.body.room)
})

//room will be passed in the route
app.get("/:room", (req, res) => {
	if (rooms[req.params.room] == null) {
		return res.redirect("/")
	}
	res.render("room", { roomName: req.params.room })
})

server.listen(3000)

//gives users its own socket on every reload
io.on("connection", (socket) => {
	socket.on("new-user", (room, name) => {
		socket.join(room) //send this user to this room
		//add users from that specific room
		rooms[room].users[socket.id] = name //all sockets have an unique id
		socket.to(room).broadcast.emit("user-connected", name)
	})
	socket.on("send-chat-message", (room, message) => {
		//sends to every user except who sent the msg
		socket.to(room).broadcast.emit("chat-message", {
			message: message,
			name: rooms[room].users[socket.id],
		})
	})
	socket.on("disconnect", () => {
      //disconnect and send message to all rooms user is part of
		getUserRooms(socket).forEach((room) => {
			socket.to(room).broadcast.emit("user-disconnected", rooms[room].users[socket.id])
			delete rooms[room].users[socket.id]
		})
	})
})

//return all of the users' rooms that they're in
function getUserRooms(socket) {
	//check all the rooms and return the names of the ones that the user is a part of
	return Object.entries(rooms).reduce((names, [name, room]) => {
		if (room.users[socket.id] != null) names.push(name)
		return names
	}, [])
}
