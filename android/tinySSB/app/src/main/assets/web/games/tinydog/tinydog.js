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
            <em>(TODO: insert game table here.)</em>
        </div>
    `;

    t.innerHTML = titleHTML;

    tremola.tinydog.current = id;
    setScenario('tinydog-board')
}

// Scenario for choosing two peers (after clicking on plus button)
function tdg_new_game() {
    closeOverlay();
    fill_members_dual(true);
    prev_scenario = 'tinydog-list';
    setScenario("members");

    document.getElementById("div:textarea").style.display = 'none';
    document.getElementById("div:confirm-members").style.display = 'flex';
    document.getElementById("tremolaTitle").style.display = 'none';

    let c = document.getElementById("conversationTitle");
    c.style.display = null;
    c.innerHTML = "<font size=+1><strong>Launch TinyDog</strong></font><br>Select 2 peers to invite";
    document.getElementById('plus').style.display = 'none';
}

// Called by OK-Button while choosing peers
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
        };

        persist();
        console.log("tdx_on_rx args " + JSON.stringify(args) + ` from=${from} ref=${ref}`);
        if (curr_scenario === 'tinydog-list')
            tdg_load_list();
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
     }

    if (curr_scenario === 'tinydog-list')
        tdg_load_list();
    return;
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