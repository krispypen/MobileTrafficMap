function FriendMarker() {
  var gpsIcon = new google.maps.Marker(
    'icons/friend.png',
    new google.maps.Size(10, 11),
    new google.maps.Point(0, 0),
    new google.maps.Point(4, 5)
  );

  this.speed = 0;
  this.heading = 0;
  this.name = 'No name';

  this.startAngle = 0;
  this.angle = 0;
  this.lengthMul = 1;
  this.radius = 0;

  google.maps.Marker.apply(this, [ { position: new google.maps.LatLng(0, 0), flat: true, clickable: true } ]);
  google.maps.event.addListener(this, 'click', function() {
      var infowindow = new google.maps.InfoWindow({
	    content: this.name
	  });
      
	  infowindow.open(map,this);
	});
}

friendMarkers = [];
FriendMarker.getOrCreateMarker = function(identifier) {
  if(typeof(friendMarkers[identifier]) == "undefined") {
  	friendTest = new FriendMarker();
    friendTest.setMap(map);
    friendTest.setPosition(new google.maps.LatLng(51, 5.2));
    friendMarkers[identifier] = friendTest;
  }
  return friendMarkers[identifier];
}
FriendMarker.removeMarker = function(identifier) {
  if(typeof(friendMarkers[identifier]) != "undefined") {
    friendMarkers[identifier].setMap(null);
    return true;
  }
  return false;
}

FriendMarker.prototype = new google.maps.Marker({position:new google.maps.LatLng(0, 0)});
FriendMarker.prototype.constructor = FriendMarker;

FriendMarker.prototype.setSpeedHeading = function(s, h) {
  this.speed = s;
  if (h !== false)
    this.heading = h;
  this.computeParams();
}

FriendMarker.prototype.setName = function(name) {
  this.name = name;
}

FriendMarker.prototype.getSpeed = function() {
  return this.speed;
}

FriendMarker.prototype.getHeading = function() {
  return this.heading;
}

FriendMarker.prototype.computeParams = function() {
  var pixelSize = convertUnits(this.getPosition().getPixelSizeInMeters(map.getZoom(), 256));
  this.radius = 0.3 / pixelSize;

  if (this.speed < 5.0)
    this.angle = 360.0;
  else if (this.speed < 15.0)
    this.angle = 360.0-(this.speed-5.0)*18;
  else if (this.speed < 30.0)
    this.angle = 180.0-(this.speed-15.0)*3;
  else if (this.speed < 50.0)
    this.angle = 135.0-(this.speed-30.0)*2;
  else if (this.speed < 90.0)
    this.angle = 95.0-(this.speed-50.0);
  else if (this.speed < 130.0)
    this.angle = 55.0-(this.speed-90.0)/2;
  else if (this.speed < 205.0)
    this.angle = 35.0-(this.speed-130.0)/5;
  else
    this.angle = 20.0;

  var headingAngle = 90-this.heading;
  if (headingAngle < -180)
    headingAngle += 360;
  this.startAngle = headingAngle-this.angle/2;

  if (this.speed < 30.0)
    this.lengthMul = 1.0;
  else if (this.speed < 50.0)
    this.lengthMul = 1.0+(this.speed-30.0)/200;
  else if (this.speed < 90.0)
    this.lengthMul = 1.1+(this.speed-50.0)/100;
  else if (this.speed < 130.0)
    this.lengthMul = 1.5+(this.speed-90.0)/80;
  else
    this.lengthMul = 2.0;

  // TODO update flash parameters
}

FriendMarker.prototype.getVRRadius = function() {
  return this.radius;
}

FriendMarker.prototype.getVRArcAngle = function() {
  return this.angle;
}

FriendMarker.prototype.getVRStartAngle = function() {
  return this.startAngle;
}

FriendMarker.prototype.getVRLengthMultiplier = function() {
  return this.lengthMul;
}
