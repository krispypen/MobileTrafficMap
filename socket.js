  socketConnection = null;
  socketConnectionInited = false;
  window.addEventListener("load", function(){
    var url = 'ws://localhost:1337';
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
      } else {
        var marker = FriendMarker.getOrCreateMarker(json.data.identifier);
        marker.setName(json.data.name);
        marker.setPosition(new google.maps.LatLng(json.data.lat, json.data.lon));
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