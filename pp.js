var $web17_com_au$ = $web17_com_au$ || {};

// Pretty print module for javascript

$web17_com_au$.pretty_print = function() {

    var module={};
    var NEWLINE = '\r\n';
    var rx={},rxg={};
    rx.newline = /\r?\n/;
    rxg.newline = /\r?\n/g;

    // Pretty print
    // 
    // - this function will get called recursively on
    //   nested array or object structures
    // - 'nested' parameter >0 means we are recursing; this will suppress
    //   printing to standard out
    // - pp.nested can be set to control recursion

    module.pp = function(obj,nested) {

        var i;
        var indent = '';
        var indent2 = '';  // what the hell is this?
        var str = '';

        if(nested>module.pp.nested) return '';
        if(!nested) nested = 0;
        if(module.pp.extended) {
            for(indent='  ',i=nested;i>0;i--) {
                indent+='  ';
                if(i>0) indent2+='  ';
            }
        }

        if(obj == undefined || obj == null) {
            if(obj==undefined) return 'undefined';
            if(obj==null) return 'null';
            if(nested==0 && obj==null) print(obj);
            // Don't bother printing undefineds.
            // These occur with rhino print() etc
        }

        switch(typeof(obj)) {

        case 'xml': // XML or XMLList (E4X)
            str = obj.toXMLString();
            str = str.replace(rxg.newline,'\\n').replace(/  */g,' ');
            if(!module.pp.extended)
                str = str.replace(rxg.newline,' ').replace(/  */g,' ');
            break;

        case 'object':

            // STRING
            if(obj instanceof String) {
                str = '"'+obj+'"';

                // JS ARRAY
            } else if(obj instanceof Array) {
                // Print as array literal
                str += '[';
                if(module.pp.extended) str += NEWLINE;
                obj.map(function(i){
                    if(obj[i]!==obj) {
                        str+=indent+(module.pp(i,nested+1)+', ');
                        if(module.pp.extended) str += NEWLINE;
                    } else {
                        str+=indent+' (self), ';
                        // a = [1,2,3]; a[1] = a; => madness ....
                        if(module.pp.extended) str += NEWLINE;
                    }
                }
                       );
                str += indent2+']';
                if(module.pp.extended) str += NEWLINE;

            } else if(!(obj instanceof Object)) {
                // JAVA CLASS/OBJECT (probably)

                // Suppose someone types: someObj['class'].
                // They want the java class of someObj but we'll
                // be giving them the class of this java class (which is Class).
                if(obj['class']===java.lang.Class){str=obj;}
                else str = obj['class']; //str = obj; // Alternative

            } else {
                // JAVASCRIPT OBJECT
                // Print as object literal
                str += '{';
                if(module.pp.extended) str += NEWLINE;
                for(var n in obj) {
                    if(obj!==obj[n]) {
                        // To prevent infinite recursion.
                        // !== is important; e4x Namespace and its uri
                        // property show that != fails.
                        str+=indent+
                            (n+': '+module.pp(obj[n],nested+1)
                             .replace(/\r?\n *$/,' ')+', ');
                        if(module.pp.extended) str += NEWLINE;
                    }
                    else {
                        str+=(indent+n+': (self), ');
                        if(module.pp.extended) str += NEWLINE;
                    }
                }
                str += indent2+'}';
                if(module.pp.extended) str += NEWLINE;
            }
            break;

        case 'string':
            str += ('"'+obj+'"');
            if(!module.pp.newlines) str = str.replace(rxg.newline,'\\n');
            break;

        case 'function':
            //str = obj.toString().replace(/^\n/,'').replace(/\n$/,'');

            // Reduce clutter by collapsing function bodies when
            // printing as parts of other objects...

            if(nested>0) str += 'f()';

            else {

                try {
                    if(module.pp.extended) str = obj.toString();
                    else str = obj.toString().replace(rxg.newline,'')
                        .replace(/  */g,' ');
                } catch(e) {
                    // I've forgotten why we catch an error here.
                    // Something to do with: referencing a java class
                    // rather than instance, and getting an error, even if we
                    // are just testing for existence of toString.
                    str = obj;
                }
            }
            break;

        default:
            str = obj;
            break;
        }

        // Cut long strings down...
        if(module.pp.truncate)
            switch(typeof(obj)) {
            case 'xml':
            case 'string':
            case 'function':
                try {
                    if(str.length>300)
                        str = str.substring(0,149)+'... ... ...'; //+
                    //str.substring(str.length-150,str.length);
                } catch(e) {
                    // We probably have java, eg java.lang.String is 'function'
                }
            }

        if(nested==0) print(str);
        return str+'';
    }

    // Don't pretty print beyond nested level.
    module.pp.nested = 2;
    // Truncate large xml, strings or function definitions
    module.pp.truncate = true;
    // Print nested items on new line (for javascript objects).
    module.pp.extended = false; // TODO

    return module;

}();
