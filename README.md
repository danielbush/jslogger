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
      var logger;
      logger = new Logger('some log');

When you create a logger, it will use `position:fixed` and
sit at `right:0px;top:0px`, ie the top right corner.

Configure appearance of the logger:
      logger = new Logger('some log',
        {width:'400px',height:'92%',minimize:true,wrap:true}
      );
Logging is as simple as:
      logger.log('test');
Logger can take multiple arguments:
      logger.log('this is ','a test');
      // => 'this is a test'

### Pretty print variables

Put your variables in an array and logger will pretty print them:
      var a = [1,2,3];
      var b = {a:1,b:2,c:'foo'};
      logger.log('a is ',[a],' and b is ',[b]);
      logger.log('a,b are ',[a,b]);

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

## Debugging execution with logger using "labels"

One way to selectively log execution is to use labels.
      logger.A = true;
      doSomethingComplicated();
      logger.A = false;
In `doSomethingComplicated` and functions it calls:
      logger.A && logger.log('log something');

This can be useful when are logging execution on something
that you are testing.  You may only want to analyze it over
one execution but your tests may execute the same bit of code
many many times.

Logger uses the packaging and namespacing standard specified in
README.modules.html.  The latest version can be found at:
<http://js.web17.com.au/specs/packaging-and-namespacing/index.xhtml> .

## Contact

dlb.id.au (AT) gmail.com

--
Daniel Bush

Fri Oct  1 12:07:26 EST 2010
