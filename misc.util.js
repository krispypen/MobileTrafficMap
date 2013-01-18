var EARTH_RADIUS = 6367454.0;
var EQUATOR_LENGTH = 2 * Math.PI * EARTH_RADIUS;
var METERS_PER_MILE = 1609.344;

//############

// expires is set in seconds
function setCookie(name, value, expires, path, domain, secure) {
  var today = new Date();
  today.setTime(today.getTime());

  if (expires)
    expires *= 1000;
  var expDate = new Date(today.getTime()+expires);

  var ck = name + "=" + escape(value);
  if (expires)
    ck += ";expires=" + expDate.toGMTString();
  if (path)
    ck += ";path=" + path;
  if (domain)
    ck += ";domain=" + domain;
  if (secure)
    ck += ";secure";

  document.cookie = ck;
}

//############

function getCookie(name) {
  if (!document.cookie)
    return null;

  var cookies = document.cookie.split(';');
  for (var i=0; i<cookies.length; i++) {
    var ck = cookies[i].split('=');
    var n = ck[0].replace(/^\s+|\s+$/g, '');
    if (n == name) {
      if (ck.length > 1)
        return unescape(ck[1].replace(/^\s+|\s+$/g, ''));
      else
        return null;
    }
  }
  return null;
}

//############

function deleteCookie(name, path, domain) {
  if (getCookie(name)) {
    var ck = name + "=";

    if (path)
      ck += ";path=" + path;
    if (domain)
      ck += ";domain=" + domain;
    ck += ";expires=Thu, 01-Jan-1970 00:00:01 GMT";

    document.cookie = ck;

    // needed?
    getCookie(name);
  }
}

//############

function loadSettings() {
  deleteCookie("user");
  deleteCookie("pass");
  var o = getCookie("options");
  if (o)
    loadOptions(JSON.parse(o));
}

//############

function loadOptions(o) {
  if (!o.version)
    o.version = 0;
  // TODO use o.version to load only specific elements
  options.username = o.username;
  options.passwordHash = o.passwordHash;
  if (options.username && options.passwordHash)
    loggedIn = true;

  options.radius = o.radius;
  options.metric = o.metric;
  options.map.gps = o.map.gps;
  options.map.type = o.map.type;
  options.map.zoom = o.map.zoom;
  options.map.lat = o.map.lat;
  options.map.lon = o.map.lon;
  if (o.version >= 4) {
    options.filter.include = o.filter.include;
    options.filter.audible = o.filter.audible;
    options.filter.rlcspeed = o.filter.rlcspeed;
  }
  if (o.version >= 5) {
    options.theme.id = o.theme.id;
    if (o.theme.url)
      options.theme.url = o.theme.url;
  }

  // save the newly loaded/updated options
  saveSettings();
}


//############

function convertUnits(d, negate) {
  if (options.metric ^ negate)
    return d / 1000;
  else
    return d / METERS_PER_MILE;
}

//############

function toRadians(x) { return x * Math.PI / 180.0; }

//############

function toDegrees(x) { return x * 180.0 / Math.PI; }

//############

google.maps.LatLng.prototype.distanceFrom = function(other) {
  var p1latr = toRadians(other.lat());
  var p2latr = toRadians(this.lat());
  var dlat = (p2latr - p1latr)/2;
  var dlon = toRadians(this.lng()-other.lng())/2;
  var s1 = Math.sin(dlat);
  var s2 = Math.sin(dlon);
  var h = s1 * s1 + Math.cos(p1latr) * Math.cos(p2latr) * s2 * s2;
  var dist = 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
  return dist;
}

//############

google.maps.LatLng.prototype.initialTrueCourseFrom = function(other) {
  var dlon = toRadians(this.lng()-other.lng());
  var p1latr = toRadians(other.lat());
  var p2latr = toRadians(this.lat());

  var c1 = Math.cos(p1latr);
  if (c1 < 0.00001)
    return (p1latr > 0) ? 180 : 0;

  var c2 = Math.cos(p2latr);
  var at1 = Math.sin(dlon)*c2;
  var at2 = c1*Math.sin(p2latr)-Math.sin(p1latr)*c2*Math.cos(dlon);
  var at = toDegrees(Math.atan2(at1, at2));

  if (at < 0)
    return at + 360;
  else if (at >= 360)
    return at - 360;
  else
    return at;
}

//############

google.maps.LatLng.prototype.finalTrueCourseFrom = function(other) {
  var crs = other.initialTrueCourseFrom(this) + 180;
  if (crs >= 360)
    return crs - 360;
  else
    return crs;
}

//############

google.maps.LatLng.prototype.getPixelSizeInMeters = function(z, ts) {
  var latrad = toRadians(this.lat());
  return EQUATOR_LENGTH * Math.cos(latrad) / (1<<z) / ts;
}

//############

function findpos(obj) {
  var curleft = curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
  }

  return { left:curleft, top:curtop };
}
