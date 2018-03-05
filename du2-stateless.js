const net = require('net');

const hostname = '127.0.0.1';
const port = 3000;

const WELCOME_MSG = "Welcome to the STATELESS order server!\n" +
    "State and command is separated by ':'. Type 'initial:open' to open the basket.\n";


// define communication states
function State(name, command, answer) {
    this.name = name;
    this.command = command;
    this.answer = answer;
}

let initial = new State("initial", "open", "New state: 'opened'. Next command is 'add'.");
let opened = new State("opened", "add", "New state: 'added'. Next command is 'process'.");
let added = new State("added", "process", "Finished. New state: 'initial'. Start over using 'open'.");

initial.next = opened;
opened.next = added;
added.next = initial; // start over after the last state

const states = [initial, opened, added];

function getStateByName(name) {
    for (let i = 0; i < states.length; i++)
        if (states[i].name === name)
            return states[i];
    return null;
}

////////////////////

// function with the app logic - makes sure server accepts only a correct message
function processData(data) {
    let answer = "";

    // parse state and command from the data, ":" is a separator
    let stateStr = data.split(':')[0];
    let commandStr = data.split(':')[1];

    // try to get state by supplied name
    let state = getStateByName(stateStr);

    console.log(stateStr + " " + commandStr + " " + state.name);

    if (commandStr != null && commandStr === state.command) {
        answer = state.answer;
    } else {
        answer = "Wrong combination of state/request data.";
    }

    return answer + "\n";
}

// server implementation (one session)
const server = net.createServer(function (socket) {
    // identify client
    let clientId = socket.remoteAddress + ":" + socket.remotePort;

    console.log('socket opened: ' + clientId);
    socket.setEncoding('utf8');

    // send welcome message
    socket.write(WELCOME_MSG);

    // log when the connection closes
    socket.on('end', function () {
        console.log('connection/socket closed: ' + clientId);
    });

    // process incoming data from client
    socket.on('data', function (data) {
        // trim whitespace ('\n' at the end of data)
        data = data.trim();
        console.log('Incoming data: \'' + data + '\' from ' + clientId);

        let answer = processData(data);
        console.log('Answer to ' + clientId + ': ' + answer);
        socket.write(answer);
    });
});

// run server
server.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
});