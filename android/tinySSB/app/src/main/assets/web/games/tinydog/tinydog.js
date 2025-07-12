// Shows list with all active tinydog games
function tdg_load_list() {
    // Get html element
    let lst = document.getElementById("div:tinydog_list");
    lst.innerHTML = ''; // Delete content

    if (typeof tremola.tinydog === "undefined")
        tremola.tinydog = { 'active': {}, 'closed': {} };

    for (let id in tremola.tinydog.active) {
        let g = tremola.tinydog.active[id];
        let others = g.participants.filter(p => p !== myId).map(fid2display).join(" & ");

        let item = document.createElement('div'); // Outer Container div per row

        // Define onclick function depending on game state
        let onclickFn = '';
        if (g.state === "open") {
            onclickFn = `tdg_load_board("${id}");`; // Opens game on click
        } else if (g.state === "invited" && !g.accepted.includes(myId)) {
            onclickFn = `tdg_list_callback("${id}", "accept");`; // Accept invitation on click
        }
        // Add left button to a new row
        let row = `<button class='tdg_list_button' onclick='${onclickFn}'
                        style='overflow: hidden; width: 70%; background-color: #ebf4fa;'>`;

        row += "<div style='white-space: nowrap;'><div style='text-overflow: ellipsis; overflow: hidden;'>";

        // Set text in left button depending on state and whether accepted
        let statusText = "";
        if (g.state === "inviting") {
            statusText = "waiting for peers to accept...";
        } else if (g.state === "invited") {
            if (g.accepted.length === 1 && !g.accepted.includes(myId)) {
                statusText = "one peer accepted – waiting for you";
            } else {
                statusText = "you are invited (click to accept)";
            }
        } else if (g.state === "accepted") {
            statusText = "you accepted – waiting for others...";
        } else if (g.state === "open") {
            statusText = "game in progress";
        } else if (g.state === "closed") {
            statusText = g.close_reason || "game ended";
        }

        row += `TinyDog with ${others}<br><span style="font-size: smaller;">${statusText}</span>`;
        row += "</div></div></button>";

        // Set text in right button depending on state
        let btxt = '';
        if (g.state === 'invited') {
            btxt = 'decline';
        } else if (g.state === 'closed') {
            btxt = 'delete';
        } else {
            btxt = 'end';
        }

        // Add right button also with an onclick function
        row += `<button class='tdg_list_button'
                        style='width: 20%; text-align: center;'
                        onclick='tdg_list_callback("${id}", "${btxt}")'>${btxt}</button>`;

        item.innerHTML = row;
        lst.appendChild(item);
    }
}

