const net = require('net');

const hostname = '127.0.0.1';
const port = 3000;

const WELCOME_MSG = "Welcome to the STATEFUL order server!\n" +
    "Type 'open' to open the basket.\n";


// define communication states
function State(name, answer) {
    this.name = name;
    this.answer = answer;
}

let open = new State("open", "opened. Next command is 'add'.");
let add = new State("add", "added. Next command is 'process'.");
let process = new State("process", "processed. Start over using 'open'.");

open.next = add;
add.next = process;
process.next = open; // start over after the last state
////////////////////


// function with the app logic - makes sure server accepts only a correct message
function processData(data, state, setNewState) {
    let answer = "";

    if (data === state.name) {
        answer = state.answer;
        setNewState(state.next); // update client's state
    } else {
        answer = "Wrong combination of state/request data.";
    }

    return answer + "\n";
}


// server implementation (one session)
const server = net.createServer(function (socket) {
    // identify client, assign him a new state
    let clientId = socket.remoteAddress + ":" + socket.remotePort;
    let clientState = open;

    console.log('socket opened: ' + clientId);
    socket.setEncoding('utf8');

    // send welcome message
    socket.write(WELCOME_MSG);

    // log when the connection closes
    socket.on('end', function () {
        console.log('connection/socket closed: ' + clientId + ' with state: ' + clientState.name);
    });

    // process incoming data from client
    socket.on('data', function (data) {
        // trim whitespace ('\n' at the end of data)
        data = data.trim();
        console.log('Incoming data: \'' + data + '\' from ' + clientId + ' with state: ' + clientState.name);

        let answer = processData(data, clientState, stateCallback);
        console.log('Answer to ' + clientId + ' with state ' + clientState.name + ': ' + answer);
        socket.write(answer);
        //socket.end(); // close socket/connection
    });

    // simple callback to update client's state
    function stateCallback(state) {
        clientState = state;
    }
});

// run server
server.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
});