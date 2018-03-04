let net = require('net');

const hostname = '127.0.0.1';
const port = 3000;

let server = net.createServer(function (c) {
    console.log('socket opened');
    c.setEncoding('utf8');
    c.on('end', function () {
        console.log('connection/socket closed');
    });
    c.on('data', function (data) {
        console.log('Data:' + data);
        c.write('Answer:' + data);
        c.end(); // close socket/conection
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});