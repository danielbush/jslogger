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
      throw new Error('E2: '+ErrorMessages['E2']);
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
      throw new Error('E2: '+ErrorMessages['E2']);
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

  // Set ID according to how many loggers are on the
  // page already.

  var n=0;
  while ( document.getElementById("Logger"+n) ) n++;
  var ID = 'Logger'+n;

  // logFrame: the div containing logger.
  // logHeader: a bit like the title bar at the top.
  // logTable: log entries are rows in the table.

  var logFrame = document.createElement("div");
  var logHeader2 = document.createElement("div");
  var logHeader = document.createElement("div");
  var logBody = document.createElement("div");
  var logTable = document.createElement("table");
  var tbody = document.createElement("tbody");

  // Width of logger.
  var width='250px';

  logFrame.style.right='0px';
  logFrame.style.top='0px';
  logFrame.style.width=width;
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
  logHeader.style.cursor="move";

  logHeader2.style.backgroundColor="#333";
  logHeader2.style.color="white";
  logHeader2.style.fontSize="7pt";
  logHeader2.style.paddingBottom="1px";
  logHeader2.style.paddingRight="1em";
  logHeader2.style.cursor="pointer";
  logHeader2.style.textAlign="right";

  // Disable text selection when using logHeader as a drag
  // handle.

  logHeader.style.MozUserSelect="none";  // Firefox.
  logHeader.unselectable="on"; // IE ???

  var height='500px';
  logBody.style.height=height;

  // We must set the width of logBody in order
  // for the scroll setting to work.  Otherwise
  // ie6 will just expand logBody.
  logBody.style.width=width;
  logBody.style.overflow='scroll';

  logHeader.appendChild(document.createTextNode("log: "+title));
  logTable.appendChild(tbody);
  logBody.appendChild(logTable);
  logFrame.appendChild(logHeader);
  logFrame.appendChild(logHeader2);
  logFrame.appendChild(logBody);
  body.appendChild(logFrame);



  var logEntry=1;

  // Log messages.
  this.log = function(msg) {
    logFrame.style.zIndex=++logger_zindex; // Why do we do this?
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.style.fontFamily="Courier,monospace";
    td.style.fontSize="9pt";
    td.appendChild(document.createTextNode(logEntry+":\t"+msg));
    tr.appendChild(td);
    var trs = tbody.getElementsByTagName("tr");
    //tbody.appendChild(tr);
    tbody.insertBefore(tr,(trs.length>0?trs[0]:null));
    logEntry++;
  }

  // IE 7 and up generally handle position fixed.
  var agt=navigator.userAgent.toLowerCase();
  if ( agt.indexOf("msie 6.")==-1 && agt.indexOf("msie 5.")==-1 ) {
    logFrame.style.position='fixed';
    //me.log('Using fixed positioning.');
  } else {
    //me.log('Using absolute positioning.');
  }

  // Hide log body when dragging.
  // We override the element's style attribute 
  // for display to 'none'.
  // Hiding the body may give better performance.

  addEvent(logHeader,"mousedown",
    function() { 
      logBody.style.display="none"; 
      // Take us out of minimize mode.
      if(minimized) minimized=false;
    }
  );
  addEvent(logHeader,"mouseup",
    function() { 
      logBody.style.display=""; 
    }
  );

  // Some private helper functions.
  //
  // setWidth(): set width of logger; note the call
  //   to re-wrap text.
  // storePosition(): record our coordinates
  // restorePosition(): move us to storedPosition.

  var setWidth = function(w) {
    logFrame.style.width=w;
    logBody.style.width=w;
    me.repeatWrap();
  }
  var storedPosition; // Place to store position.
  var storePosition = function() {
    storedPosition={'top':logFrame.style.top,'right':logFrame.style.right}
  }
  var restorePosition = function() {
    if (storedPosition) {
      logFrame.style.right=storedPosition['right'];
      logFrame.style.top=storedPosition['top'];
    }
  }

  var buttonSpan;

  // Minimization
  //
  // minimize(): toggle hiding of logBody.
  //   When hiding, move logger to top corner of view port
  //   and record where we were.
  //   When unhiding, restore our position.

  var minimized=false;
  this.minimize = function() {
    if(minimized) {
      minimized=false;
      restorePosition();
      logBody.style.display="";
    }
    else {
      // Get out of expandedWidth mode.
      if(expandedWidth) me.expandWidth();
      // Record where we were.
      storePosition();
      logBody.style.display="none";
      logFrame.style.right='0px';
      logFrame.style.top='0px';
      minimized=true;
    }
  }
  buttonSpan = document.createElement('SPAN');
  buttonSpan.appendChild( document.createTextNode('minimize') );
  buttonSpan.style.marginRight='1em';
  logHeader2.appendChild(buttonSpan);
  addEvent(buttonSpan,'click',me.minimize);

  // Wrapping
  //
  // wrap(): toggle wrap or unwrap of lines in logTable.
  // repeatWrap() Re-apply the wrap or unwrap;
  //    (we pretend we're in the other state, and run wrap())
  // Don't wrap if we're minimized.

  this.wrap = function() {
    if(minimized) return;
    if(wrapped) {
      logTable.style.width='2000px';
    } else {
      if(expandedWidth) {
        logTable.style.width='90%';
      } else {
        // 20 is for the scroll bar on the right.
        logTable.style.width=parseInt(width)-20+'px';
      }
    }
    wrapped=!wrapped;
  }
  this.repeatWrap = function() {
    if(minimized) return;
    wrapped=!wrapped;
    me.wrap();
  }
  buttonSpan = document.createElement('SPAN');
  buttonSpan.appendChild( document.createTextNode('wrap') );
  buttonSpan.style.marginRight='1em';
  logHeader2.appendChild(buttonSpan);
  addEvent(buttonSpan,'click',me.wrap);
  var wrapped=true;
  this.wrap();


  // Width expansion
  //
  // expandWidth(): Toggle logger's width to 100% or 'width'.
  //   When expanding, move logger to the top right corner.
  //   When unexpanding, restore the position we were in.

  var expandedWidth=false;
  this.expandWidth = function() {
    if(minimized) return;  // Do nothing.
    if(expandedWidth) {
      expandedWidth=false;  // Must call before setWidth.
      setWidth(width);
      restorePosition();
    } else {
      storePosition();
      logFrame.style.right='0px';
      logFrame.style.top='0px';
      expandedWidth=true;
      setWidth('100%');
    }
  }
  buttonSpan = document.createElement('SPAN');
  buttonSpan.appendChild( document.createTextNode('width') );
  buttonSpan.style.marginRight='1em';
  logHeader2.appendChild(buttonSpan);
  addEvent(buttonSpan,'click',me.expandWidth);

  // Height expansion

  var expandedHeight = false;
  this.expandHeight = function() {
    if(minimized) return;
    me.log('offsetTop: '+logFrame.offsetTop);
  }
  buttonSpan = document.createElement('SPAN');
  buttonSpan.appendChild( document.createTextNode('height') );
  logHeader2.appendChild(buttonSpan);
  addEvent(buttonSpan,'click',me.expandHeight);

  buttonSpan=null;


  // DragServer (DS)
  //
  // Our Logger function has to be self-contained.
  // So it is going to have its own drag code.
  // This is a version of DragServer but it is
  // not intended for general use.  We include it 
  // here as part of the internals of Logger.
  //
  // We can only drag one thing at a time with our 
  // mouse. DS maintains an 'obj' variable which
  // represents the thing we are dragging at the time
  // we click down with the mouse.
  //
  // We register our draggable item and its drag handle
  // using the 'register' function.
  // The life cycle of each drag operation is handled
  // by dragOn, drag and dragOff respectively.
  //
  // Issues:
  // If we set up two event handlers using DS which both
  // catch the same event, things could get interesting.
  // Or: we register the same drag handle twice.
  // These things are not dealt with in this implementation
  // yet.
  // We could impose a locking mechanism which would 
  // prevent the dragOn method being called if DS is
  // already in use.
  // 
  
  function DragServer() { 
    var me=this;
    var body = document.getElementsByTagName("BODY")[0];
    var mouseX,objX;
    var mouseY,objY;

    // Draggable element.
    var obj=null;

    var dragOn = function(e,draggable) {
      obj=draggable;
      mouseX=parseInt(e.clientX);
      mouseY=parseInt(e.clientY);
      objX = parseInt(obj.style.right+0);
      objY = parseInt(obj.style.top+0);
      addEvent(document,"mousemove",drag);
    }
    var dragOff = function(e,draggable) {
      removeEvent(document,"mousemove",drag);
      obj=null;
    }
    var drag = function(e) {
      obj.style.right = objX-(e.clientX-mouseX)+'px';
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
      addEvent(dragHandle,"mousedown",
        function(e){dragOn(e,draggable);});
      addEvent(dragHandle,"mouseup",
        function(e){dragOff(e,draggable);});
    }

    // What is this for?
    //document.addEventListener("click",me.dragOff,false);
    //addEvent(document,"click",me.dragOff);
  }

  // Make logHeader a drag handle for dragging
  // the logFrame.

  var dragServer = new DragServer();
  dragServer.register(logFrame,logHeader);

  return this;
}

