# JSLogger - a standalone logging facility for the browser

Logger is intended to be fairly basic, self-contained javascript object that
allows other programs/objects to print output onto it.
By being self-contained, Logger does not have to rely on any other javascript
libraries for its functionality.

## Usage

See `example.html` for examples.

### No waiting

You can instantiate the logger and
start logging before `document.body` is available.

Set up script tags:
      <script type="text/javascript" src="path/to/pretty_print.js" ></script>
      <script type="text/javascript" src="path/to/Logger.js" ></script>
Then:
      var Logger = $web17_com_au$.logger.Logger;
      var logger,frame;
      frame = new Logger('some log');
      logger = frame.logger;

This creates a frame for displaying a log and a log called 'some log'.

When you create a frame, it will use `position:fixed` and
sit at `right:0px;top:0px`, ie the top right corner.

Configure appearance of the frame:
      frame = new Logger('some log',
        {width:'400px',height:'92%',minimize:true,wrap:true}
      );
Logging is as simple as:
      logger.log('test');
Logger can take multiple arguments:
      logger.log('this is ','a test');
      // => 'this is a test'

### Multiple logs

Frame can store multiple log instances and will display available
log instances as entries in one of its toolbars.

When you instantiate using `new Logger(name)` a default instance
of a `Log` object is created with `name` and stored in `frame`.

`frame.logs` is a javascript object with keys set to the names
of the logs and values to the instances of the appropriate `Log`.

Hence `frame.logs[name].log(message)` is one way to log.

You can add a log like this
      var logger2 = frame.add(name);

You can get the frame to change the log it is displaying by doing
      frame.change(name);
You can also click on `name` as displayed in the `frame`'s toolbar.

### Pretty print variables

Put your variables in an array and logger will pretty print them:
      var a = [1,2,3];
      var b = {a:1,b:2,c:'foo'};
      logger.log('a is ',[a],' and b is ',[b]);
      logger.log('a,b are ',[a,b]);

### Extended pretty printing

In extended pretty printing, newlines and indenting will be respected.
This can make reading large objects easier.
Extended pretty printing can be toggled by clicking on the log entry.
The pretty printing function (`pp`) in the `pretty_print` module needs
to have `pp.extended` set to `true` which it is by default.

### Highlight entries:

      logger.alert('error!');  // white text on red
      logger.red('fail!');    // red text on pink
      logger.green('passed!');  // green text on green
      logger.blue('relax!'); 
      logger.yellow('happy!');

You can create your own highlight logging functions:
      logger.makeLogFunction(
        'foo',
        {backgroundColor:'blue',color:'white',fontWeight:'bold'});

### Dividers

      logger.divider()
will create an hr tag as an entry.

## Debugging execution with logger using "labels"

One way to selectively log execution is to use labels.
Just add a property to the instance of `logger` (obviously
nothing that clashes with the core `logger` functions).  Simple
labels like `A`, `B` etc will do:
      logger.A = true;
      doSomethingComplicated();
      logger.A = false;
In `doSomethingComplicated` and functions you can add lines like:
      logger.A && logger.log('log something');

This can be useful when are logging execution on something
that you are testing.  You may only want to analyze a particular
assertion and the resulting execution of a piece of code
but your tests and surrounding assertions may execute the same bit of code
many many times.

Logger uses the packaging and namespacing standard specified in
README.modules.html.  The latest version can be found at:
<http://js.web17.com.au/specs/packaging-and-namespacing/index.xhtml> .

## Contact

dlb.id.au (AT) gmail.com

--
Daniel Bush

Fri Oct  1 12:07:26 EST 2010
