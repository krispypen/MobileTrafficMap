
var World = {
  rooms: new Array(),
  clients: new Array(),
  
  getOrCreateRoom: function(name) {
    if(!this.rooms[name]){
      console.log('created a new room: ' + name);
      this.rooms[name] = new Room(name);
    }
    return this.rooms[name];
  },
  addClient: function(client) {
    this.clients.push(client);
  },
  removeClient: function(client) {
    var rooms = client.getRooms();
    for (var i=0; i < rooms.length; i++) {
       var room = rooms[i];
       client.removeRoom(room);
    }
    this.clients.removeByValue(client);
  }
};

function Room(name) {
  this.name = name;
  this.clients = new Array();
  this.name = 'No name';
  this.addClient = function(client) {
    this.clients.push(client);
  };
  this.getClients = function() {
    return this.clients;
  };
  this.removeClient = function(client) {
    this.clients.removeByValue(client);
  }
}

function Client(connection, key, name) {
  this.connection = connection;
  this.key = key;
  this.name = name;
  this.lat;
  this.lon;
  this.rooms = new Array();
  this.addRoom = function(room) {
    var roomMates = room.getClients();
    for (var j=0; j < roomMates.length; j++) {
      var roomMate = roomMates[j];
      var obj = {
        time: (new Date()).getTime(),
        action: "add",
        identifier: roomMate.getKey(),
        name: roomMate.getName(),
        lat: roomMate.getLatitude(),
        lon: roomMate.getLongitude()
      };
      console.log("sending to " + this.getName() + " (" + this.getKey() + ")");
      console.log(obj);
      var json = JSON.stringify({ type:'message', data: obj });
      this.getConnection().sendUTF(json);
    }
    this.rooms.push(room);
    room.addClient(this);
  };
  this.removeRoom = function(room) {
    this.rooms.removeByValue(room);
    room.removeClient(this);
    var clients = room.getClients();
    for (var j=0; j < clients.length; j++) {
      var c = clients[j];
      var obj = {
        action: "remove",
        identifier: this.getKey()
      };
      console.log("sending to " + c.getName());
      console.log(obj);
      var json = JSON.stringify({ type:'message', data: obj });
      c.getConnection().sendUTF(json);
    }
  };
  this.getConnection = function() {
    return this.connection;
  }
  this.getRooms = function() {
    return this.rooms;
  };
  this.getKey = function() {
    return this.key;
  };
  this.setKey = function(key) {
    this.key = key;
  };
  this.getName = function() {
    return this.name;
  };
  this.setName = function(name) {
    this.name = name;
  };
  this.getLatitude = function() {
    return this.lat;
  };
  this.updateLocation = function(lat, lon) {
    this.lat = lat;
    this.lon = lon;
    var rooms = this.getRooms();
    for (var i=0; i < rooms.length; i++) {
      var clients = rooms[i].getClients();
      for (var j=0; j < clients.length; j++) {
        var c = clients[j];
        if(c.getKey() != this.getKey()) {
          var obj = {
            time: (new Date()).getTime(),
            action: "updateposition",
            identifier: this.getKey(),
            lat: this.getLatitude(),
            lon: this.getLongitude()
          };
          console.log("sending to " + c.getName() + " (" + c.getKey() + ")");
          console.log(obj);
          var json = JSON.stringify({ type:'message', data: obj });
          c.getConnection().sendUTF(json);
        }
      }
    }
  };
  this.getLongitude = function() {
    return this.lon;
  };
}

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer();
server.listen(1337);

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    var client = new Client(connection, request.key, request.resourceURL.query.name);
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var json = JSON.parse(message.utf8Data);
            if(json.action == 'updateposition') {
              console.log("Received from " + client.getName() + " (" + client.getKey() + ")");
              console.log(json);
              client.updateLocation(json.lat, json.lon);
            } else if (json.action == 'enterroom') {
              var room = World.getOrCreateRoom(json.name);
              client.addRoom(room);
            } else if (json.action == 'leaveroom') {
              var room = World.getOrCreateRoom(json.name);
              client.removeRoom(room);
            } else if (json.action == 'chat') {
              var room = World.getOrCreateRoom(json.room);
              var clients = room.getClients();
              for (var j=0; j < clients.length; j++) {
                var c = clients[j];
                var obj = {
                  time: (new Date()).getTime(),
                  action: "chat",
                  room: json.room,
                  text: json.text,
                  name: client.getName()
                };
                console.log("sending to " + c.getName() + " (" + c.getKey() + ")");
                console.log(obj);
                var json = JSON.stringify({ type:'message', data: obj });
                c.getConnection().sendUTF(json);
              }
            }
        }
    });

    connection.on('close', function(connection) {
        World.removeClient(client);
    });
});

Array.prototype.removeByValue = function(val) {
    for(var i=0; i<this.length; i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}
