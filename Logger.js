/* 
 * This file is part of Logger, a javascript-based logger.
 * Copyright (C) 2008-2010 Daniel Bush
 * This program is distributed under the terms of the GNU
 * General Public License.  A copy of the license should be
 * enclosed with this project in the file LICENSE.  If not
 * see <http://www.gnu.org/licenses/>.
 *
 */

var $web17_com_au$ = $web17_com_au$ || {};


$web17_com_au$.logger = function() {

  var pp_module = $web17_com_au$.pretty_print;
  var module={};

  // Only set pp if we have it...
  var pp = null;
  if(pp_module) pp = pp_module.pp;

  var ErrorMessages = {
    'E1': "Body-tag not loaded yet - can't set up Logger!" ,
    'E2': "Can't work out event handling interface."
  };

  var setProperty = function(obj,properties) {
      if(!properties) return;
      for(var i in properties) {
          if(properties.hasOwnProperty(i)) {
              obj[i] = properties[i];
          }
      }
  }

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
  //
  //   var Logger = $web17_com_au$.logger.Logger;
  //
  //   L = new Logger('title');
  //   ...
  //   L.log("some message here...");
  //
  // NOTE:
  // Logger instances require that the body-tag be
  // already loaded by the browser.

  module.Logger = function(logTitle,options) {

    var title=logTitle;

    var me=this;

    var READY = false;
      // Flag to indicate when logger can display itself.
      // This is currently defined as when document.body is available.

    var body = document.createDocumentFragment();
    var n=0,id;
    // logFrame: the div containing logger.
    // logHeader: title bar at the top.
    // logMenu: menu bar near top
    // logTable: log entries are rows in the table.
    var logFrame = document.createElement("div");
    var logMenu = document.createElement("div");
    var logHeader = document.createElement("div");
    var logBody = document.createElement("div");
    var logTable = document.createElement("table");
    var tbody = document.createElement("tbody");
    var width='250px';
    var store_width=width;  // used by expandWidth()
    var height='500px';
    var zindex=1000;
    var logCount=1;
    var agt=navigator.userAgent.toLowerCase();
    var storedPosition; // Place to store position.
    var buttonSpan,minimizeButton;
    var minimized=false; // Put us in unminimized mode.
    var wrapped=false;   // Put us in wrapped mode.
    var expandedWidth=false;  // Width is not expanded to fit screen.
    var dragServer = new DragServer();


    var ready_or_fail = function() {
      //body=document.getElementsByTagName("body")[0];
        // We need to use lowercase for getElementsByTagName when
        // dealing with xml (xhtml etc).  I can't check if this
        // applies to IE at the moment so I will use document.body
        // which will work regardless.
      body=document.body;
      if (!body) {
        alert("E1: "+ErrorMessages['E1']);
        throw new Error("E1: "+ErrorMessages['E1']);
      }
    }

    var ready_or_wait = function() {
        var id;
        var tries=0;
        var interval=100; //ms
        var fail_after=10000; //ms
        var check_body = function() {
            me.log('checking for body...');
            if(document.body) {
                document.body.appendChild(body);
                body = document.body;
                READY=true;
                window.clearInterval(id);
            }
            if(interval*tries>fail_after) {
                window.clearInterval(id);
            }
            tries++;
        }
        id = window.setInterval(check_body,interval);
    }

    // init()
    // Called at the end - see below.

    function init() {

      // Throw error and alert user if body-tag not loaded yet.
      // Replaced by ready_or_wait.
      //ready_or_fail();

      // Keep checking if document.body is available.
      // If it is, append document fragment in 'body'
      // to document.body and update 'body'.

      ready_or_wait();

      // Set ID according to how many loggers are on the
      // page already.

      while ( document.getElementById("Logger"+n) ) n++;
      ID = 'Logger'+n;

      setProperty(logFrame.style,{
          color:'black', right:'0px', top:'0px',
          visibility:'visible',
          position:'absolute',
          backgroundColor:'white',
      });
      logFrame.setAttribute("id",ID);

      setProperty(logHeader.style,{
          backgroundColor:"black",
          color:"white", fontFamily:"sans-serif",
          fontWeight:"bold", fontSize:"9pt",
          cursor:"move",
          paddingBottom:"1px",
          paddingLeft:"0.5em",
      });

      setProperty(logMenu.style,{
          backgroundColor:"#333", color:"white",
          fontFamily:"sans-serif",
          fontSize:"7pt",
          paddingBottom:"1px", paddingRight:"1em",
          cursor:"pointer",
          textAlign:"right",
      });

      logBody.style.border='solid black 1px';

      makeUnselectable(logHeader);
      makeUnselectable(logMenu);

      // Width, height, zindex
      //
      // We must set the width of logBody in order
      // for the scroll setting to work.  Otherwise
      // ie6 will just expand logBody.

      logFrame.style.width=width;
      logFrame.style.height=height;
      logFrame.style.zIndex=zindex;

      logBody.style.width=width;
      logBody.style.overflow='scroll';
      logBody.style.height='100%';

      tbody.style.fontFamily="Courier,monospace";
      tbody.style.fontSize="9pt";

      // Assemble Logger's html...

      logHeader.appendChild(document.createTextNode("log: "+title));
      logTable.appendChild(tbody);
      logBody.appendChild(logTable);
      logFrame.appendChild(logHeader);
      logFrame.appendChild(logMenu);
      logFrame.appendChild(logBody);
      body.appendChild(logFrame);

      // IE 7 and up generally handle position fixed.

      if ( agt.indexOf("msie 6.")==-1 && agt.indexOf("msie 5.")==-1 ) {
        logFrame.style.position='fixed';
        //me.log('Using fixed positioning.');
      } else {
        //me.log('Using absolute positioning.');
      }

      // Minimization

      minimizeButton = document.createElement('SPAN');
      minimizeButton.appendChild( document.createTextNode(' minimize ') );
      minimizeButton.style.marginRight='0.2em';
      makeUnselectable(minimizeButton);
      logMenu.appendChild(minimizeButton);
      module.addEvent(minimizeButton,'click',me.minimize);

      // Wrapping

      buttonSpan = document.createElement('SPAN');
      buttonSpan.appendChild( document.createTextNode(' wrap ') );
      buttonSpan.style.marginRight='0.2em';
      makeUnselectable(buttonSpan);
      logMenu.appendChild(buttonSpan);
      module.addEvent(buttonSpan,'click',me.wrap);
      me.wrap();

      // Width expansion

      buttonSpan = document.createElement('SPAN');
      buttonSpan.appendChild( document.createTextNode(' 100% ') );
      buttonSpan.style.marginRight='0.2em';
      makeUnselectable(buttonSpan);
      logMenu.appendChild(buttonSpan);
      module.addEvent(buttonSpan,'click',me.expandWidth);

      buttonSpan = document.createElement('SPAN');
      buttonSpan.appendChild( document.createTextNode(' < ') );
      buttonSpan.style.marginRight='0.2em';
      makeUnselectable(buttonSpan);
      logMenu.appendChild(buttonSpan);
      module.addEvent(buttonSpan,'click',me.increaseWidth);
      buttonSpan = document.createElement('SPAN');
      buttonSpan.appendChild( document.createTextNode(' > ') );
      buttonSpan.style.marginRight='0.2em';
      logMenu.appendChild(buttonSpan);
      module.addEvent(buttonSpan,'click',me.decreaseWidth);

      // Height expansion

      buttonSpan = document.createElement('SPAN');
      buttonSpan.appendChild( document.createTextNode(' \\/ ') );
      buttonSpan.style.marginRight='0.2em';
      makeUnselectable(buttonSpan);
      logMenu.appendChild(buttonSpan);
      module.addEvent(buttonSpan,'click',me.increaseHeight);
      buttonSpan = document.createElement('SPAN');
      buttonSpan.appendChild( document.createTextNode(' /\\ ') );
      buttonSpan.style.marginRight='0.2em';
      makeUnselectable(buttonSpan);
      logMenu.appendChild(buttonSpan);
      module.addEvent(buttonSpan,'click',me.decreaseHeight);

      // Snapping

      buttonSpan = document.createElement('SPAN');
      buttonSpan.appendChild( document.createTextNode(' snap ') );
      buttonSpan.style.marginRight='0.2em';
      makeUnselectable(buttonSpan);
      logMenu.appendChild(buttonSpan);
      module.addEvent(buttonSpan,'click',me.snap);

      buttonSpan=null;

      // Make logHeader a drag handle for dragging
      // the logFrame.

      dragServer.register(logFrame,logHeader,me.isDraggable);

      // Hide log body when dragging.
      // 
      // We override the element's style attribute 
      // for display to 'none'.
      // Hiding the body may give better performance.

      module.addEvent(logHeader,"mousedown",
        function() { 
          if(!me.isDraggable()) return;
          if(!minimized) me.minimize();
        }
      );
      module.addEvent(logHeader,"mouseup",
        function() { 
          if(!me.isDraggable()) return;
          if(minimized) me.minimize();
        }
      );

      // Process any options passed in by user.

      processOptions(options);

    } // Init()

    // Process options passed into Logger at
    // instantiation time.
    //
    // Should be run at the end of init().

    function processOptions(options) {
      if(!options) return;
      options.minimized && me.minimize();
      options.width && me.setWidth(options.width);
      options.height && me.setHeight(options.height);
      options.wrap && me.wrap();
    }

    // Disable text selection when using logHeader as a drag
    // handle.
    // 
    // Also see http://stackoverflow.com/questions/826782/css-rule-to-disable-text-selection-highlighting

    var makeUnselectable = function(el) {
      el.style.WebkitUserSelect="none";  // Chrome/safari.
      el.style.MozUserSelect="none";  // Firefox.
      el.unselectable="on"; // IE ???
    }

    // Create a log entry

    var makeLogEntry = function(node,styles) {
      var tr = document.createElement("tr");
      var td0 = document.createElement("td");
      var td = document.createElement("td");
      td0.appendChild(document.createTextNode(logCount+': '));
      setProperty(td0.style,{width:'1%',color:'#666'});
      setProperty(td.style,styles);
      td.appendChild(node);
      tr.appendChild(td0);
      tr.appendChild(td);
      var trs = tbody.getElementsByTagName("tr");
      //tbody.appendChild(tr);
      tbody.insertBefore(tr,(trs.length>0?trs[0]:null));
      logCount++;
    }

    // Concatentate and maybe process args passed to log()
    // and functions of that ilk.  Return resulting string
    // which will then get logged.

    var parseLogArgs = function() {
        var msg='';
        for(var i=0;i<arguments.length;i++) {
            if(arguments[i] instanceof Array) {
                if(pp) {
                    for(var j=0;j<arguments[i].length;j++) {
                        if(j!=0) msg+=',';
                        msg+=pp(arguments[i][j]);
                    }
                } else msg+=arguments[i];
            } else msg+=arguments[i];
        }
        return msg;
    }

    me.makeLogFunction = function(name,options) {
        return me[name] = function() {
            var span = document.createElement('SPAN');
            span.appendChild(document.createTextNode(
                parseLogArgs.apply(me,arguments)
            ));
            makeLogEntry(
                span,
                options);
        };
    }

    // Basic logging
    me.makeLogFunction( 'log' );

    // Create strident log entry!
    me.makeLogFunction(
        'alert',
        {backgroundColor:'red',color:'white',fontWeight:'bold',});
    // Create angry, glowing log entry.
    me.makeLogFunction(
        'red',
        {backgroundColor:'#fee',color:'red',fontWeight:'bold',});
    // Create happy, green, contented log entry.
    me.makeLogFunction(
        'green',
        {backgroundColor:'#afa',color:'green',fontWeight:'bold',});
    me.makeLogFunction(
        'blue',
        {backgroundColor:'#eef',color:'blue',fontWeight:'bold',});
    me.makeLogFunction(
        'yellow',
        {backgroundColor:'#ff8',color:'black',fontWeight:'bold',});
        
    me.divider = function() {
      makeLogEntry(document.createElement('HR'));
    }

    // setWidth(): set width of logger; note the call
    //   to re-wrap text.

    me.setWidth = function(w) {
      logFrame.style.width=w;
      logBody.style.width=w;
      width=w;
      me.repeatWrap();
    }

    me.setHeight = function(h) {
      logFrame.style.height=h;
      logBody.style.height='100%';
      height=h;
    }

    // storePosition(): record our coordinates

    var storePosition = function() {
      storedPosition={
        'top':logFrame.style.top,
        'right':logFrame.style.right
      }
    }

    // restorePosition(): move us to storedPosition.

    var restorePosition = function() {
      if (storedPosition) {
        logFrame.style.right=storedPosition['right'];
        logFrame.style.top=storedPosition['top'];
      }
    }


    // Minimization
    //
    // minimize(): toggle hiding of logBody.

    me.minimize = function() {
      if(minimized) {
        minimized=false;
        minimizeButton.innerHTML = ' minimize ';
        logBody.style.display="";
      }
      else {
        logBody.style.display="none";
        minimizeButton.innerHTML = ' maximize ';
        minimized=true;
      }
    }

    // Wrapping
    //
    // wrap(): toggle wrap or unwrap of lines in logTable.
    // repeatWrap() Re-apply the wrap or unwrap;
    //    (we pretend we're in the other state, and run wrap())

    me.wrap = function() {
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

    me.repeatWrap = function() {
      wrapped=!wrapped;
      me.wrap();
    }


    // Width expansion
    //
    // expandWidth(): Toggle logger's width to 100% or 'width'.
    //   When expanding, move logger to the top right corner.
    //   When unexpanding, restore the position we were in.

    me.expandWidth = function() {
      if(expandedWidth) {
        expandedWidth=false;  // Must call before setWidth.
        me.setWidth(store_width);
        restorePosition();
      } else {
        storePosition();
        logFrame.style.right='0px';
        logFrame.style.top='0px';
        expandedWidth=true;
        store_width = width;
        me.setWidth('100%');
      }
    }
    me.increaseWidth = function() {
      if(expandedWidth) return;
      width=parseInt(width)+20+'px';
      me.setWidth(width);
    }
    me.decreaseWidth = function() {
      if(expandedWidth) return;
      if (parseInt(width)>20) width=parseInt(width)-20+'px';
      me.setWidth(width);
    }

    // Height expansion

    me.increaseHeight = function() {
      height=parseInt(height)+30+'px';
      me.setHeight(height);
    }
    me.decreaseHeight = function() {
      if (parseInt(height)>30) height=parseInt(height)-30+'px';
      me.setHeight(height);
    }


    // Snap
    //
    // Snap logger to top right corner of screen.

    me.snap = function() {
      logFrame.style.right='0px';
      logFrame.style.top='0px';
      storePosition();
    }

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

    me.isDraggable = function() {
      if(expandedWidth) return false;
      return true;
    }

    function DragServer() { 
      var me=this;

      //var body = document.getElementsByTagName("body")[0];
        // See not above regarding this invocation.
      var body = document.body;

      var mouseX,objX;
      var mouseY,objY;

      // Draggable element.
      var obj=null;

      var dragOn = function(e,draggable,canDrag) {
        if(!canDrag()) return;
        obj=draggable;
        mouseX=parseInt(e.clientX);
        mouseY=parseInt(e.clientY);
        objX = parseInt(obj.style.right+0);
        objY = parseInt(obj.style.top+0);
        module.addEvent(document,"mousemove",drag);
      }
      var dragOff = function(e,draggable,canDrag) {
        if(!canDrag()) return;
        module.removeEvent(document,"mousemove",drag);
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
      // canDrag(): is a function that determines whether
      // we proceed with the dragging operation.  Should return
      // true or false.
      //

      var registrations={};
      me.register = function(draggable,dragHandle,canDrag) {
        module.addEvent(dragHandle,"mousedown",
          function(e){dragOn(e,draggable,canDrag);});
        module.addEvent(dragHandle,"mouseup",
          function(e){dragOff(e,draggable,canDrag);});
      }
    }

    init();

    return me;

  } // Logger

  // Add / remove event handlers.
  //
  // 1) Handle non-standard IE DOM event handling.  
  // 2) We only handle the bubbling phase of events here.
  // 3) For obj.attachEvent:
  // The pointer 'this' apparently points
  // to the 'window' object - so beware.
  // See http://ejohn.org/projects/flexible-javascript-events/
  // (John Resig).
  // I'd like to do something like this:
  //   Object.prototype.addEvent = addEvent;
  // and remove 'obj' from addEvent and use 'this'
  // instead.  But doesn't work in IE6.

  module.addEvent = function(obj,eventType,fn) {
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

  module.removeEvent = function(obj,eventType,fn) {
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

  return module;

}();
