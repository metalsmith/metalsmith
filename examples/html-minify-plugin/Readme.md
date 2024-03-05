
# html-minify plugin example

##Overview

In this sample you will learn how to create a simple metalsmith plugin that will minify your html files. 

##Install NPM

You should have npm and node installed. If you do not have these installed you can download and install Node.js via the installer from [here](https://nodejs.org/en/download/). Once the installer is completed you must update npm. Update npm by opening up your bash client and running the line below:

	$ npm install npm@latest -g

##Setting Up Your Project

Let's create a directory for this project and cd into it. Navigate to the folder where you usually place all your projects. In your favorite bash client make the projects directory, I'm going to name mine `html-minify-plugin-example`. 

	$ mkdir html-minify-plugin-example

Now that the directory is created, I'm going to open it up with

	$ cd html-minify-plugin-example

###Creating and Running your package.json file 

Once your in the projects directory, create a file called `package.json`. The `package.json` file will have information relative to your project and is necessary for npm to install different tools and modules that will help you while building your project. The contents of your `package.json` should look like this. 

	{
	"name": "html-minify-example",
	"version": "1.0.0",
	  "dependencies": {
	    "handlebars": "^4.0.5",
	    "metalsmith": "^2.1.0"
	  }
	}

Let's go through the fields in this file. 

1. The name field is the name of your project and is required.
2. The version number is the version number of your project and is required.
3. Dependencies are the dependencies the project will use

Now that we have created our package.json, file let's run it. If npm completes the installation with no errors you should see a new folder in the directory named `node-modules`, which will have all the dependencies we listed in the `package.json` file. 

	$ npm install

###Creating Our index.js file

Lets create a simple index.js file in our projects root directory. The file should look like this: 

	var Metalsmith  = require('metalsmith');

	Metalsmith(__dirname)
	  .metadata({
	    title: "My html-minify plugin example",
	    description: "It's about saying »Hello« to the World with minified html and plugins!",
	    generator: "Metalsmith",
	    url: "http://www.metalsmith.io/"
	  })
	  .source('./src')
	  .destination('./build')
	  .clean(false)
	  .build(function(err, files) {
	    if (err) { throw err; }
	  });

Now lets dissect this file, line-by-line. 

	var Metalsmith  = require('metalsmith');

At the top of our `index.js` we declare our variables for metalsmith as well as all the plugins we will be using in this file. Once we create our plugin we will add it to this list. Right now we only declare the Metalsmith variable to take advantage of metalsmiths native api and methods. 

	Metalsmith(__dirname)
	  .metadata({
	    title: "My HTML Minify Plugin Example",
	    description: "It's about saying »Hello« to the World with Plugins!.",
	    generator: "Metalsmith",
	    url: "http://www.metalsmith.io/"
	  })
	  .source('./src')
	  .destination('./build')
	  .clean(false)
	  .build(function(err, files) {
	    if (err) { throw err; }
	  });

Here is our metalsmith instance, where metalsmith declares its methods sequentially from metalsmiths native api as well as any methods from plugins we might be using. So line-by-line lets see what going on here. 

1. The `.metadata()` method is providing variables that can be used throughout your project. This is a good place to put general variables that will be used throughout the project. 
2. The `source()` method declares the directory where the files will be pre-manipulation. 
3. The `destination()` method declares the destination directory the files will end up post-manipulation.
4. The `clean()` method will delete the contents of the destination directory everytime metalsmith is run and the files are manipulated. 
5. the `build()` method is used to tell metalsmith to compile the project and manipulate the files. The callback function will return the files manipulated in the process as well as tell you of any errors during the compilation. 

###Creating Your Source and Destination Folders 

1. Create a folder named `src` in your project's base directory. 
2. Navigate to your projects `src` directory and create a file called `index.html`. 
3. Open up your `index.html`.
4. Copy the html block below into your file, then save and close it. 

		<!-- IF YOU SEE THIS THEN THE CUSTOM PLUGIN ISNT WORKING -->
		<p>Bacon ipsum dolor amet hamburger picanha beef cupim doner tenderloin bacon pancetta corned beef pork tail pig jowl capicola. Corned beef doner venison landjaeger filet mignon t-bone porchetta tenderloin sausage shoulder chuck sirloin ham hock. Jerky beef ribs kielbasa ground round pig chuck porchetta tri-tip biltong flank pastrami drumstick chicken tail. Pig flank leberkas, chuck ribeye kevin ball tip boudin beef ribs turducken. Spare ribs ground round pork, pork loin sausage pancetta ball tip andouille brisket strip steak sirloin bacon tri-tip.</p>

5. Copy the source code of this website and paste it into your `index.md` file. 
6. Save and close the file.
7. Now create a folder name `build` in your projects base directory. 

###Running the index.js file

1. In your bash client navigate to the projects root directory. 
2. Run `$ node index.js`
3. If there are no errors open up your `build` folder and look for the newly generated html file. 
4. Take note at the size of the generated HTML file. It looks to about 1.3MB.

###Creating our own html-minify plugin

1. In your projects base directory, create a folder called `custom_modules`
2. In the custom_modules directory, create a folder called `html-minify`. This folder will house the code that will make up your `html-minify` plugin. 
3. In your `html-minify` folder create a `package.json` file. It should look like this:
	
		{
		  "name": "sample-request-html-minify",
		  "version": "1.0.0",
		  "dependencies": {
		    "html-minifier": "^3.1.0"
		  }
		}

4. Now remember that name and version are required fields in a package.json. Let's add the npm package `html-minifier` under our dependencies field. 
5. Now in your favorite bash client navigate to the `html-minify` directory and run `$ npm install`. This will pull information from your package.json and install any dependencies needed to build the plugin. 
6. In the `html-minifer` directory create an `index.js` file. It should look like this:

		var minify = require('html-minifier').minify;
		var my_plugin = function (options) {
		    return function (files, metalsmith, done) {
		        Object.keys(files).forEach(function(file){
		            var contents = files[file].contents.toString();
		            var minified = minify(contents, options);
		            files[file].contents = new Buffer(minified, "utf8");
		        });
		        done();
		    };
		};
		// Expose the plugin
		module.exports = my_plugin;

7. Now lets go through this line-by-line.

		var minify = require('html-minifier').minify;

8. Here we declare our variables, creating a minify variable that initializes the minify method from our `html-minifier` plugin.

		var my_plugin = function (options) {
		    return function (files, metalsmith, done) {
		        Object.keys(files).forEach(function(file){
		        	//do something here
		        });
		        done();
		    };
		};
		// Expose the plugin
		module.exports = my_plugin;

9. This is the typical shell of a metalsmith plugin. What it does is retrieves all the files after being manipulated by the last plugin within your metalsmith project and passes them to you so that you can manipulate them. For more information about what's going on here take a look at (this tutorial)[https://github.com/metalsmith/awesome-metalsmith/blob/master/tutorials/js/plugins.md]

10. Let's explore the contents of the forEach method of our metalsmith plugin wrapper. 

		var contents = files[file].contents.toString();

11. The `files[file].contents` will return the contents of the files, but they are utf8 encoded, you must run the javascript toString() method in order to turn the contents of the file into a string. 

		var minified = minify(contents, options);

12. This line passes the string value of the `contents` to the `minify` method provided by our `html-minifier` plugin along with any other options that we want to provide and stores the results in the `minified` variable. 

		files[file].contents = new Buffer(minified, "utf8");

13. Here we take the newly minified contents of our file that were stores in the `minified` variable and utf8 encode it with the [Buffer() method](https://nodejs.org/api/buffer.html#buffer_new_buffer_string_encoding). We store this back in the `files[file].contents` in order to replace the original contents. 
14. That does it for creating our custom plugin. Now let's integrate it into the rest of our project. 

###Implementing our custom plugin in the index.js

1. Navigate to your projects base directory so we can make some changes to the `index.js` file. It should look like this after we are done:

		var Metalsmith  = require('metalsmith');
		var minify      = require('./custom_modules/html-minify');
		Metalsmith(__dirname)
		  .metadata({
		    title: "My Static Site & Blog",
		    description: "It's about saying »Hello« to the World.",
		    generator: "Metalsmith",
		    url: "http://www.metalsmith.io/"
		  })
		  .source('./src')
		  .use(minify({
		        removeComments  : true
		    }
		  ))
		  .destination('./build')
		  .clean(false)
		  .build(function(err, files) {
		    if (err) { throw err; }
		  });

2. Let's compare this to our original `index.js` file. We've added two new lines. 
		
		var minify      = require('./custom_modules/html-minify');

3. First we create our `minify` variable and reference our plugin in our `custom_modules` directory. 

		.use(minify({
			    removeComments  : true
			}
		))

4. Then we add our plugin to the metalsmith instance and wrap it in the `use` method. The `use` method is used whenever we want to work with a plugin in our metalsmith projects. We can pass the `minify()` any options that can be found in the documentation for the npm `html-minifier` package found [here](https://www.npmjs.com/package/html-minifier). In this example we will pass the `removeComments` option and set it to `true`. This will make sure all comments are removed from our generated html files. 

###Conclusion

That's it. We are done. We have set up a simple metalsmith project and created a custom plugin for our project based on a popular html-minifer npm package!









