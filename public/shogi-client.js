class Player{
	constructor(game,id){
		this.game = game
		this.id = id

		this.name = "anon"
		this.hand = { b:0, r:0, g:0, s:0, n:0, l:0, p:0 }
		this.holding = null
		this.createHandEl()
	}
 /*[["l","n","s","g","k","g","s","n","l"],
	[" ","r"," "," "," "," "," ","b"," "],
	["p","p","p","p","p","p","p","p","p"],
	[" "," "," "," "," "," "," "," "," "],
	[" "," "," "," "," "," "," "," "," "],
	[" "," "," "," "," "," "," "," "," "],
	[" "," "," "," "," "," "," "," "," "],
	[" "," "," "," "," "," "," "," "," "],
	[" "," "," "," "," "," "," "," "," "]]*/
	createPieces(layout){
		for( const y in layout ){
			for( const x in layout[y] ){
				let piece
				switch( layout[y][x] ){
					// case "k": piece = new Piece  (this.game, this, {x,y}); break;
					case "k": piece = new King  (this.game, this, {x,y}); break;
					case "b": piece = new Bishop(this.game, this, {x,y}); break;
					case "r": piece = new Rook  (this.game, this, {x,y}); break;
					case "g": piece = new Gold  (this.game, this, {x,y}); break;
					case "s": piece = new Silver(this.game, this, {x,y}); break;
					case "n": piece = new Knight(this.game, this, {x,y}); break;
					case "l": piece = new Lance (this.game, this, {x,y}); break;
					case "p": piece = new Pawn  (this.game, this, {x,y}); break;
					default: break;
				}
				if (piece){
					this.game.pieces.push(piece)
					this.game.board[y][x].piece = piece

					piece.game.boardEl.appendChild( piece.createEl() )
					// piece.rotate()
				}
		}}
	}

	addToHand(letter){
		let visibleAmount = [
			0   ,"一","二","三","四","五","六","七","八","九",
			"十","十一","十二","十三","十四","十五","十六","十七","十八"
		][ ++this.hand[ letter ] ]
		const number = { b:0, r:1, g:2, s:3, n:4, l:5, p:6 }[ letter ]
		if( number || number==0 )
			this.handEl.querySelector(".numbers").children[ number ].innerText = visibleAmount
		else
			message("That's a gg")
	}

	removeFromHand(letter){
		let visibleAmount = [
			0   ,"一","二","三","四","五","六","七","八","九",
			"十","十一","十二","十三","十四","十五","十六","十七","十八"
		][ --this.hand[ letter ] ]
		const number = { b:0, r:1, g:2, s:3, n:4, l:5, p:6 }[ letter ]

		if( this.hand[letter] < 1 )
			visibleAmount = ""
		this.handEl.querySelector(".numbers").children[ number ].innerText = visibleAmount
	}

	capture(piece){
		piece.el.style.setProperty( "--y", piece.relativeY(piece.pos.y*1+2) )
		piece.player = this
		piece.rotate()
		piece.el.classList.add("hidden")

		this.addToHand(piece.letter)

		setTimeout(()=>{
			piece.el.remove()
			this.game.pieces.splice( this.game.pieces.indexOf(piece), 1 )
		},500)
	}

	hold(piece){
		this.unhold()

		this.holding = piece
		piece.el.classList.add("holding")
	}
	unhold(){
		if(this.holding){
			this.handEl.childNodes.forEach( handPiece=>{
				handPiece.classList.remove("holding")
			})
			this.holding.el.classList.remove("holding")
			this.holding = null
		}
	}

	holdHand(number){
		this.unhold()

		this.handEl.children[number].classList.add("holding")

		const pieceClasses = [Bishop,Rook,Gold,Silver,Knight,Lance,Pawn]
		this.holding = new pieceClasses[ number ](this.game,this,{x:0,y:0})
		this.holding.createEl()
		this.holding.el.classList.add("hidden")
	}

	createHandEl(){
		const hand = document.createElement("div")
		hand.className = "hand"

		const pieceClasses = [Bishop,Rook,Gold,Silver,Knight,Lance,Pawn]
		for( let i=0; i<7; i++ ){
			const el = new pieceClasses[i](this.game,this,{x:i,y:0}).createEl()

			el.addEventListener("click", e=>{
				e.stopPropagation()
				const number = e.currentTarget.style.getPropertyValue("--x")
				this.game.socket.emit("action", {type:"hand",number} )
				this.game.handClick( this.game.player, number )
			})

			hand.appendChild(el)
		}

		const numbers = document.createElement("div")
		numbers.className = "numbers"
		for( let i=0; i<7; i++ ){
			const number = document.createElement("div")
			number.className = "number"
			numbers.appendChild(number)
		}
		hand.appendChild( numbers )

		this.handEl = hand
	}
}