function tdg_load_board(id) {
    let g = tremola.tinydog.active[id];
    if (g.state == 'inviting' || g.state == 'invited')
        return;

    let t = document.getElementById('tdg_title');
    let titleHTML = "";

    if (g.state == 'open') {
        // Decide order and who's turn it is
        let currentTurnIndex = g.cnt % 3;
        let currentPlayerId = g.order[currentTurnIndex];
        let currentPlayer = g.participants[currentPlayerId];

        // Turn display
        if (currentPlayer === myId) {
            titleHTML += `<font size="+2"><strong>My turn</strong></font>`;
        } else {
            titleHTML += `<font size="+2"><strong>${fid2display(currentPlayer)}'s turn</strong></font>`;
        }
        // Order display
        let orderDisplay = g.order.map(idx => {
            let pID = g.participants[idx];
            return (pID === myId) ? "You" : fid2display(pID);
        }).join(" → ");

        titleHTML += `<br><span style="font-size: smaller;">${orderDisplay}</span>`;

    } else if (g.state == 'closed') {
        let msg = "closed";
        t.innerHTML = `<font size=+2 color=red><strong>${msg}</strong></font>`;
    } else {
        t.innerHTML = `<font size=+2><strong>Waiting for players...</strong></font>`;
    }

    // Show or hide optional footer
//    let f = document.getElementById('tdg_footer');
//    f.style.display = (g.state == 'closed') ? 'none' : null;

    // Game table
    let tableContainer = document.getElementById('tdg_table');

    tableContainer.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <div class="container">
                <!-- Triangle borders -->
                <div class="triangle-side right-side-of-triangle">
                <div class="box" id="box24"></div>
                <div class="box" id="box23"></div>
                <div class="box" id="box22"></div>
                <div class="box" id="box21"></div>
                <div class="box" id="box20"></div>
                <div class="box" id="box19"></div>
                <div class="box" id="box18"></div>
                <div class="box" id="box17"></div>
                <div class="box" id="box16"></div>
                <div class="box" id="box15"></div>
                <div class="box" id="box14"></div>
                <div class="box" id="box13"></div>
                <div class="box" id="box12"></div>
                <div class="box" id="box11"></div>
                <div class="box" id="box10"></div>
                <div class="box" id="box9"></div>
                </div>
                <div class="triangle-side left-side-of-triangle">
                <div class="box" id="box25"></div>
                <div class="box" id="box26"></div>
                <div class="box" id="box27"></div>
                <div class="box" id="box28"></div>
                <div class="box" id="box29"></div>
                <div class="box" id="box30"></div>
                <div class="box" id="box31"></div>
                <div class="box" id="box32"></div>
                <div class="box" id="box33"></div>
                <div class="box" id="box34"></div>
                <div class="box" id="box35"></div>
                <div class="box" id="box36"></div>
                <div class="box" id="box37"></div>
                <div class="box" id="box38"></div>
                <div class="box" id="box39"></div>
                <div class="box" id="box40"></div>
                </div>
                <div class="triangle-side bottom-side-of-triangle">
                <div class="box" id="box8"></div>
                <div class="box" id="box7"></div>
                <div class="box" id="box6"></div>
                <div class="box" id="box5"></div>
                <div class="box" id="box4"></div>
                <div class="box" id="box3"></div>
                <div class="box" id="box2"></div>
                <div class="box" id="box1"></div>
                <div class="box" id="box0"></div>
                <div class="box" id="box47"></div>
                <div class="box" id="box46"></div>
                <div class="box" id="box45"></div>
                <div class="box" id="box44"></div>
                <div class="box" id="box43"></div>
                <div class="box" id="box42"></div>
                <div class="box" id="box41"></div>
                </div>

                <!-- Inner circle -->
                <div class="circle" id="circle"></div>

                <!-- home fields -->
                <div class="home-and-win-fields top-left-home-fields">
                <div class="box" id="p3h1"></div><div class="box" id="p3h2"></div>
                <div class="box" id="p3h3"></div><div class="box" id="p3h4"></div>
                </div>

                <div class="home-and-win-fields top-right-home-fields">
                <div class="box" id="p2h4"></div><div class="box" id="p2h3"></div>
                <div class="box" id="p2h2"></div><div class="box" id="p2h1"></div>
                </div>

                <div class="home-and-win-fields bottom-home-fields">
                <div class="box" id="p1h4"></div><div class="box" id="p1h3"></div>
                <div class="box" id="p1h2"></div><div class="box" id="p1h1"></div>
                </div>

                <!-- win fields -->
                <div class="home-and-win-fields top-left-win-fields">
                <div class="box" id="p3w1"></div><div class="box" id="p3w2"></div>
                <div class="box" id="p3w3"></div><div class="box" id="p3w4"></div>
                </div>

                <div class="home-and-win-fields top-right-win-fields">
                <div class="box" id="p2w1"></div><div class="box" id="p2w2"></div>
                <div class="box" id="p2w3"></div><div class="box" id="p2w4"></div>
                </div>

                <div class="home-and-win-fields bottom-win-fields">
                <div class="box" id="p1w4"></div><div class="box" id="p1w3"></div>
                <div class="box" id="p1w2"></div><div class="box" id="p1w1"></div>
                </div>

                <!-- hand cards fields -->
                <div class="hand-cards top-left-cards">
                <div class="card" id="p3c1"></div><div class="card" id="p3c2"></div><div class="card" id="p3c3"></div>
                <div class="card" id="p3c4"></div><div class="card" id="p3c5"></div><div class="card" id="p3c6"></div>
                </div>

                <div class="hand-cards top-right-cards">
                <div class="card" id="p2c6"></div><div class="card" id="p2c5"></div><div class="card" id="p2c4"></div>
                <div class="card" id="p2c3"></div><div class="card" id="p2c2"></div><div class="card" id="p2c1"></div>
                </div>

                <div class="hand-cards bottom-cards">
                <div class="card" id="p1c6"></div><div class="card" id="p1c5"></div><div class="card" id="p1c4"></div>
                <div class="card" id="p1c3"></div><div class="card" id="p1c2"></div><div class="card" id="p1c1"></div>
                </div>

                <!-- messages to player -->
                <div class="triangle-side message-position">
                <div class="message" id="m"></div>
                </div>

                <!-- want to go back -->
                <div class="triangle-side want-to-enter-goal-field">
                <div class="user-decision" id="wtegf"></div>
                </div>

                <!-- want to enter goal fields -->
                <div class="triangle-side want-to-go-back">
                <div class="user-decision" id="wtgb"></div>
                </div>

            </div>
        </div>
    `;

    t.innerHTML = titleHTML;

    tremola.tinydog.current = id;
    currentPlayingPlayer = who_am_I(id);
    if (tremola.tinydog.active[tremola.tinydog.current].game[0] == null) {
        tremola.tinydog.active[tremola.tinydog.current].game = new Game(currentPlayingPlayer);
        initialize_board();
    } else {
        updateBoard();
    }
    setScenario('tinydog-board')
}

// Scenario for choosing two peers (after clicking on plus button)
function tdg_new_game() {
    closeOverlay(); // Close any open overlay windows (e.g., modals or popups)
    document.getElementById("div:confirm-members").style.display = 'none'; // Hide confirm button at the start

    fill_members_dual(); // Dynamically build and render the peer selection UI
    prev_scenario = 'tinydog-list';
    setScenario("members");

    document.getElementById("tremolaTitle").style.display = 'none';  // Hide app title

    // Show and customize the conversation title area for this scenario
    let c = document.getElementById("conversationTitle");
    c.style.display = null;
    c.innerHTML = "<font size=+1><strong>Launch TinyDog</strong></font><br>Select 2 peers to invite";
    document.getElementById('plus').style.display = 'none'; // Hide the plus button during peer selection
}

// Called by OK-Button after choosing peers
function tdg_new_game_confirmed() {
    let selected = [];
    for (let m in tremola.contacts) {
        if (m !== myId && document.getElementById(m).checked)
            selected.push(m);
    }
    let prevHash = getPrevHash(myId)
    backend("tinydog N " + selected[0] + " " + selected[1] + " " + prevHash)

    if (curr_scenario === 'members')
        setScenario('tinydog-list');
}

let currentPlayingPlayer = -1;

// Called when tinydog-specific messages are received
function tdg_on_rx(ref, from, args) {
    if (typeof tremola.tinydog == "undefined")
        tremola.tinydog = { 'active': {}, 'closed': {} };
    let ta = tremola.tinydog.active;

    // Case N: New game (invitation)
    if (args[0] == 'N') {
        let participants = [from, args[1], args[2]]
        let peers = [args[1], args[2]];

        if (!peers.includes(myId) && from != myId)
            return; // ignore if not a participant

        let otherPlayers = participants.filter(p => p !== myId);
        let fromHash = args[3]

        ta[ref] = {
            'peers': otherPlayers,                    // the other two players
            'participants': participants,             // all 3 player IDs
            'hashes': [fromHash, null, null],         // 3 prevHashes, same order as in participants
            'order': [null, null, null],              // order of players. Will be determined after all accepted
            'state': (myId === from) ? 'inviting' : 'invited',
            'accepted': [],                           // two peers are added here as soon as they accepted
            'cnt': 0,
            'close_reason': '',
            'game': [null, [-1]],
        };

        persist();
        console.log("tdx_on_rx args " + JSON.stringify(args) + ` from=${from} ref=${ref}`);
        if (curr_scenario === 'tinydog-list')
            setTimeout(() => {
                tdg_load_list();
            }, 0);
        return;
    }
    let g = ta[args[1]];
    if (args[0] === 'A') {
        if (!g.accepted.includes(from)) {
            g.accepted.push(from);
            let idx = g.participants.indexOf(from);
            if (idx >= 0 && args[2]) {
                g.hashes[idx] = args[2]; // args[2] contains prevHash
            }
        }

        if (g.accepted.length === 2) {
            g.state = 'open';
            let idx = hexHashModulo(g.hashes[0], g.hashes[1], g.hashes[2]);
            let orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
            g.order = orders[idx];
        } else if (from === myId) {
            g.state = 'accepted';
        }

        persist();

    } else if (args[0] === 'X') { // decline
             g.state = 'closed';
             g.close_reason = 'declined by peer';
             persist();

    } else if (args[0] === 'E') { // end
         g.state = 'closed';
         g.close_reason = 'ended by peer';
         persist();
    } else if (args[0] == REJECT_CARD) {
        tremola.tinydog.active[tremola.tinydog.current].game.tdg_on_rx(args);
    } else if (args[0] == PLAYERS_TURN) {
        tremola.tinydog.active[tremola.tinydog.current].game.tdg_on_rx(args);
    } else if (args[0] == DRAW_FROM_CHEAT_CARDS) {
        tremola.tinydog.active[tremola.tinydog.current].game.tdg_on_rx(args);
    } else if (args[0] == DRAW_FROM_NORMAL_CARDS) {
        tremola.tinydog.active[tremola.tinydog.current].game.tdg_on_rx(args);
    }
    if (curr_scenario === 'tinydog-list')
        tdg_load_list();
    return;
}

function who_am_I(id) {
    let ta = tremola.tinydog.active;
    if (ta[id].participants[0] == myId) {
        return ta[id].order[0]+1
    }
    if (ta[id].participants[1] == myId) {
        return ta[id].order[1]+1
    }
    if (ta[id].participants[2] == myId) {
        return ta[id].order[2]+1
    }
}

// Onclick function for left and right button in tinydog_list
function tdg_list_callback(id, action) {
    let g = tremola.tinydog.active[id]
    if (action == 'accept') {
        let prevHash = getPrevHash(myId)
        backend('tinydog A ' + id + ' ' + prevHash) // accept game and send own prevHash
    } else if (action == 'decline') {
             backend('tinydog X ' + id); // decline
         } else if (action == 'end') {
             backend('tinydog E ' + id); // end
         } else if (action == 'delete') {
             delete tremola.tinydog.active[id];
             tremola.tinydog.closed[id] = g.participants; // move game to closed games
             persist();
         }

    tdg_load_list();
}

// Get hash of previous log entry from specific replica (pID)
function getPrevHash(pID) {
    let hexHash = Android.getPrevHashFromB64(pID);
    if (!hexHash) {
        hexHash = "0000000000000000000000000000000000000000";
    }
    return hexHash;
}

// Calculate an integer between 0 and 5 by hashing the three hash values of 3 participants
function hexHashModulo(hex1, hex2, hex3) {
    const isValidHex = hex => /^[0-9a-fA-F]{40}$/.test(hex);
    if (![hex1, hex2, hex3].every(isValidHex)) {
        throw new Error("Every Entry must be a valid hex number with 40 digits.");
    }

    // Combine all hashes to one string
    const combined = hex1 + hex2 + hex3;

    // FNV-1a 32-bit Hash
    let hash = 0x811c9dc5; // Offset basis
    for (let i = 0; i < combined.length; i++) {
        hash ^= combined.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0; // 32-bit unsigned
    }

    return hash % 6;
}
//GAME

//class that represents a simple card.
class Card{

    colour; //the colour club, spade, heart, diamond

    value; //the cards value from 1 to 13 (jack, Queen, King)

    constructor(colour, value){
        this.colour = colour;
        this.value = value
    }

    getValue(){
        return this.value;
    }
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}

//class that represents a playing figure
//note the the figure is currently identified by the position of it in the array might need a identifier field later
class Figure {
    owner; //stores the owner of the figure which is a object of the player class
    position; //stores the position of the figure -1 = homefields 0-47 any position on the board 48-51 = goalfields.
    id;

    constructor(owner, id){
        this.owner = owner;
        this.position = -1;
        this.id = id;
    }

    getOwner() {
        return this.owner;
    }

    getPosition(){
        return this.position;
    }

    getID() {
        return this.id;
    }

    setPosition(pos){
        this.position = pos;
    }
    //simple method to update the figures position migh actually not be needed as setPosition does the same.
    move(newPosition){
        this.position = newPosition;
    }
    //simple method that returns a figure to the homefields
    //not yet called because the function of sending people home is missing.
    remove(){
        this.position = -1;
    }
    //calculates if the palyer could enter the goaldields with the Value on hand. 
    //it is called with the picked card in game.js and used to determine if the player can move the picked figure to the goalfields with the selected card.
    nearGoal(ValueOnHand){
        switch(this.owner.getPlayerNumber()){
            case 1:
              return (this.position > 48 - ValueOnHand) && (this.position <= 47) && (this.position + ValueOnHand < 53);
            case 2:
              return (this.position > 16 - ValueOnHand) && (this.position < 16) && (this.position + ValueOnHand < 21);
            default:
              return (this.position > 32 - ValueOnHand) && (this.position < 32) && (this.position + ValueOnHand < 37);
          }
    }
    //should return true if the figure is in heaven. doesnt work as intenden because of js -_-
    inHeaven(){
        let owner = this.getOwner();
        return owner.getGoalFields().includes(this);
    }
    //returns true if the player is on the starting point. also not called yet and is only needed if you would implement the invicibility on the starting field.
    onEntry(){
        this.position = this.owner.getStartingPoint();
    }
}

//class that represents the entire deck of cards
class Deck {
    playingDeck = [];

    static colors = ["Heart", "Diamonds", "Club", "Spade"];

    static numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    constructor(){//place any combination of colour and number on the deck.
        let playingCards = [];
        for (let color of Deck.colors){
            for (let number of Deck.numbers){
                let card = new Card(color, number);
                playingCards.push(card);
            }
        }
        this.playingDeck = playingCards;
    }
    /**
     * Method that draws cards from the deck
     * @param {integer} amount integer describing the amount of cards to be drawn
     * @returns an array of drawn cards
     */
    draw(numbers){
        if (this.playingDeck.length < numbers.length){
            return null;
        }
        let hand = [];
        for(let i = 0; i < numbers.length; i++){
            hand.push(this.playingDeck.splice(numbers[i], 1)[0]);
        }
        return hand;
    }
    get_n_ranodm_ints_with_exclusion(n, min, max, exclude) {
        let returnValues = [];
        while(returnValues.length != n) {
            let i = this.getRandomInt(min, max);
            if (containsObject(i, exclude) || containsObject(i, returnValues)) {
                continue
            } else {
                returnValues.push(i);
                max = max - 1;
            }
        }
        return returnValues;
    }
    //helper method that gives a random number between min and max
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

class Player {
    playernumber = -1;
    goalfields;
    homefields;
    startingPosition = -1;
    hand;
    pawns;

    constructor(playernumber){
        this.startingPosition = (playernumber - 1) * 16;
        this.playernumber = playernumber;
        this.goalfields = new Array(4).fill(0);
        this.hand = [];

        this.pawns = [];
        this.homefields = [];

        for(let i = 0; i < 4; i++){
            this.pawns.push(new Figure(this, i));
            this.homefields.push(this.pawns[i]);
        }
    }
    //method used for cheating
    getPawns(){
        return this.pawns;
    }

    getHand(){
        return this.hand;
    }
    //not called yet as it would only be needed to throw away all cards at once.
    clearHand(){
        this.hand = new Array(6).fill(null);
    }

    getPlayerNumber(){
        return this.playernumber;
    }

    getStartingPosition(){
        return this.startingPosition;
    }

    getGoalFields(){
        return this.goalfields
    }
    getHomeFields(){
        return this.homefields
    }
    //check if the goalfield is empty or not.
    checkGoalfieldempty(pos){
        return this.goalfields[pos] == 0; //0 means field is empty
    }

    setToGoal(heavenPos, figure){
        this.goalfields[heavenPos] = figure;
    }
    //method used to remove a pawn from the goalfield if it is moved
    removeFromGoal(heavenPos){
        this.goalfields[heavenPos] = 0;
    }
    setToHomefield(figure) {
        let i = figure.getID();
        this.homefields[i] = figure;
    }
    //takes pawn from homefield
    removefromHomefield(figure){
        let i = figure.getID();
        this.homefields[i] = 0;
    }
    //checks if each place in the goalfields holds a number. the number represents that a pawn is there 0 means no pawn is there.
    wonTheGame(){
        for(let i = 0; i < this.goalfields.length; i++){
            if (this.goalfields[i] == 0){
                return false;
            }
        }
        return true;
    }

    getCard(numberpick){
        let pickedCardValue = this.hand[numberpick].getValue();
        return [pickedCardValue, numberpick];
    }
    //removes the played card from the hand.
    removeCard(index, cards){
        cards.playingDeck.push(this.hand.splice(index, 1)[0]);
    }
}

class Gameboard {
    static instance = null;
    fields;

    constructor() {
        this.fields = new Array(48).fill(null);
    }

    static getInstance() {
        if (Gameboard.instance == null) {
            Gameboard.instance = new Gameboard();
        }
        return Gameboard.instance;
    }
    /**
     * Method that checks for each kind of move if its valid or not
     * @param {Figure} figure the icked figure
     * @param {integer} steps the amount of steps/value of the card
     * @param {boolean} wantsToEnd variable to determine if the player wants to enter the goalfields or not.
     * @returns 
     */
    checkValidMove(figure, steps, wantsToEnd){
        let player = figure.getOwner();
        let startingPosition = figure.getPosition();//position of the figure before the move
        if (startingPosition == -1 && (steps == 1 || steps == 2 || steps == 13)){//valid if the pawn is in the goalfields and the card allows you to go out.
            return true;
        }
        if (startingPosition <= 47 && startingPosition >= 0 && !wantsToEnd){//any move on the board is always valid if the player doesnt want to enter the goalfield
            return true;
        }
        if (startingPosition <= 47 && startingPosition >= 0 && wantsToEnd){//check if the player can enter the goalfieldsand if the the goalfield is actually empty
            if(figure.nearGoal(steps)){
                let startfield = player.getStartingPosition()
                if(player.getPlayerNumber() == 1){//special case for the first player so the calculation works
                    startfield = 48;
                }
                let heavenPos = startingPosition + steps - startfield;
                if (player.checkGoalfieldempty(heavenPos - 1)){
                    return true;
                }
            }//might need to add a check that the player doesnt walk to far over the goalfields. example player is 2 fields before entering the goalfields. and player a 13. that is checked in another case but should be done here too.
        }
        if (startingPosition > 47){//case if the figure is in the goalfields and wants to move
            if(steps == -4){//special case so you cant walk out fo the goalfields with a -4
                return false;
            }
            let newHeavenPos = startingPosition + steps - 48;
            if (!player.checkGoalfieldempty(newHeavenPos)){
                return false;
            }
            if(startingPosition + steps <= 51){
                return true
            }
        }
        return false;//default case if nothing of the above holds then the move is simply not valid.
    }


    /**
     * used to update the position of the figure on the board. as well as moving it on the board.
     * it handles the same cases as in the check valid move function
     * might not need to return a value.
     * TODO needs to handle the case if a player lands on a field another player is already on.
     * @param {Figure} figure 
     * @param {integer} steps 
     * @param {boolean} wantsToEnd 
     * @returns 
     */
    moveFigure(figure, steps, wantsToEnd){
        let player = figure.getOwner();
        // todo: throw exception here
        if(!this.checkValidMove(figure, steps, wantsToEnd)){//probably not needed as the checkValidMove function is always called before this function.
            console.log("Developer error: this.checkValidMove should be true but isn't.")
        }
        else {
            let startingPosition = figure.getPosition();
            if (startingPosition == -1){
                figure.setPosition(player.getStartingPosition());//update the figure posiition
                this.setPositionOnBoard(player.getStartingPosition(), figure);//set the position on the board
                // should not remove just any of the home field but the actually used marble
                player.removefromHomefield(figure); //just takes the first pawn in the homefields and removes it from there.
                return player.getStartingPosition();
            }
            if (startingPosition <= 47 && startingPosition >= 0 && !wantsToEnd){
                if(steps == -4 && startingPosition < 4){
                    figure.setPosition((48 + startingPosition + steps) % 48);
                    this.setPositionOnBoard((48 + startingPosition + steps) % 48, figure);                    
                }
                else{
                    figure.setPosition((startingPosition + steps) % 48);
                    this.setPositionOnBoard((startingPosition + steps) % 48, figure);    
                }
                this.removeFigure(startingPosition);
                return (startingPosition + steps) % 48;
            }
            if (startingPosition <= 47 && wantsToEnd){
                if(figure.nearGoal(steps)){
                    let startfield = player.getStartingPosition()
                    if(player.getPlayerNumber() == 1){
                        startfield = 48;
                    }
                    let heavenPos = startingPosition + steps - startfield;
                    player.setToGoal(heavenPos-1, figure);
                    figure.setPosition(48+heavenPos-1);
                    this.removeFigure(startingPosition);
                    return heavenPos + 48;
                }
            }
            if (startingPosition > 47){
                if(startingPosition + steps <= 51){
                    let heavenPos = startingPosition + steps - 48;
                    player.setToGoal(heavenPos, figure);
                    player.removeFromGoal(startingPosition-48);
                    figure.setPosition(figure.getPosition()+steps);
                    return heavenPos + 48;
                }
            }
        }   
    }
    /**
     * takes the player and the owner and prints the player number into the array(board)
     * @param {integer} pos 
     * @param {Figure} figure 
     */
    setPositionOnBoard(pos, figure){
        if(this.fields[pos] != null){
            let oppFigure = this.fields[pos]; //get the figure that's on the field
            oppFigure.setPosition(-1); //send that figure home
            let owner = oppFigure.getOwner();
            owner.setToHomefield(oppFigure);
        }
        this.fields[pos] = figure;
    }

    //helper method that sets a field to be empty again
    removeFigure(pos){
        this.fields[pos] = null;
    }

    getBoard(){
        return this.fields;
    }

    getprintableBoard(){
        let printableBoard = [];
        for(let i = 0; i < this.fields.length; i++){
            if(this.fields[i] == null){
                printableBoard[i] = 0;
            }
            else{
                let figure = this.fields[i];
                let id = figure.getID();
                let owner = figure.getOwner();
                let playernumber = owner.getPlayerNumber();
                printableBoard[i] = "p" + playernumber + "f" + (id+1);
            }
        }
        return printableBoard;
    }
}

let CHEATING = false;
let TINYDOG_COMMAND = "tinydog";
let REJECT_CARD = "R";
let PLAYERS_TURN = "P";
let DRAW_FROM_CHEAT_CARDS = "C";
let DRAW_FROM_NORMAL_CARDS = "D";
class Game{
    playerblue;
    playergreen;
    playerred;
    players;

    playground;
    cards;

    chosenCard;
    chosenPawn;

    playersTurn;
    finished;

    message = " ";

    MY_NUMBER;

    constructor(MY_NUMBER){
        this.playerblue = new Player(1);
        this.playergreen = new Player(2);
        this.playerred = new Player(3);
        this.players = [this.playerblue, this.playergreen, this.playerred]; //made for iterating over it to implement the turns.
        this.cards = new Deck();

        this.playground = new Gameboard();

        if (CHEATING) {
            for (let i=0;i<this.players.length;i++) {
                this.cheatPositions(this.players[i]);
            }
        }

        this.chosenCard = -1;
        this.choosenPawn = -1;

        this.playersTurn = 1;
        this.finished = false;

        this.MY_NUMBER = MY_NUMBER;
    }

    getMessage() {
        let returnMessage = (" " + this.message).slice(1);
        this.message = " ";
        return returnMessage;
    }

    /**
     * Method that handles the different cases of possible moves checking for each if it is valid and if so executes that move. 
     * If the move is not valid the player is asked again if he wants to play
     * @param {Player} player 
     */
    playersturn(player, choosenPawn, chosenCard, wantsToEnterGoalField, wantsToGoBack){
        let worked = false;
        let returnMessage = " ";

        let hand = player.getHand();
        let numberpick = chosenCard-1;
        let pickedCardValue = hand[chosenCard-1].getValue();
        if((pickedCardValue == 1 || pickedCardValue == 2 || pickedCardValue == 13) && choosenPawn.getPosition() == -1){//handle the case that the player wants to play a card that you could use to get out.
            if(this.playground.checkValidMove(choosenPawn, pickedCardValue, false)){
                this.playground.moveFigure(choosenPawn, pickedCardValue, false);
                player.removeCard(numberpick, this.cards);
                worked = true;
                returnMessage = "well done";
            } else {
                worked = false;
                returnMessage = "Cannot enter marble into game.";
            }
        } else if(pickedCardValue == 4 && wantsToGoBack){//handle the case that the player wants to play the 4 and go back
            if(this.playground.checkValidMove(choosenPawn, -4, false)){
                this.playground.moveFigure(choosenPawn, -4, false);
                player.removeCard(numberpick, this.cards);
                worked = true;
                returnMessage = "well done";
            } else{
                worked = false;
                returnMessage = "Cannot go back.";
            }
        } else if(choosenPawn.nearGoal(pickedCardValue) && wantsToEnterGoalField){//handle the case that the player wants to enter the goalfields
            if(this.playground.checkValidMove(choosenPawn, pickedCardValue, true)){
                this.playground.moveFigure(choosenPawn, pickedCardValue, true);
                player.removeCard(numberpick, this.cards);
                worked = true;
                returnMessage = "well done";
            } else {
                worked = false;
                returnMessage = "Cannot enter marble into goal fields.";
            }
        }else if(choosenPawn.inHeaven()){//not quite sure if it needs to a separate case but it handles the case that the player wants to move a pawn that is in the goalfields
             if (this.playground.checkValidMove(choosenPawn, pickedCardValue, false)){
                this.playground.moveFigure(choosenPawn, pickedCardValue, false);
                player.removeCard(numberpick, this.cards);
                worked = true;
                returnMessage = "well done";
            }else{
                worked = false;
                returnMessage = "Cannot make this move within goal fields.";
            }
                
        }else{//handle any other movement of a pawn
            if (this.playground.checkValidMove(choosenPawn, pickedCardValue, false)){
                this.playground.moveFigure(choosenPawn, pickedCardValue, false);
                player.removeCard(numberpick, this.cards);
                worked = true;
                returnMessage = "well done";
            }else{
                worked = false;
                returnMessage = "Cannot make this move.";
            }                
        }
        return [worked, returnMessage];
    }

    checkPlayerAndFinished(playerNo) {
        return this.playersTurn == playerNo && this.finished == false;
    }

    incrementPlayersTurn() {
        this.playersTurn = (this.playersTurn + 1) % 4;
        if (this.playersTurn == 0) {
            this.playersTurn = this.playersTurn + 1;
        }
    }

    nextPlayer(player) {
        this.chosenCard = -1;
        this.choosenPawn = -1;
        this.incrementPlayersTurn();
        if(player.wonTheGame()){//check after each move if someone won the game and if so finish it.
            this.message = `Player ${player.getPlayerNumber()} won the game.`;
            this.finished = true;
            return;
        }
    }

    choosesCard(playerNo, cardNo) {
        if (this.checkPlayerAndFinished(playerNo)) {
            if(cardNo > this.players[playerNo-1].getHand().length) {
                if (this.players[playerNo-1].getHand().length == 0) {
                    if (!CHEATING) {
                        let chosenNumbers = this.cards.get_n_ranodm_ints_with_exclusion(18, 0, 51, []);
                        this.distribute(chosenNumbers);
                        let chosenNumbersString = "";
                        for (let i = 0; i < chosenNumbers.length; i++) {
                            chosenNumbersString = chosenNumbersString + " " + chosenNumbers[i];
                        }
                        let needsToReplicate = this.get_needs_to_replicate();
                        this.backend(TINYDOG_COMMAND + " " + DRAW_FROM_NORMAL_CARDS + " " + needsToReplicate + chosenNumbersString);
                    } else {
                        for (let i = 0; i < this.players.length; i++) {
                            this.cheatCards(this.players[i]);
                        }
                        let needsToReplicate = this.get_needs_to_replicate();
                        this.backend(TINYDOG_COMMAND + " " + DRAW_FROM_CHEAT_CARDS + " " + needsToReplicate);
                    }
                } else {
                    this.message = "Cannot choose this card. Choose again.";
                }
            }
            else {
                this.chosenCard = cardNo;
            }
        } else {
            this.itIsNotYourTurn(playerNo);
        }
    }

    get_needs_to_replicate() {
        let needsToReplicate = "";
        for (let i = 1; i < 4; i++) {
            if (i!=this.MY_NUMBER) {
                needsToReplicate = needsToReplicate + i;
            }
        }
        return needsToReplicate;
    }

    // field type is -1 for home, 0 for regular, 1 for goal
    choosesMarble(playerNo, fieldType, fieldNumber, wantsToEnterGoalField, wantsToGoBack) {
        if (this.checkPlayerAndFinished(playerNo)) {
            if (this.chosenCard != -1) {
                let figure = null;
                let player = this.players[playerNo-1];
                if (fieldType == -1) {
                    let homeFields = player.getHomeFields();
                    if (homeFields[fieldNumber-1] == 0) {
                        this.message = "Choose a marble.";
                        return
                    } else {
                        figure = homeFields[fieldNumber-1];
                    }
                } else if (fieldType == 0) {
                    let board = this.playground.getBoard();
                    if (board[fieldNumber-1] == null) {
                        this.message = "Choose a marble.";
                        return
                    } else if (board[fieldNumber-1].getOwner().getPlayerNumber() != playerNo) {
                        this.message = `Choose a marble belonging to you. The owner is ${board[fieldNumber-1].getOwner().getPlayerNumber()}`;
                        return
                    } else {
                        figure = board[fieldNumber-1];
                    }
                } else if (fieldType == 1) {
                    let goalFields = player.getGoalFields();
                    if (goalFields[fieldNumber-1] == 0) {
                        this.message = "Choose a marble.";
                        return
                    } else {
                        figure = goalFields[fieldNumber-1];
                    }
                } else {
                    console.log("Developer error: This is an invalid field.");
                }
                let needs_to_replicate = this.get_needs_to_replicate();
                let enterBit = wantsToEnterGoalField? 1: 0;
                let goBackBit = wantsToGoBack? 1: 0;
                let [worked, returnMessage] = this.playersturn(player, figure, this.chosenCard, wantsToEnterGoalField, wantsToGoBack);
                if (worked) {
                    this.backend(TINYDOG_COMMAND + " " + PLAYERS_TURN + " " + needs_to_replicate + " " + playerNo + " " + figure.getID() + " " + this.chosenCard + " " + enterBit + " " + goBackBit);
                    this.nextPlayer(player);
                } else {
                    this.message = returnMessage;
                }
            } else {
                this.message = "Before choosing a marble, choose a card.";
            }
        } else {
            this.itIsNotYourTurn(playerNo);
        }
    }

    itIsNotYourTurn(playerNo) {
        if (this.finished) {
            this.message = 'The game has finished.';
        } else {
            this.message = `It is not your turn. You are ${playerNo} but it is ${this.playersTurn}'s turn.`;
        }
    }

    wantsToRejectCard(playerNo) {
        if (this.checkPlayerAndFinished(playerNo)) {
            if (this.chosenCard != -1) {
                let needs_to_replicate = this.get_needs_to_replicate();
                this.backend(TINYDOG_COMMAND + " " + REJECT_CARD + " " + needs_to_replicate + " " + playerNo + " " + this.chosenCard);
                // call this.rejectCard() after calling backend since this.rejectCard makes changes to this.chosenCard
                this.rejectCard(playerNo, this.chosenCard);
            } else {
                this.message = "Before throwing away a card, chose it.";
            }
        } else {
            this.itIsNotYourTurn(playerNo, chosenCard);
        }
    }

    rejectCard(playerNo, chosenCard) {
        let player = this.players[playerNo-1];
        player.removeCard(chosenCard-1, this.cards);
        this.nextPlayer(player);
    }

    getBoard() {
        return this.playground.getprintableBoard();
    }

    getHomefields() {
        let homeFields = [];
        for (let i=0;i<this.players.length;i++) {
            let playerhomefield = this.players[i].getHomeFields();
            let playerHomefieldReadable = [];
            for (let j=0;j<playerhomefield.length;j++) {
                if (playerhomefield[j]!=0) {
                    let figureID = playerhomefield[j].getID();
                    let readableID = "p" + (i+1) + "f" + (figureID+1);
                    playerHomefieldReadable.push(readableID);
                } else {
                    playerHomefieldReadable.push(0);
                }
            }
            homeFields.push(playerHomefieldReadable);
        }
        return homeFields;
    }

    getWinfields() {
        let winFields = [];
        for (let i=0;i<this.players.length;i++) {
            let playerwinfield = this.players[i].getGoalFields();
            let playerwinfieldReadable = [];
            for (let j=0;j<playerwinfield.length;j++) {
                if (playerwinfield[j]!=0) {
                    let figureID = playerwinfield[j].getID();
                    let readableID = "p" + (i+1) + "f" + (figureID+1);
                    playerwinfieldReadable.push(readableID);
                } else {
                    playerwinfieldReadable.push(0);
                }
            }
            winFields.push(playerwinfieldReadable);
        }
        return winFields;
    }

    getPlayerCards() {
        let cards = [];
        for (let i=0;i<this.players.length;i++) {
            let playerCards = this.players[i].getHand();
            let playerCardsReadable = [];
            for (let j=0;j<6;j++) {
                if (j<playerCards.length) {
                    let cardValue = playerCards[j].getValue();
                    playerCardsReadable.push(cardValue);
                } else {
                    playerCardsReadable.push(0);
                }
            }
            cards.push(playerCardsReadable);
        }
        return cards;
    }

    distribute(chosenNumbers) {
        let drawnCards = this.cards.draw(chosenNumbers);
        if (drawnCards == null) {
            console.log("Developer error: There have not been enough cards in the deck.");
        }
        for(let i = 0; i < 3; i++){
            let player = this.players[i];
            player.hand = drawnCards.slice(i * 6, i * 6 + 6);
        }
    }

    cheatPositions(player){
        let pawns = player.getPawns();
        let board = this.playground.getBoard();
        let pos = [];
        if(player.getPlayerNumber() == 1)
            pos.push(-1, 47, 0, 48);
        if(player.getPlayerNumber() == 2)
            pos.push(-1, 16, 15, 48);
        if(player.getPlayerNumber() == 3)
            pos.push(-1, 32, 31, 48);
        pawns[0].setPosition(pos[0]);
        pawns[1].setPosition(pos[1]);
        pawns[2].setPosition(pos[2]);
        pawns[3].setPosition(pos[3]);
        let i = -1;
        for(let p of pos){
            i = i+1;
            if(p != -1 && p > -1 && p < 52){
                player.removefromHomefield(pawns[i]);
                if (p > -1 && p < 48) {
                    board[pos[i]] = pawns[i];
                } else {
                    player.setToGoal(p-48, pawns[i]);
                }
            } else if (p == -1) {
                continue
            } else {
                console.log(`Developer error: The position ${p} is not a valid cheating position.`);
           }
        }
    }
    /**
     * cheat to set the hand cards for each player
     * @param {Player} player 
     */
    cheatCards(player){
        let cheatDeck = [];
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        for(let number of numbers){
            let card = new Card("Heart", number);
            cheatDeck.push(card);
        }
        let hand = player.getHand();
        switch(player.getPlayerNumber()){
            case 1:
                hand[0] = cheatDeck[8];// set the position of the cards on hand to any position of the cheat deck cheatDeck[1] = heart 2 etc.
                hand[1] = cheatDeck[3];
                hand[2] = cheatDeck[1];
                hand[3] = cheatDeck[0];
                hand[4] = cheatDeck[7];
                hand[5] = cheatDeck[12];
                break;
            case 2:
                hand[0] = cheatDeck[8];
                hand[1] = cheatDeck[3];
                hand[2] = cheatDeck[1];
                hand[3] = cheatDeck[0];
                hand[4] = cheatDeck[7];
                hand[5] = cheatDeck[12];
                break;
            default:
                hand[0] = cheatDeck[8];
                hand[1] = cheatDeck[3];
                hand[2] = cheatDeck[1];
                hand[3] = cheatDeck[0];
                hand[4] = cheatDeck[7];
                hand[5] = cheatDeck[12];
                break;
        }
    }

    tdg_on_rx(arr) {
        switch(arr[0]) {
            case REJECT_CARD:
                if (this.checkIfINeedToReplicate(arr[1])) {
                    this.rejectCard(arr[2], arr[3]);
                }
                break
            case PLAYERS_TURN:
                if (this.checkIfINeedToReplicate(arr[1])) {
                    let player = this.players[parseInt(arr[2])-1];
                    let figure = player.getPawns()[parseInt(arr[3])];
                    let chosenCard = parseInt(arr[4]);
                    let wantsToEnterGoalField = parseInt(arr[5]) == 1? true: false;
                    let wantsToGoBack = parseInt(arr[6]) == 1? true: false;
                    this.playersturn(player, figure, chosenCard, wantsToEnterGoalField, wantsToGoBack);
                    this.nextPlayer(player);
                }
                break
            case DRAW_FROM_NORMAL_CARDS:
                if (this.checkIfINeedToReplicate(arr[1])) {
                    let chosenNumbers = [];
                    for (let i = 2; i < arr.length; i++) {
                        chosenNumbers.push(parseInt(arr[i]));
                    }
                    this.distribute(chosenNumbers);
                }
                break
            case DRAW_FROM_CHEAT_CARDS:
                if (this.checkIfINeedToReplicate(arr[1])) {
                    for (let i = 0; i < this.players.length; i++) {
                        this.cheatCards(this.players[i]);
                    }
                }
                break
        }
    }

    checkIfINeedToReplicate(numbers_string) {
        let numbers = [];
        for (let i = 0; i < numbers_string.length; i++) {
            numbers.push(parseInt(numbers_string[i]));
        }
        if (containsObject(this.MY_NUMBER, numbers)) {
            return true
        }
        return false
    }

    backend(command) {
        backend(command);
    }
}

