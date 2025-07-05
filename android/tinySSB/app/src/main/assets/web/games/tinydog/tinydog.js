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

function tdg_load_list() {
    let lst = document.getElementById("div:tinydog_list");
    lst.innerHTML = '';

    if (typeof tremola.tinydog === "undefined")
        tremola.tinydog = { 'active': {}, 'closed': {} };

    for (let id in tremola.tinydog.active) {
        let g = tremola.tinydog.active[id];
        let others = g.participants.filter(p => p !== myId).map(fid2display).join(" & ");

        let item = document.createElement('div'); // äußeres Container-div pro Zeile

        // Left Button (Peers, state / open)
        let row = `<button class='tdg_list_button' onclick='tdg_load_board("${id}");'
                        style='overflow: hidden; width: 70%; background-color: #ebf4fa;'>`;
        row += "<div style='white-space: nowrap;'><div style='text-overflow: ellipsis; overflow: hidden;'>";
        row += "TinyDog with " + others + "<br>" + g.state;
        if (g.state === 'invited') {
            row += " (click here to accept)";
        }
        row += "</div></div></button>";

        // Right Button (Action)
        // TODO handle actions in append-log (backend)
        let btxt;
        if (g.state === 'invited')     btxt = 'decline';
        else if (g.state === 'closed') btxt = 'delete';
        else                           btxt = 'end';

        row += `<button class='tdg_list_button'
                        style='width: 20%; text-align: center;'
                        onclick='tdg_list_callback("${id}", "${btxt}")'>${btxt}</button>`;

        item.innerHTML = row;
        lst.appendChild(item);
    }
}

function tdg_on_rx(ref, from, args) {
    if (typeof tremola.tinydog == "undefined")
        tremola.tinydog = { 'active': {}, 'closed': {} };
    let ta = tremola.tinydog.active;

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
        if (curr_scenario === 'tinydog-list')
            tdg_load_list();
        return;
    }
}

function tdg_load_board(id) {
    let g = tremola.tinydog.active[id];
    if (g.state == 'inviting')
        return;
    if (g.state == 'invited') {
        tdg_list_callback(id,'accept');
        return;
    }
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

function tdg_list_callback(id, action) {
    let g = tremola.tinydog.active[id]
    if (action == 'accept')
        backend('tinydog A ' + id)
    tdg_load_list();
}