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
// 	<html><head>
// 	<script ... src="Logger.js" />
//		<!-- Put Logger before other script includes.
// 	<script ... src="other.js" />
// Usage:
// 	L = new Logger();
// 	...
// 	L.log("some message here...");
//




// Our Logger function has to be self-contained.
// So it is going to have its own drag drop code.
// This is a version of DragDropServer but it is
// not intended for general use.  We include it 
// here as part of the internals of Logger.
// Ok, it's not quite internal... :)

function LogDragDropServer() { 

	var self=this;
	var B = document.getElementsByTagName("BODY")[0];
	var mouseX,objX;
	var mouseY,objY;





	var obj=null;
	this.dragOn = function(e) {
		//if (obj) self.dragOff(e);
		if ( e.currentTarget==null ) {
			throw new Error("DragDropServer:Invalid event has been supplied to dragOn method.");
		}
		var F = e.currentTarget.findObj; 
		obj=( F ? F(e) : e.currentTarget );
		if (obj==null ) {
			throw new Error("DragDropServer:findObj failed to find object!");
		}
		mouseX=parseInt(e.clientX);
		mouseY=parseInt(e.clientY);
		objX = parseInt(obj.style.left+0);
		objY = parseInt(obj.style.top+0);
		document.addEventListener("mousemove",self.drag,false);
	}
	this.dragOff = function(e) {
		document.removeEventListener("mousemove",self.drag,false);
		obj=null;
	}
	this.drag = function(e) {
		obj.style.left = objX+e.clientX-mouseX+'px';
		obj.style.top = objY+e.clientY-mouseY+'px';
	}
	this.register = function(O,F) {
		// O = object to be dragged.
		//
		// F = function for finding the object to drag.
		// Sometimes, we don't want e.currentTarget, but
		// perhaps something relative to it like a parentNode.
		//
		// So, if we are given F, we will 'hang' it
		// on O, which is a type=1 xhtml element.
		// The dragOn function will always check for
		// this function (currently called 'findObj');
		// If not there, then it defaults to e.currentTarget.
		//
		if ( ! O.nodeType || O.nodeType!=1 ) {
			throw new Error("DragDropServer.register:Invalid element supplied.");
		}
		if ( F ) {
			if ( typeof(F)== "function" ) {
				O.findObj=F;
			} else { 
				throw new Error("DragDropServer.register:Invalid findObj function supplied.");
			}
		} 

		// Note! We have to set this
		// up after we have defined the
		// functions (methods): self.dragOn etc. 
		O.addEventListener("mousedown",self.dragOn,true);
		O.addEventListener("mouseup",self.dragOff,true);
	}
	document.addEventListener("click",self.dragOff,false);

}

var logger_zindex=0;
function Logger(T) {
	// T = title (appears on header.
	var title=T;

	var self=this;




	// FIXME: Getting the html body element can fail
	// when outside of the 'onload' event.  
	// Be careful about this.  We could put 
	// a timeout in or something?
	var B;
	try {
		B=document.getElementsByTagName("BODY")[0];
	} catch (e) {
		alert(e.message);
	}

	var n=0;
	while ( document.getElementById("Logger"+n) != null ) {
		n++
	}
	var ID = Logger+ID;



	var logFrame = document.createElement("div");
	var logHeader = document.createElement("div");
	var logBody = document.createElement("div");
	var logTable = document.createElement("table");
	var tbody = document.createElement("tbody");


	// The reason we hide the logBody is because it can
	// cause performance/cpu issues (as tested in 
	// Firefox).  Setting visibility doesn't fix the problem - 
	// only if we used display:none does performance 
	// improve.
	// FIXME: does display='none' => display=null exhibit
	// the same kind of behaviour in IE?
	// Note, I am forced to do it because setting other
	// values like 'block' does strange things (in 
	// Firefox) - that's why, I end up setting it 
	// *back* to NULL again.
	//
	logHeader.addEventListener("mousedown",function() { logBody.style.display="none" },false );
	logHeader.addEventListener("mouseup",function() { logBody.style.display=null },false );


	logFrame.style.left='200px';
	logFrame.style.top='0px';
	logFrame.style.width='250px';
	logFrame.style.visibility='visible';
	logFrame.style.position='absolute';
	logFrame.style.border='solid black 1px';
	logFrame.style.backgroundColor='white';

	logHeader.style.backgroundColor="black";
	logHeader.style.color="white";
	logHeader.style.fontFamily="Courier,monospace";
	logHeader.style.fontWeight="bold";
	logHeader.style.fontSize="9pt";
	logHeader.style.paddingBottom="1px";
	// Note where I set the id.
	// I guess it doesn't matter.
	// We could rewrite findObj
	// below.
	logHeader.setAttribute("id",ID);

	logBody.style.height='500px';
	logBody.style.overflow='scroll';



	logHeader.appendChild(document.createTextNode("log: "+title));
	logTable.appendChild(tbody);
	logBody.appendChild(logTable);
	logFrame.appendChild(logHeader);
	logFrame.appendChild(logBody);
	B.appendChild(logFrame);



	// This is the logging function.
	var logEntry=1;
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
		self.log("Hiding.")
	}


	// We define findObj and pass it to
	// the LogDragDropServer here so that
	// we can make use of Logger's log 
	// function (for debugging).
	// I thought that was kinda neat, but
	// it isn't useful now because there aren't
	// any bugs.
	var findObj = function (e) { 
		// FIXME: By using e.target
		// we assume that the DragDropServer
		// is going to set up an appropriate
		// listener (for mouse clicks).
		var o = e.target;
		while(o) {
			if ( o.getAttribute("id")==ID ) {
				return o.parentNode;
			}
			self.log("iterating...");
			o=o.parentNode;
		}
		self.log("Logger.findObj:Failed to find object.");
		return null;
	}
	var dragDropServer = new LogDragDropServer();
	dragDropServer.register(logHeader,findObj);

	return this;
}

