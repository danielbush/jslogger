# JSLogger - a standalone logging facility for the browser

Logger is intended to be fairly basic, self-contained javascript object that
allows other programs/objects to print output onto it.
By being self-contained, Logger does not have to rely on any other javascript
libraries for its functionality.

## Usage

See `example.html` and `example-deferred.html` for examples.

"deferred" refers to the fact that you can instantiate the logger and
start logging before document.body is available.

Set up script tags:
      <script type="text/javascript" src="path/to/pretty_print.js" ></script>
      <script type="text/javascript" src="path/to/Logger.js" ></script>
Then:
      var Logger = $web17_com_au$.logger.Logger;
      var logger;
      logger = new Logger('some log');
Configure appearance of the logger:
      logger = new Logger('some log',
        {width:'400px',height:'92%',minimize:true,wrap:true}
      );
Logging is as simple as:
      logger.log('test');
Logger can take multiple arguments:
      logger.log('this is ','a test');
      // => 'this is a test'
Put your variables in an array and logger will pretty print them:
      var a = [1,2,3];
      var b = {a:1,b:2,c:'foo'};
      logger.log('a is ',[a],' and b is ',[b]);
Highlight entries:
      logger.alert('error!');  // white text on red
      logger.fail('fail!');    // red text on pink
      logger.pass('passed!');  // green text on green



Logger uses the packaging and namespacing standard specified in
README.modules.html.  The latest version can be found at:
<http://js.web17.com.au/specs/packaging-and-namespacing/index.xhtml> .

## Contact

dlb.id.au (AT) gmail.com

--
Daniel Bush

Mon Sep 27 12:47:13 EST 2010

