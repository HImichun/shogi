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


const rooms = {}

io.on("connection", socket => {
	console.log("a user connected")

	socket.on("disconnect", () => {
		console.log("a user disconnected")
		if(socket.other){
			socket.other.emit("message","your opponent has disconnected ;-;")
			socket.other.other = null
			socket.other.roomName = null
		}
		if(socket.roomName){
			delete rooms[socket.roomName]
		}
	})

	socket.on("room-name", name => {
		if( !rooms.hasOwnProperty(name) ){
			socket.roomName = name
			rooms[name] = [socket]
			socket.emit("message", `you created a room called \"${name}\". don't touch anything please`)
		}
		else if( rooms[name].length == 1 ){
			socket.roomName = name

			rooms[name][1] = socket
			rooms[name][0].other = socket

			socket.emit("message", `you entered the room. gl hf ;3`)
			
			socket.other = rooms[name][0]
			socket.other.emit("message", "now you can play! gl hf ;3")
		}
		else
			socket.emit("message", "the room is full, sorry. reload the page to try a different room")
	})

	socket.on("click", (x,y) => {
		if(socket.other)
			socket.other.emit("click", x,y)
		else
			socket.emit("message", "you're playing with no one.")
	})

	socket.on("hand-click", number => {
		if(socket.other)
			socket.other.emit("hand-click", number)
		else
			socket.emit("message", "you're playing with no one.")
	})

})


server.listen(3000, ()=>{
	console.log(":3")
})