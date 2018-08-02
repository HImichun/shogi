const express = require("express")
// const bodyParser = require("body-parser")

const app = express()

const server = require("http").Server(app)
const io = require("socket.io")(server)


app.use(express.static(__dirname+"/public"))


app.get("/", (req,res) => {
	res.sendFile(__dirname+"/public/index.html")
})

app.get("/online", (req,res) => {
	res.sendFile(__dirname+"/public/online.html")
})

app.get("/hotseat", (req,res) => {
	res.sendFile(__dirname+"/public/hotseat.html")
})


const Room = require("./room")
const rooms = {}
function removeRoom(roomName){
	delete rooms[roomName]
}

io.on("connection", socket => {
	console.log("a user connected")

	socket.on("disconnect", () => {
		console.log("a user disconnected")
		socket.room.leave(socket)
	})

	socket.on("room-name", name => {
		if( !rooms.hasOwnProperty(name) )
			rooms[name] = new Room(name, socket, removeRoom)
		else
			rooms[name].enter(socket)
	})

	socket.on("action", (action) => {
		if(socket.room)
			socket.room.action(socket,action)
	})

})


server.listen(3000, ()=>{
	console.log(":3")
})