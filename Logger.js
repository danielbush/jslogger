/* 
 * This file is part of Logger, a javascript-based logger.
 * Copyright (C) 2008 Daniel Bush
 * This program is distributed under the terms of the GNU
 * General Public License.  A copy of the license should be
 * enclosed with this project in the file LICENSE.  If not
 * see <http://www.gnu.org/licenses/>.
 *
 */
/**********************************************************************/
// Logger object
//
// A floating div that you can use
// to log events with.
//
// Setup:
//   <html><head>
//   <script ... src="Logger.js" />
//    <!-- Put Logger before other script includes.
//   <script ... src="other.js" />
// Usage:
//   L = new Logger();
//   ...
//   L.log("some message here...");
//
// NOTE:
// Logger instances require that the body-tag be
// already loaded by the browser.





function Logger(logTitle) {

  // Wrapper function to handle non-standard IE
  // DOM event handling.  We only handle the
  // bubbling phase of events here.
  // For obj.attachEvent:
  // The pointer 'this' apparently points
  // to the 'window' object - so beware.
  // See http://ejohn.org/projects/flexible-javascript-events/
  // (John Resig).
  // I'd like to do something like this:
  //   Object.prototype.addEvent = addEvent;
  // and remove 'obj' from addEvent and use 'this'
  // instead.  But doesn't work in IE6.

  function addEvent(obj,eventType,fn) {
    if( obj.addEventListener ) {
      obj.addEventListener(eventType,fn,false);
    }
    else if( obj.attachEvent ) {
      obj.attachEvent('on'+eventType , fn);
    }
    else {
      throw new Error('E2: '+ErrorMessages('E2'));
    }
  }
  function removeEvent(obj,eventType,fn) {
    if( obj.removeEventListener ) {
      obj.removeEventListener(eventType,fn,false);
    }
    else if( obj.detachEvent ) {
      obj.detachEvent('on'+eventType , fn);
    }
    else {
      throw new Error('E2: '+ErrorMessages('E2'));
    }
  }



  var ErrorMessages = {
    'E1': "Body-tag not loaded yet - can't set up Logger!" ,
    'E2': "Can't work out event handling interface."
  };
  

  var logger_zindex=0;
  var title=logTitle;

  var me=this;

  // Throw error and alert user if body-tag not loaded yet.
  var body;
  body=document.getElementsByTagName("BODY")[0];
  if (!body) {
    alert("E1: "+ErrorMessages['E1']);
    throw new Error("E1: "+ErrorMessages['E1']);
  }

  var n=0;
  while ( document.getElementById("Logger"+n) != null ) {
    n++
  }
  var ID = 'Logger'+n;



  var logFrame = document.createElement("div");
  var logHeader = document.createElement("div");
  var logBody = document.createElement("div");
  var logTable = document.createElement("table");
  var tbody = document.createElement("tbody");


  // Hide log body when dragging.
  // We override the element's style attribute to 'none'.
  // Hiding the body may give better performance.
  addEvent(logHeader,"mousedown",
    function() { logBody.style.display="none"; });
  addEvent(logHeader,"mouseup",
    function() { logBody.style.display=null; });


  logFrame.style.left='200px';
  logFrame.style.top='0px';
  logFrame.style.width='250px';
  logFrame.style.visibility='visible';
  logFrame.style.position='absolute';
  logFrame.style.border='solid black 1px';
  logFrame.style.backgroundColor='white';
  logFrame.setAttribute("id",ID);

  logHeader.style.backgroundColor="black";
  logHeader.style.color="white";
  logHeader.style.fontFamily="Courier,monospace";
  logHeader.style.fontWeight="bold";
  logHeader.style.fontSize="9pt";
  logHeader.style.paddingBottom="1px";

  logBody.style.height='500px';
  logBody.style.overflow='scroll';



  logHeader.appendChild(document.createTextNode("log: "+title));
  logTable.appendChild(tbody);
  logBody.appendChild(logTable);
  logFrame.appendChild(logHeader);
  logFrame.appendChild(logBody);
  body.appendChild(logFrame);



  var logEntry=1;

  // Log messages.
  this.log = function(msg) {
    logFrame.style.zIndex=++logger_zindex;
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.style.fontFamily="Courier,monospace";
    td.style.fontSize="9pt";
    td.appendChild(document.createTextNode(logEntry+":\t"+msg));
    tr.appendChild(td);
    var trs = tbody.getElementsByTagName("tr");
    //tbody.appendChild(tr);
    tbody.insertBefore(tr,trs[0]);
    logEntry++;
  }

  this.show = function() {
    logFrame.style.visibility='visible';
  }
  this.hide = function() {
    logFrame.style.visibility='hidden';
    me.log("Hiding.")
  }


  // We define findObj and pass it to
  // the LogDragDropServer here so that
  // we can make use of Logger's log 
  // function (for debugging).

  var findObj = function (e) { 
    return document.getElementById(ID);
  }

  // LogDragDropServer (LDDS)
  //
  // Our Logger function has to be self-contained.
  // So it is going to have its own drag drop code.
  // This is a version of DragDropServer but it is
  // not intended for general use.  We include it 
  // here as part of the internals of Logger.
  //
  // We can only drag one thing at a time with our 
  // mouse. LDDS maintains an 'obj' variable which
  // represents the thing we are dragging at the time
  // we click down with the mouse.
  //
  // We register our draggable item and its drag handle
  // using the 'register' function.
  // The life cycle of each drag operation is handled
  // by dragOn, drag and dragOff respectively.
  //
  // Issues:
  // If we set up two event handlers using LDDS which both
  // catch the same event, things could get interesting.
  // Or: we register the same drag handle twice.
  // These things are not dealt with in this implementation
  // yet.
  // 
  
  function LogDragDropServer() { 
    var me=this;
    var body = document.getElementsByTagName("BODY")[0];
    var mouseX,objX;
    var mouseY,objY;
    var obj=null;
    var dragOn = function(e,O1) {
      obj=O1;
      mouseX=parseInt(e.clientX);
      mouseY=parseInt(e.clientY);
      objX = parseInt(obj.style.left+0);
      objY = parseInt(obj.style.top+0);
      addEvent(document,"mousemove",drag);
    }
    var dragOff = function(e,O1) {
      removeEvent(document,"mousemove",drag);
      obj=null;
    }
    var drag = function(e) {
      obj.style.left = objX+e.clientX-mouseX+'px';
      obj.style.top = objY+e.clientY-mouseY+'px';
    }

    // Register a draggable item along with its drag handle.
    //
    // Draggable: a reference to the element we want to
    // drag.
    // DragHandle: a reference to the element which acts
    // as our drag handle.

    var registrations={};
    this.register = function(draggable,dragHandle) {
      addEvent(dragHandle,"mousedown",function(e){dragOn(e,draggable);});
      addEvent(dragHandle,"mouseup",function(e){dragOff(e,draggable);});
    }


    // What is this for?
    //document.addEventListener("click",me.dragOff,false);
    //addEvent(document,"click",me.dragOff);
  }
  var dragDropServer = new LogDragDropServer();
  dragDropServer.register(logFrame,logHeader);


  return this;
}

