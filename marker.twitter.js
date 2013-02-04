
function TwitterMarker(name, text, lat, lon) {
  this.speed = 0;
  this.heading = 0;
  this.name = name;
  this.text = text;
  this.lat = lat;
  this.lon = lon;

  this.startAngle = 0;
  this.angle = 0;
  this.lengthMul = 1;
  this.radius = 0;

  google.maps.Marker.apply(this, [ { icon: 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=T|1dcaff|FFFFFF', position: new google.maps.LatLng(0, 0), flat: true, clickable: true } ]);
  console.log("lat: " + lat + " lon: " + lon);
  this.setPosition(new google.maps.LatLng(lat, lon));
  var twinfowindow = new google.maps.InfoWindow({
	content: "<strong>" + this.name + ": </strong> " + this.text,
	disableAutoPan: true,
	maxWidth: 300
  });
  twinfowindow.open(map,this);
  google.maps.event.addListener(this, 'click', function() {
    twinfowindow.open(map,this);
  });
  setTimeout(function(){twinfowindow.close()}, 3000);
}

TwitterMarkers = [];
TwitterMarker.createMarker = function(name, text, lat, lon) {
  TwitterTest = new TwitterMarker(name, text, lat, lon);
  TwitterTest.setMap(map);
  //TwitterMarkers.push(TwitterTest);
  //return TwitterTest;
}
TwitterMarker.removeMarker = function(identifier) {
  if(typeof(TwitterMarkers[identifier]) != "undefined") {
    TwitterMarkers[identifier].setMap(null);
    return true;
  }
  return false;
}

TwitterMarker.prototype = new google.maps.Marker({position:new google.maps.LatLng(0, 0)});
TwitterMarker.prototype.constructor = TwitterMarker;

TwitterMarker.prototype.setSpeedHeading = function(s, h) {
  this.speed = s;
  if (h !== false)
    this.heading = h;
  this.computeParams();
}

TwitterMarker.prototype.setName = function(name) {
  this.name = name;
}

TwitterMarker.prototype.getSpeed = function() {
  return this.speed;
}

TwitterMarker.prototype.getHeading = function() {
  return this.heading;
}

TwitterMarker.prototype.computeParams = function() {
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

TwitterMarker.prototype.getVRRadius = function() {
  return this.radius;
}

TwitterMarker.prototype.getVRArcAngle = function() {
  return this.angle;
}

TwitterMarker.prototype.getVRStartAngle = function() {
  return this.startAngle;
}

TwitterMarker.prototype.getVRLengthMultiplier = function() {
  return this.lengthMul;
}