class ElementManager {

  static display(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    } else {
      console.log(`Developer error: Element with ID "${id}" not found.`);
    }
  }

  // for each id this should be called only once
  static addEventListener(id, handler, args = []) {
    const el = document.getElementById(id);
    if (!el) {
      console.log(`Developer error: Element with ID "${id}" not found.`);
      return;
    }

    el.onclick = function() {
        if (Array.isArray(args) && args.length > 0) {
            handler(...args, event);
        } else {
            handler(event);
        }
    }
  }
}


// // manage the fields "want to go back" and "want to enter goal fields"
// // ######################################

let wantsToGoBack = false;
let WANTS_TO_GO_BACK_TEXT = "Want to go back: ";

function changeWantsToGoBack(i) {
    wantsToGoBack = !wantsToGoBack;
    ElementManager.display("wtgb", WANTS_TO_GO_BACK_TEXT + wantsToGoBack);
}

let wantsToEnterGoalField = false;
let WANTS_TO_ENTER_GOAL_FIELD_TEXT = "Want to enter goal field: "

function changeWantsToEnterGoalField(i) {
    wantsToEnterGoalField = !wantsToEnterGoalField;
    ElementManager.display("wtegf", WANTS_TO_ENTER_GOAL_FIELD_TEXT + wantsToEnterGoalField);
}

