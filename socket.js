  socketConnection = null;
  socketConnectionInited = false;
  window.addEventListener("load", function(){
    var url = 'ws://46.4.79.121:1337';
    var name = getRequestParam('name');
    if(name) {
      url += '?name=' + name;
    }
    socketConnection = new WebSocket(url);
    socketConnection.onopen = function(evt) {
      socketConnectionInited= true;
      var roomParam = getRequestParam('room');
      if(roomParam) {
        var rooms = roomParam.split(',');
        //step into rooms
        for (var j=0; j < rooms.length; j++) {
          var room = rooms[j];
          var obj = {
            action: "enterroom",
            name: room
          };
          var json = JSON.stringify(obj);
          socketConnection.send(json);
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
    };
    socketConnection.onclose = function(evt) {
    
    };
    socketConnection.onmessage = function(message) {
      var json = JSON.parse(message.data);
      console.log(json);
      if(json.data.action == 'remove') {
        FriendMarker.removeMarker(json.data.identifier);
      } else if(json.data.action == 'add' || json.data.action == 'updateposition'){
        var marker = FriendMarker.getOrCreateMarker(json.data.identifier);
        marker.setName(json.data.name);
        marker.setPosition(new google.maps.LatLng(json.data.lat, json.data.lon));
      } else if(json.data.action == 'chat'){
        document.getElementById(json.data.room + '_chattext').innerHTML = document.getElementById(json.data.room + '_chattext').innerHTML
          + '<div class="chatline">' + json.data.name + ': '+ json.data.text + '</div>';
      }
    };
    socketConnection.onerror = function(evt) {
    
    };
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
