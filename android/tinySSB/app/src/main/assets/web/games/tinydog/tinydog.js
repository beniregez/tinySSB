function tdg_new_game() {
    closeOverlay();
    fill_members(true);
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

    if (selected.length === 3) {
        let [p1, p2, p3] = selected;
    // TODO implement in backend (WebAppInterface.kt)
        backend("tinydog N " + p1 + " " + p2);
    }

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