// ######################################

// manage messages to the user
// ######################################
let html_message_bit = false;
let HTML_MESSAGE = " ";

function displayHTML_message(message) {
    html_message_bit = true;
    HTML_MESSAGE = message;
    updateBoard();
}

function getMessage() {
    if (html_message_bit) {
        html_message_bit = false;
        let returnMessage = (" " + HTML_MESSAGE).slice(1);
        HTML_MESSAGE = " ";
        return returnMessage;
    } else {
        let message = tremola.tinydog.active[tremola.tinydog.current].game.getMessage();
        return message;
    }
}

function updateMessage() {
    for (let i=1;i<2;i++) {
        let id = "m"
        let message = getMessage();
        ElementManager.display(id, `Click on this message to remove the error messsage: ` + message);
    }
}

function neutralizeMessage(id) {
    let message = getMessage();
    ElementManager.display(id, `Click on this message to remove the error messsage: ` + message);
}
// ######################################

// regular boxes
function getRegularBoxes() {
    let regularBoxesHTML = [];
    for (let i=0;i<=47;i++) {
        let id = "box" + i.toString();
        regularBoxesHTML.push(id);
    }
    return regularBoxesHTML;
}

function initializeBoxes() {
    let board = tremola.tinydog.active[tremola.tinydog.current].game.getBoard();
    for (let i=0;i<=47;i++) {
        let id = "box" + i.toString();
        ElementManager.display(id,board[i]);
        ElementManager.addEventListener(id, onBoxClick, [id]);
    }
}
function updateBoxes() {
    let board = tremola.tinydog.active[tremola.tinydog.current].game.getBoard();
    for (let i=0;i<=47;i++) {
        let id = "box" + i.toString();
        ElementManager.display(id,board[i]);
    }
}

