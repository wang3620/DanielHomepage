// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
'use strict';

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var https = require('https');
var fs = require('fs');

/**
 * Global variables
 */
// latest 100 messages
var history = [];
// list of currently connected clients (users)
var clients = [];

var http_files = {};
[
  ['/jquery.min.js', 'application/javascript'],
  ['/frontend.js', 'application/javascript'],
  ['/frontend.html', 'text/html']
].forEach(function (fn) {
  http_files[fn[0]] = {
    content: fs.readFileSync('./home/OnlineChatroom/.' + fn[0]).toString(),
    contentType: fn[1]
  };
});

http_files['/'] = http_files['/frontend.html'];
http_files['/index.html'] = http_files['/frontend.html'];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Array with some colors
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
// ... in random order
colors.sort(function (a, b) {
  return Math.random() > 0.5;
});

let privateKey;
let certificate;
let bundle;

if (process.env.ENV === 'local') {
  privateKey = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com_key.txt');
  certificate = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com.crt');
  bundle = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com.ca-bundle');
} else {
  privateKey = fs.readFileSync('/home/pi/.ssl/officialdaniel.com_key.txt');
  certificate = fs.readFileSync('/home/pi/.ssl/officialdaniel.com.crt');
  bundle = fs.readFileSync('/home/pi/.ssl/officialdaniel.com.ca-bundle');
}

/**
 * HTTP server
 */
var server = https.createServer(
  {
    key: privateKey,
    cert: certificate,
    ca: bundle
  },
  function (request, response) {
    // this doubles as a way to serve the fies, and a connection for websocket to use
    var file = http_files[request.url];
    if (file) {
      response.writeHeader(200, { 'content-type': file.contentType });
      response.write(file.content);
      return response.end();
    }
    response.writeHeader(404, { 'content-type': 'text/plain' });
    response.write('not found');
    return response.end();
  }
);

server.listen(webSocketsServerPort, function () {
  console.log(new Date() + 'Online Chat Server is listening on port ' + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket request is just
  // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function (request) {
  console.log(new Date() + ' Connection from origin ' + request.origin + '.');

  // accept connection - you should check 'request.origin' to make sure that
  // client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  var connection = request.accept(null, request.origin);
  // we need to know client index to remove them on 'close' event
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;

  console.log(new Date() + ' Connection accepted.');

  // send back chat history
  if (history.length > 0) {
    connection.sendUTF(JSON.stringify({ type: 'history', data: history }));
  }

  // user sent some message
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      // accept only text
      if (userName === false) {
        // first message sent by user is their name
        // remember user name
        userName = htmlEntities(message.utf8Data);
        // get random color and send it back to the user
        userColor = colors.shift();
        connection.sendUTF(JSON.stringify({ type: 'color', data: userColor }));
        console.log(
          new Date() + ' User is known as: ' + userName + ' with ' + userColor + ' color.'
        );
      } else {
        // log and broadcast the message
        console.log(new Date() + ' Received Message from ' + userName + ': ' + message.utf8Data);

        // we want to keep history of all sent messages
        var obj = {
          time: new Date().getTime(),
          text: htmlEntities(message.utf8Data),
          author: userName,
          color: userColor
        };
        history.push(obj);
        history = history.slice(-100);

        // broadcast message to all connected clients
        var json = JSON.stringify({ type: 'message', data: obj });
        for (var i = 0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
    }
  });

  // user disconnected
  connection.on('close', function (connection) {
    if (userName !== false && userColor !== false) {
      console.log(new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.');
      // remove user from the list of connected clients
      clients.splice(index, 1);
      // push back user's color to be reused by another user
      colors.push(userColor);
    }
  });
});
