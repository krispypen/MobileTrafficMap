
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
    var rooms = client.getRooms().slice(); //slice is needed because the array changes in the for loop
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
  this.addClient = function(client) {
    this.clients.push(client);
  };
  this.getClients = function() {
    return this.clients;
  };
  this.removeClient = function(client) {
    this.clients.removeByValue(client);
  }
  this.getName = function() {
    return this.name;
  }
}

function Client(socket, key, name) {
  this.socket = socket;
  this.key = key;
  this.name = name;
  this.lat;
  this.lon;
  this.rooms = new Array();
  this.addRoom = function(room) {
    var roomMates = room.getClients();
    console.log('roommates.length: ' + roomMates.length);
    for (var j=0; j < roomMates.length; j++) {
      var roomMate = roomMates[j];
      var obj = {
        time: (new Date()),
        identifier: roomMate.getKey(),
        name: roomMate.getName(),
        lat: roomMate.getLatitude(),
        lon: roomMate.getLongitude()
      };
      console.log("sending addclient to " + this.getName() + " (" + this.getKey() + ")");
      console.log(obj);
      this.getSocket().emit('addclient', obj);
      var obj = {
        time: new Date(),
        identifier: this.getKey(),
        name: this.getName(),
        lat: this.getLatitude(),
        lon: this.getLongitude()
      };
      console.log("sending updatelocation to " + roomMate.getName() + " (" + roomMate.getKey() + ")");
      console.log(obj);
      roomMate.getSocket().emit('addclient', obj);
    }
    this.rooms.push(room);
    room.addClient(this);
    console.log("client added to room " + room.getName());
  };
  this.removeRoom = function(room) {
    this.rooms.removeByValue(room);
    room.removeClient(this);
    var clients = room.getClients();
    for (var j=0; j < clients.length; j++) {
      var c = clients[j];
      var obj = {
        identifier: this.getKey()
      };
      console.log("sending removeclient to " + c.getName());
      console.log(obj);
      c.getSocket().emit('removeclient', obj);
      console.log("client removed from room " + room.getName());
    }
  };
  this.getSocket = function() {
    return this.socket;
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
            time: new Date(),
            identifier: this.getKey(),
            lat: this.getLatitude(),
            lon: this.getLongitude()
          };
          console.log("sending updatelocation to " + c.getName() + " (" + c.getKey() + ")");
          console.log(obj);
          c.getSocket().emit('updatelocation', obj);
        }
      }
    }
  };
  this.getLongitude = function() {
    return this.lon;
  };
}

var app = require('http').createServer()
  , io = require('socket.io').listen(app);

app.listen(1337);

io.sockets.on('connection', function (socket) {
  var client = new Client(socket, socket.id, "No name");
  socket.on('updatelocation', function (data) {
    console.log('updatelocation received from ' + client.getName());
    console.log(data);
    client.updateLocation(data.lat, data.lon);
  });
  socket.on('setname', function (data) {
    client.setName(data);
  });
  socket.on('enterroom', function (data) {
    var room = World.getOrCreateRoom(data.name);
    client.addRoom(room);
  });
  socket.on('leaveroom', function (data) {
    var room = World.getOrCreateRoom(data.name);
    client.removeRoom(room);
  });
  socket.on('sendchat', function (data) {
  console.log("chat received");
    var roomId = data.room;
    var text = data.text;
    var room = World.getOrCreateRoom(roomId);
    var clients = room.getClients();
    for (var j=0; j < clients.length; j++) {
      var c = clients[j];
      var obj = {
        time: new Date(),
        room: roomId,
        text: text,
        name: client.getName()
      };
      console.log("sending chat to " + c.getName() + " (" + c.getKey() + ")");
      console.log(obj);
      c.getSocket().emit('chat', obj);
    }
  });
  socket.on('disconnect', function() {
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