// home fields

function getHomeFields() {
    let homeFieldsHTML = [];
    for (let p=1;p<4;p++) {
        for (let h=1;h<5;h++) {
            let id = "p" + p + "h" + h;
            homeFieldsHTML.push(id);
        }
    }
    return homeFieldsHTML;
}

function initializeHomefields() {
    let homeFields = tremola.tinydog.active[tremola.tinydog.current].game.getHomefields();
    for (let p=1;p<4;p++) {
        for (let h=1;h<5;h++) {
            let id = "p" + p + "h" + h;
            ElementManager.display(id, homeFields[p-1][h-1]);
            ElementManager.addEventListener(id, onBoxClick, [id]);
        }
    }
}
function updateHomefields() {
    let homeFields = tremola.tinydog.active[tremola.tinydog.current].game.getHomefields();
    for (let p=1;p<4;p++) {
        for (let h=1;h<5;h++) {
            let id = "p" + p + "h" + h;
            ElementManager.display(id, homeFields[p-1][h-1]);
        }
    }
}

// win fields

function getWinfields() {
    let winFieldsHTML = [];
    for (let p=1;p<4;p++) {
        for (let w=1;w<5;w++) {
            let id = "p" + p + "w" + w;
            winFieldsHTML.push(id);
        }
    }
    return winFieldsHTML;
}