class Piece{
	constructor( game, player, pos={x:0,y:0} ){
		this.game = game
		this.player = player
		this.pos = pos

		this.letter = "g"
		this.sym = "神"
		this.proSym = "error"

		this.isInHand = false
		this.isPromoted = false
	}
	createEl(){
		const el = document.createElement("div")
		el.classList.add("piece")
		el.style.setProperty("--x",this.pos.x)
		el.style.setProperty("--y",this.pos.y)
		
		const img = document.createElement("img")
		img.src = "piece.svg"
		img.alt = ""
		img.classList = "image"
		
		const sym = document.createElement("div")
		sym.innerText = this.sym
		sym.classList = "symbol"
		
		const proSym = document.createElement("div")
		proSym.innerText = this.proSym
		proSym.classList = "promoted-symbol"
		
		el.appendChild(img)
		el.appendChild(sym)
		
		this.el = el
		this.rotate()
		return el
	}
	rotate(){
		if( this.player.id == 1 )
			this.el.classList.add("second-player")
		else
			this.el.classList.remove("second-player")
	}
	move(x,y){
		if(this.canMove(x,y)){
			if( this.game.board[y][x].piece )
				this.player.capture( this.game.board[y][x].piece )

			this.game.board[ this.pos.y ][ this.pos.x ].piece = null
			this.game.board[y][x].piece = this

			this.el.style.setProperty("--x",x)
			this.el.style.setProperty("--y",y)
			this.pos = {x,y}

			return true
		}
		else return false
	}
	canMove(x,y){
		return true
	}
	canPromote(){
		const y = this.relativeY(this.pos.y)
		return y >= 6
	}
	promote(){
		if( this.isPromoted ){
			this.demote()
		}
		else if( this.canPromote() ){
			this.isPromoted = true
			this.el.classList.add("promoted")
			this.el.getElementsByClassName("symbol")[0].innerText = this.proSym
		}
	}
	demote(){
		if( this.canPromote() ){
			this.isPromoted = false
			this.el.classList.remove("promoted")
			this.el.getElementsByClassName("symbol")[0].innerText = this.sym
		}
	}
	relativeY(y){
		if( this.player.id == 1 )
			return y
		else
			return 8-y
	}
}
class King extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "k"
		this.sym = "玉"
		this.proSym = "error"
	}
	canMove(x,y){
		return Math.abs(this.pos.x-x)<=1 && Math.abs(this.pos.y-y)<=1
	}
}
class Bishop extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "b"
		this.sym = "角"
		this.proSym = "馬"
	}
	canMove(x,y){
		return ( Math.abs(this.pos.x-x) == Math.abs(this.pos.y-y) )
			|| (this.isPromoted? Math.abs(this.pos.x-x)<=1 && Math.abs(this.pos.y-y)<=1 : false)
	}
}
class Rook extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "r"
		this.sym = "飛"
		this.proSym = "龍"
	}
	canMove(x,y){
		return (this.pos.x==x && this.pos.y!=y)
			|| (this.pos.y==y && this.pos.x!=x)
			|| (this.isPromoted? Math.abs(this.pos.x-x)<=1 && Math.abs(this.pos.y-y)<=1 : false)
	}
}
class Gold extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "g"
		this.sym = "金"
		this.proSym = ":c"
	}
	canMove(x,y){
		y = this.relativeY(y)
		const posY = this.relativeY(this.pos.y)
		return (Math.abs(this.pos.x-x)<=1 && Math.abs(posY-y)<=1)
			&&!(Math.abs(this.pos.x-x)==1 && posY-y==1)
	}
}
class Silver extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "s"
		this.sym = "銀"
		this.proSym = "全"
	}
	canMove(x,y){
		y = this.relativeY(y)
		const posY = this.relativeY(this.pos.y)
		if( this.isPromoted )
			return (Math.abs(this.pos.x-x)<=1 && Math.abs(posY-y)<=1)
				&&!(Math.abs(this.pos.x-x)==1 && posY-y==1)
		else
			return (Math.abs(this.pos.x-x)<=1 && posY-y==-1)
				|| (Math.abs(this.pos.x-x)==1 && posY-y==1)
	}
}
class Knight extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "n"
		this.sym = "桂"
		this.proSym = "圭"
	}
	canMove(x,y){
		y = this.relativeY(y)
		const posY = this.relativeY(this.pos.y)
		if( this.isPromoted )
			return (Math.abs(this.pos.x-x)<=1 && Math.abs(posY-y)<=1)
				&&!(Math.abs(this.pos.x-x)==1 && posY-y==1)
		else
			return (Math.abs(this.pos.x-x)==1 && posY-y==-2)
	}
}
class Lance extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "l"
		this.sym = "香"
		this.proSym = "杏"
	}
	canMove(x,y){
		y = this.relativeY(y)
		const posY = this.relativeY(this.pos.y)
		if( this.isPromoted )
			return (Math.abs(this.pos.x-x)<=1 && Math.abs(posY-y)<=1)
				&&!(Math.abs(this.pos.x-x)==1 && posY-y==1)
		else
			return (this.pos.x==x && posY<y)
	}
}
class Pawn extends Piece{
	constructor( game, player, pos={x:0,y:0} ){
		super( game, player, pos )
		this.letter = "p"
		this.sym = "歩"
		this.proSym = "と"
	}
	canMove(x,y){
		y = this.relativeY(y)
		const posY = this.relativeY(this.pos.y)
		if( this.isPromoted )
			return (Math.abs(this.pos.x-x)<=1 && Math.abs(posY-y)<=1)
				&&!(Math.abs(this.pos.x-x)==1 && posY-y==1)
		else
			return (this.pos.x==x && posY-y==-1)
	}
}

