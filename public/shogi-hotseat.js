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
			alert("That's a win")
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
				this.game.handClick( e.currentTarget.style.getPropertyValue("--x") )
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
	constructor(el){
		this.el = el
		this.board = []
		this.pieces = []
		
		this.createPlayers()
		this.createBoard()
		this.createPieces()

		this.currentPlayer = this.players[0]
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
					this.cellClick(x,y)
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

	cellClick(x,y){
		const piece = this.board[y][x].piece

		if( piece && piece == this.currentPlayer.holding ){
			this.currentPlayer.unhold()
			piece.promote()
			console.log("promoting/puting down")
		}
		else if( piece && piece.player == this.currentPlayer ){
			this.currentPlayer.hold(piece)	
			console.log("holding")
		}
		else if( !piece && this.currentPlayer.holding && !this.pieces.includes(this.currentPlayer.holding) ){
			this.pieces.push(this.currentPlayer.holding)
			this.board[y][x].piece = this.currentPlayer.holding
			this.boardEl.appendChild(this.currentPlayer.holding.el)

			this.currentPlayer.holding.pos = {x:x,y:y}
			this.currentPlayer.holding.el.style.setProperty("--x",x)
			this.currentPlayer.holding.el.style.setProperty("--y",y)

			this.currentPlayer.holding.el.classList.remove("hidden")
			this.currentPlayer.removeFromHand(this.currentPlayer.holding.letter)
			this.currentPlayer.unhold()
			this.nextTurn()
			console.log("releasing")
		}
		else if( this.currentPlayer.holding && this.currentPlayer.holding.move(x,y) ){
			this.currentPlayer.unhold()
			this.nextTurn()
			console.log("moving")
		}
		else{
			this.currentPlayer.unhold()
			console.log("idk")
		}
	}

	handClick(number){
		// const pieceClass = [Bishop,Rook,Gold,Silver,Knight,Lance,Pawn][ number ]
		if( this.currentPlayer.hand[["b","r","g","s","n","l","p"][number]] >= 1)
			this.currentPlayer.holdHand(number)
	}

	nextTurn(){
		if( this.currentPlayer.id == 0 ){
			this.currentPlayer = this.players[1]
		}
		else{
			this.currentPlayer = this.players[0]
		}
	}
}

console.log("oh, hello :3")

const g = new Game(document.querySelector("#shogi"))
console.log(g)