function initializeWinfields() {
    let winfields = tremola.tinydog.active[tremola.tinydog.current].game.getWinfields();
    for (let p=1;p<4;p++) {
        for (let w=1;w<5;w++) {
            let id = "p" + p + "w" + w;
            ElementManager.display(id, winfields[p-1][w-1]);
            ElementManager.addEventListener(id, onBoxClick, [id]);
        }
    }
}
function updateeWinfields() {
    let winfields = tremola.tinydog.active[tremola.tinydog.current].game.getWinfields();
    for (let p=1;p<4;p++) {
        for (let w=1;w<5;w++) {
            let id = "p" + p + "w" + w;
            ElementManager.display(id, winfields[p-1][w-1]);
        }
    }
}

// circle
function getCircleFields() {
    let circleHTML = [];
    for (let i=1;i<2;i++) {
        let id = "circle"
        circleHTML.push(id);
    }
    return circleHTML;
}

// cards

function getCards() {
    let cardsHTML = [];
    for (let p=1;p<4;p++) {
        for (let c=1;c<7;c++) {
            let id = "p" + p + "c" + c;
            cardsHTML.push(id);
        }
    }
    return cardsHTML;
}

function initializeCards() {
    let cards = tremola.tinydog.active[tremola.tinydog.current].game.getPlayerCards();
    for (let p=1;p<4;p++) {
        for (let c=1;c<7;c++) {
            let id = "p" + p + "c" + c;
            if (p == currentPlayingPlayer) {
                ElementManager.display(id, cards[p-1][c-1]);
            } else {
                ElementManager.display(id, "X");
            }
            ElementManager.addEventListener(id, onBoxClick, [id]);
        }
    }
}
function updateeCards() {
    let cards = tremola.tinydog.active[tremola.tinydog.current].game.getPlayerCards();
    for (let p=1;p<4;p++) {
        for (let c=1;c<7;c++) {
            let id = "p" + p + "c" + c;
            if (p == currentPlayingPlayer) {
                ElementManager.display(id, cards[p-1][c-1]);
            } else {
                ElementManager.display(id, "X");
            }
        }
    }
}

