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

    // === Button for logging of previous Hash (Hex-String) ===
    let hashButton = document.createElement("button");
    hashButton.innerText = "Log prevHash in Console";
    hashButton.style.cssText = "margin-top: 20px; padding: 10px; font-weight: bold; background-color: #dceefb; border: 1px solid #339; border-radius: 6px; cursor: pointer;";

    hashButton.onclick = function () {
        let hexHash = Android.getPrevHashFromB64(myId);
        if (hexHash) {
            console.log("prevHash (hex):", hexHash);
        } else {
            console.log("prevHash not available or error calling.");
        }
    };

    lst.appendChild(hashButton);
}

function tdg_load_board(id) {
    let g = tremola.tinydog.active[id];
    if (g.state == 'inviting')
        return;
    if (g.state == 'invited')
        return;

    let t = document.getElementById('tdg_title');
    if (g.state == 'open') {
//        let m = (g.cnt % 2 === 0) ? "my turn ..." : "... not my turn";
        let m = "TODO (not) my turn";
        t.innerHTML = `<font size=+2><strong>${m}</strong></font>`;
    } else if (g.state == 'closed') {
//        let msg = g.close_reason || "Game ended";
        let msg = "closed";
        t.innerHTML = `<font size=+2 color=red><strong>${msg}</strong></font>`;
    } else {
        t.innerHTML = `<font size=+2><strong>Waiting for players...</strong></font>`;
    }

    // Show or hide optional footer
//    let f = document.getElementById('tdg_footer');
//    f.style.display = (g.state == 'closed') ? 'none' : null;

    // Placeholder for game table
    let tableContainer = document.getElementById('tdg_table');
    tableContainer.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <em>(TODO: insert game table here.)</em>
        </div>
    `;

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

    backend("tinydog N " + selected[0] + " " + selected[1])

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

        ta[ref] = {
            'peers': otherPlayers,                    // the other two players
            'participants': participants,             // all 3 player IDs
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
        }

        if (g.accepted.length === 2) {
            g.state = 'open';
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
        backend('tinydog A ' + id) // accept
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