class Game{
	constructor(el, socket){
		this.el = el
		this.socket = socket
		this.board = []
		this.pieces = []
		
		this.createPlayers()
		this.createBoard()
		this.createPieces()

		this.socket.on("action", ({type,x,y,number}) => {
			switch(type){
				case "click": this.cellClick(this.players[1], 8-x, 8-y); break;
				case "hand" : this.handClick(this.players[1], number); break;
				case "rewind":this.rewind(); break;
				default: break
			}
		})

		this.socket.on("player-number", number => {
			this.playerNumber = number
			console.log("You're playing as player"+number)
		})

		this.socket.on("history", history => {
			for( let {type,x,y,number,player} of history ){
				console.log(`This is a turn of player ${player}`)
				player = this.players[ player==this.playerNumber? 0 : 1 ]
				//player is converted from Int to Player
				console.log(`x is ${x}, y is ${y}`)
				if(x||x===0) x = player.id===0? x : 8-x
				if(y||y===0) y = player.id===0? y : 8-y
				console.log(`x is ${x}, y is ${y}`)
				console.log(`This is a turn of player ${player.id}`)
				console.log(`That's my turn. ${player.id===0}`)
				switch(type){
					case "click": this.cellClick(player, x, y); break;
					case "hand" : this.handClick(player, number); break;
					default: break
				}
			}
		})

		this.player = this.players[0]
	}