function onBoxClick(id) {
    if (containsObject(id, getRegularBoxes())) {
        let fieldNo = 0;
        if (id.length == 4) {
            fieldNo = parseInt(id.substring(3,4));
        } else if (id.length == 5) {
            fieldNo = parseInt(id.substring(3,5));
        } else {
            console.log("Developer error: Field id is not valid.")
        }
        tremola.tinydog.active[tremola.tinydog.current].game.choosesMarble(currentPlayingPlayer, 0, fieldNo+1, wantsToEnterGoalField, wantsToGoBack)
    } else if (containsObject(id, getHomeFields())) {
        let fieldOwner = parseInt(id[1]);
        let fieldNo = parseInt(id[3]);
        if (fieldOwner != currentPlayingPlayer) {
            displayHTML_message("These are not your fields.");
            return
        }
        tremola.tinydog.active[tremola.tinydog.current].game.choosesMarble(currentPlayingPlayer, -1, fieldNo, wantsToEnterGoalField, wantsToGoBack);
    } else if (containsObject(id, getWinfields())) {
        let fieldOwner = parseInt(id[1]);
        let fieldNo = parseInt(id[3]);
        if (fieldOwner != currentPlayingPlayer) {
            displayHTML_message("These are not your fields.");
            return
        }
        tremola.tinydog.active[tremola.tinydog.current].game.choosesMarble(currentPlayingPlayer, 1, fieldNo, wantsToEnterGoalField, wantsToGoBack);
    } else if (containsObject(id, getCircleFields())) {
        tremola.tinydog.active[tremola.tinydog.current].game.wantsToRejectCard(currentPlayingPlayer);
    } else if (containsObject(id, getCards())) {
        let cardOwner = parseInt(id[1]);
        if (cardOwner != currentPlayingPlayer) {
            displayHTML_message("This is not your deck.");
            return
        }
        let cardNo = parseInt(id[3]);
        tremola.tinydog.active[tremola.tinydog.current].game.choosesCard(currentPlayingPlayer, cardNo);
    } else {
        console.log(`Developer error: This function should have not been invoked with id ${id}`);
    }
    updateBoard();
}

function updateBoard() {
    updateBoxes();
    updateHomefields();
    updateeWinfields();
    updateeCards();
    updateMessage();
}

function initialize_board() {

    // want to go back button
    for (let i=1;i<2;i++) {
        let id = "wtgb"
        ElementManager.display(id, WANTS_TO_GO_BACK_TEXT + wantsToGoBack);
        ElementManager.addEventListener(id, changeWantsToGoBack, [id]);
    }

    // wants to enter goal field
    for (let i=1;i<2;i++) {
        let id = "wtegf"
        ElementManager.display(id, WANTS_TO_ENTER_GOAL_FIELD_TEXT + wantsToEnterGoalField);
        ElementManager.addEventListener(id, changeWantsToEnterGoalField, [id]);
    }

    // error message
    for (let i=1;i<2;i++) {
        let id = "m"
        let initialMessage = "";
        ElementManager.display(id, initialMessage);
        ElementManager.addEventListener(id, neutralizeMessage, [id]);
    }

    initializeBoxes();
    initializeHomefields();
    initializeWinfields();
    initializeCards();

    for (let i=1;i<2;i++) {
        let id = "circle"
        ElementManager.addEventListener(id, onBoxClick, [id]);
    }
}