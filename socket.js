  socket = null;
  socketConnectionInited = false;
  
  window.addEventListener("load", function(){
    var url = 'http://46.4.79.121:1337';
    //var url = 'http://localhost:1337';
    socket = io.connect(url);
    var name = getRequestParam('name');
    if(name) {
      socket.emit('setname', name)
    }
    socket.on('connect', function(data) {
      socketConnectionInited= true;
      if(gpsPlace && gpsPlace.getPosition()) {
        console.log("gpsPlace is inited");
        var obj = {
          time: new Date(),
          lat: gpsPlace.getPosition().lat(),
          lon: gpsPlace.getPosition().lng()
        };
        socket.emit('updatelocation', obj);
      } else {
        console.log("gpsPlace not yet inited");
      }
      var roomParam = getRequestParam('room');
      if(roomParam) {
        var rooms = roomParam.split(',');
        //step into rooms
        for (var j=0; j < rooms.length; j++) {
          var room = rooms[j];
          var obj = {
            name: room
          };
          socket.emit('enterroom', obj);
          var chathtml = '<div class="roomlistitem">';
          chathtml += '<div class="roombutton" id="' + room + '_roombutton" onclick="document.getElementById(\'' + room + '_roomwindow\').style.display=\'block\';this.style.display=\'none\'">' + room + '</div>';
          chathtml += '<div class="roomwindow" id="' + room + '_roomwindow"><h1><span class="closer" onclick="document.getElementById(\'' + room + '_roombutton\').style.display=\'block\';document.getElementById(\'' + room + '_roomwindow\').style.display=\'none\'">-</span>' + room + '</h1>';
          chathtml += '<div class="chattext" id="' + room + '_chattext"></div>';
          chathtml += '<form onsubmit="sendchat(\'' + room + '\');return false;">';
          chathtml += '<input type="text" id="' + room + '_chatinputbox" class="chatinputbox"></input></div>';
          chathtml += '</form>';
          chathtml += '</div>';
          document.getElementById('roomlist').innerHTML += chathtml;
        }
      }
    });
    socket.on('removeclient', function (data) {
      console.log('removeclient');
      console.log(data);
      FriendMarker.removeMarker(data.identifier);
    });
    socket.on('addclient', function (data) {
      console.log('addclient');
      console.log(data);
      var marker = FriendMarker.getOrCreateMarker(data.identifier);
      marker.setName(data.name);
      marker.setPosition(new google.maps.LatLng(data.lat, data.lon));
    });
    socket.on('updatelocation', function (data) {
      console.log('updatelocation');
      console.log(data);
      var marker = FriendMarker.getOrCreateMarker(data.identifier);
      marker.setName(data.name);
      marker.setPosition(new google.maps.LatLng(data.lat, data.lon));
    });
    socket.on('chat', function (data) {
      document.getElementById(data.room + '_chattext').innerHTML = document.getElementById(data.room + '_chattext').innerHTML
        + '<div class="chatline">' + data.name + ': '+ data.text + '</div>';
      document.getElementById(data.room + '_roombutton').style.display='none';
      document.getElementById(data.room + '_roomwindow').style.display='block';
    });
    socket.on('newtweet', function (data) {
      console.log('newtweet');
      console.log(data);
      TwitterMarker.createMarker(data.name, data.text, data.lat, data.lon);
    });
  }, false);
  
function getRequestParam(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}
//maybe better function??
function parseQueryString() {
    var query = (window.location.search || '?').substr(1),
        map   = {};
    query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
        (map[key] = map[key] || []).push(value);
    });
    return map;
}
