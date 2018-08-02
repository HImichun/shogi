module.exports = class Room{
	constructor(name,first,remove){
		this.name = name
		this.first = first
		this.second = null
		this.history = [/* {type:"move", player:0, x:1,y:2} */]

		this.remove = remove

		this.first.room = this
		this.first.emit("player-number", 0)
		this.first.emit("message", `You've created a room called ${name}. Please wait for your opponent.`)
	}
	get length(){
		let l = 0
		l += this.first ? 1 : 0
		l += this.second? 1 : 0
		return l
	}
	get canPlay(){
		return this.length == 2
	}

	enter(socket){
		if( this.length <= 1 ){
			if(this.first){
				this.second = socket
				socket.emit("player-number", 1)
			}
			else{
				this.first = socket
				socket.emit("player-number", 0)
			}

			if(this.history.length)
				socket.emit("history", this.history)

			socket.room = this

			this.first.other = this.second
			this.second.other = this.first
			this.sockets = [this.first, this.second]
			socket.emit("message", `You've joined a room called ${this.name}. gl hf`)
			socket.other.emit("message", "Your opponent has joined the game. gl hf")
		}
		else{
			socket.emit("message", "The room is full, sorry. Reload the page to try a different room.")
		}
	}
	leave(socket){
		if(this.first == socket)
			this.first = null
		else
			this.second = null

		if(this.length <= 0)
			this.remove(this.name)
		else
			socket.other.emit("message", "Your opponet has disconnected.")
	}

	action(socket,action){
		if(this.canPlay){
			if(action.type != "rewind"){
				if(socket == this.first)
					action.player = 0
				else
					action.player = 1
				this.history.push(action)
			}
			socket.other.emit( "action", action )
		}
		else
			socket.emit("message", "Stop it. wait for the other player to join!")

	}
}