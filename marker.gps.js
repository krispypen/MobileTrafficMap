function GPSMarker() {
  var gpsIcon = new google.maps.MarkerImage(
    'icons/gps.png',
    new google.maps.Size(10, 11),
    new google.maps.Point(0, 0),
    new google.maps.Point(4, 5)
  );

  this.speed = 0;
  this.heading = 0;

  this.startAngle = 0;
  this.angle = 0;
  this.lengthMul = 1;
  this.radius = 0;

  google.maps.Marker.apply(this, [ { position: new google.maps.LatLng(0, 0), flat: true, icon: gpsIcon, clickable: false } ]);
}

GPSMarker.prototype = new google.maps.Marker({position:new google.maps.LatLng(0, 0)});
GPSMarker.prototype.constructor = GPSMarker;

GPSMarker.prototype.setSpeedHeading = function(s, h) {
  this.speed = s;
  if (h !== false)
    this.heading = h;
  this.computeParams();
}

GPSMarker.prototype.getSpeed = function() {
  return this.speed;
}

GPSMarker.prototype.getHeading = function() {
  return this.heading;
}

GPSMarker.prototype.computeParams = function() {
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

GPSMarker.prototype.getVRRadius = function() {
  return this.radius;
}

GPSMarker.prototype.getVRArcAngle = function() {
  return this.angle;
}

GPSMarker.prototype.getVRStartAngle = function() {
  return this.startAngle;
}

GPSMarker.prototype.getVRLengthMultiplier = function() {
  return this.lengthMul;
}