	createBoard(){
		this.el.classList.add("shogi")

		let board = document.createElement("table")
		board.classList = "board"
		this.boardEl = board

		for( let y=0; y<9; y++ ){
			let row = document.createElement("tr")
			row.classList = "row"
			board.appendChild(row)

			this.board[y] = []

			for( let x=0; x<9; x++ ){
				let cell = document.createElement("td")
				cell.classList = "cell"
				// cell.innerText = x+":"+y
				cell.addEventListener("click", e=>{
					this.socket.emit("action", {type:"click",x,y})
					this.cellClick(this.player,x,y)
				})
				row.appendChild(cell)

				this.board[y][x] = { cell:cell, piece:null }
			}
		}
		this.el.appendChild( this.players[1].handEl )
		this.el.appendChild(board)
		this.el.appendChild( this.players[0].handEl )
	}

	createPlayers(){
		this.players = [
			new Player(this,0), new Player(this,1)
		]
	}

	createPieces(){
		this.players[0].createPieces([
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			["p","p","p","p","p","p","p","p","p"],
			[" ","b"," "," "," "," "," ","r"," "],
			["l","n","s","g","k","g","s","n","l"],
		])
		this.players[1].createPieces([
			["l","n","s","g","k","g","s","n","l"],
			[" ","r"," "," "," "," "," ","b"," "],
			["p","p","p","p","p","p","p","p","p"],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "],
			[" "," "," "," "," "," "," "," "," "]
		])
	}

	cellClick(player,x,y){
		console.log(player.id)
		const piece = this.board[y][x].piece

		if( piece && piece == player.holding ){
			player.unhold()
			piece.promote()
			console.log("promoting/puting down")
		}
		else if( piece && piece.player == player ){
			player.hold(piece)	
			console.log("holding")
		}
		else if( !piece && player.holding && !this.pieces.includes(player.holding) ){
			this.pieces.push(player.holding)
			this.board[y][x].piece = player.holding
			this.boardEl.appendChild(player.holding.el)

			player.holding.pos = {x:x,y:y}
			player.holding.el.style.setProperty("--x",x)
			player.holding.el.style.setProperty("--y",y)

			player.holding.el.classList.remove("hidden")
			player.removeFromHand(player.holding.letter)
			player.unhold()
			this.nextTurn()
			console.log("releasing")
		}
		else if( player.holding && player.holding.move(x,y) ){
			player.unhold()
			this.nextTurn()
			console.log("moving")
		}
		else{
			player.unhold()
			console.log("idk")
		}
	}

	handClick(player,number){
		if( player.hand[["b","r","g","s","n","l","p"][number]] >= 1)
			player.holdHand(number)
	}

	nextTurn(){
		// if( this.currentPlayer.id == 0 ){
		// 	this.currentPlayer = this.players[1]
		// }
		// else{
		// 	this.currentPlayer = this.players[0]
		// }
	}
}

console.log("oh, hello :3")

function start(name){
	const socket = io()
	socket.emit("room-name", name)
	socket.on("message", message)
	g = new Game(document.querySelector("#shogi"), socket)
}

function message(text){
	const box = document.createElement("div")
	box.className = "message-box"
	document.querySelector("#messages").appendChild( box )

	const p = document.createElement("p")
	p.className = "text"
	p.innerText = text
	box.appendChild(p)

	const close = document.createElement("button")
	close.className = "close"
	close.innerText = "x"
	close.addEventListener( "click", e => {
		e.stopPropagation()
		box.remove()
	})
	box.appendChild(close)
}

function ask(text){
	return new Promise((resolve,reject)=>{
		const box = document.createElement("div")
		box.className = "message-box prompt-box"
		document.querySelector("#messages").appendChild( box )
	
		const p = document.createElement("p")
		p.className = "text"
		p.innerText = text
		box.appendChild(p)
	
		const input = document.createElement("input")
		box.appendChild(input)
	
		const submit = document.createElement("button")
		submit.className = "submit"
		submit.innerText = "ok"
		submit.addEventListener( "click", e => {
			e.stopPropagation()
			resolve(input.value)
			box.remove()
		})
		box.appendChild(submit)
	})
}

let g
( async ()=>{

	const roomName = await ask("what's the name of the room?")
	console.log(roomName)
	start(roomName)

})()

// console.log(g)