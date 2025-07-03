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
        let others = g.peers.filter(p => p !== myId).map(fid2display).join(" & ");

        let row = "<div class='contact_item_button light' style='margin: 10px;' onclick='tdg_open_game(\"" + id + "\")'>";
        row += "<strong>TinyDog with " + others + "</strong><br>";
        row += "Created: " + new Date(g.created).toLocaleString();
        row += "</div>";

        lst.innerHTML += row;
    }
}

function tdg_on_rx(ref, from, args) {
    if (typeof tremola.tinydog == "undefined")
        tremola.tinydog = { 'active': {}, 'closed': {} };
    let ta = tremola.tinydog.active;

    if (args[0] == 'N') {
        let participants = [args[1], args[2], myId];

        if (!participants.includes(myId))
            return; // ignore if not a participant

        let initiator = from;
        let otherPlayers = participants.filter(p => p !== myId);

        ta[ref] = {
            'peers': otherPlayers,                    // the other two players
            'participants': participants,             // all 3 player IDs
            'state': (myId === initiator) ? 'inviting' : 'invited',
            'close_reason': '',
            'board': [0,0,0,0,0,0,0,0,0],
            'cnt': 0,
            'me_index': participants.indexOf(myId) + 1
        };

        persist();
        console.log("tdx_on_rx args " + JSON.stringify(args) + ` from=${from} ref=${ref}`);
        if (curr_scenario === 'tinydog-list')
            tdg_load_list();
        return;
    }
}