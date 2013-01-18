if (!this.DragFix)
  this.DragFix = {};

(function() {

  var div = null;
  var eventsAdded = false;
  var workaroundAdded = false;

  var dragging = false;
  var draggingStart = false;
  var DRAG_THRESHOLD = 20;
  var dragged = false;

  function logEvent(e) {
    var s = "EVENT";
    if (e.type)
      s += "  type=" + e.type;
    if (e.target) {
      s += "  target=(";
      if (e.target.nodeType == 3) // Webkit bug?
        s += e.target.parentNode;
      else
        s += e.target;
      s += ", " + e.target.id;
      s += ")";
    }
    if (e.which)
      s += "  which=" + e.which;
    if (e.button)
      s += "  button=" + e.button;
    console.log(s);
  }

  // check if "a" has an ancestor that satisfies "f"
  function hasAncestor(a, f) {
    var b = a;
    while (b) {
      if (f(b))
        return true;
      b = b.parentNode;
    }
    return false;
  }

  if (!DragFix.enable)
    DragFix.enable = function(divname) {
      if (eventsAdded)
        DragFix.disable();

      if (divname)
        div = document.getElementById(divname);
      else
        div = document;

      div.addEventListener("mousedown", DragFix.mouseDown, false);
      div.addEventListener("mouseup", DragFix.mouseUp, false);
      div.addEventListener("mousemove", DragFix.mouseMove, false);
      eventsAdded = true;
    }

  if (!DragFix.enableWorkaround)
    DragFix.enableWorkaround = function() {
      if (workaroundAdded)
        DragFix.disableWorkaround();

      document.addEventListener("mousedown", DragFix.mouseDownW, true);
      workaroundAdded = true;
    }

  if (!DragFix.disable)
    DragFix.disable = function() {
      if (!eventsAdded)
        return;

      div.removeEventListener("mousedown", DragFix.mouseDown, false);
      div.removeEventListener("mouseup", DragFix.mouseUp, false);
      div.removeEventListener("mousemove", DragFix.mouseMove, false);
      eventsAdded = false;
    }

  if (!DragFix.disableWorkaround)
    DragFix.disableWorkaround = function() {
      if (!workaroundAdded)
        return;

      document.removeEventListener("mousedown", DragFix.mouseDownW, true);
      workaroundAdded = false;
    }

  if (!DragFix.draggedReset)
    DragFix.draggedReset = function() {
      wasDragged = false;
    }

  if (!DragFix.dragged)
    DragFix.dragged = function() {
      return wasDragged;
    }

  if (!DragFix.mouseDown)
    DragFix.mouseDown = function(e) {
      wasDragged = false;
      if (e.button == 0)
        draggingStart = e;
    }

  if (!DragFix.mouseDownW)
    DragFix.mouseDownW = function(e) {
      if (!e)
        e = window.event;
      if (!e.target)
        return;

      // if (Const.logging) logEvent(e);

      var stopping = false;
      /* if ((e.target instanceof HTMLImageElement) && hasAncestor(e.target, function(element) {
        return (element.id == "sidebar_main" || element.id == "sidebar");
      }))
        stopping = true; */
      if (hasAncestor(e.target, function(element) {
        try {
          return (element.className.split(" ").contains("dragfix"));
        }
        catch(err) {
          return false;
        }
      }))
        stopping = true;
      if ((e.target instanceof HTMLInputElement) && (e.target.type == "button" || e.target.type == "image"))
        stopping = true;

      if (stopping) {
        // wEvent = e;
        e.stopPropagation();
        e.preventDefault();
      }
    }

  if (!DragFix.mouseUp)
    DragFix.mouseUp = function(e) {
      /*
      // if draggingStart is set, check if we need to trigger a click
      if (draggingStart && draggingStart.target) {
        var clickEvent = document.createEvent("MouseEvent");
        clickEvent.initEvent("click", true, true);
        draggingStart.target.dispatchEvent(clickEvent);
      }
      */

      draggingStart = false;
      dragging = false;
    }

  if (!DragFix.mouseMove)
    DragFix.mouseMove = function(e) {
      if (draggingStart) {
        // ignore mouse movement while dragging if dragging for less than DRAG_THRESHOLD
        if (Math.abs(draggingStart.clientY-e.clientY) < DRAG_THRESHOLD &&
            Math.abs(draggingStart.clientX-e.clientX) < DRAG_THRESHOLD) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        else {
          dragging = draggingStart;
          wasDragged = true;
          draggingStart = false;
        }
      }

      // if dragging and div is visible, scroll the div
      if (dragging && div.style.visibility !== 'hidden') {
        div.scrollTop += dragging.clientY-e.clientY;
        dragging = e;
        e.preventDefault();
        e.stopPropagation();
      }
    }

}());
