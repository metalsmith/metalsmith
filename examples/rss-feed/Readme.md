
# RSS Feed Example

This example uses Metalsmith to create a static site and implements an rss feed of all your posts using the metalsmith-feed and metalsmith-collections plugins. 

## Install Node and Update NPM 

You should have npm and node installed. If you do not have these installed you can download and install Node.js via the installer from [here](https://nodejs.org/en/download/). Once the installer is completed you must update npm. Update npm by opening up your bash client and running the line below:

	$ npm install npm@latest -g

##Setting Up Your Project

Let's create a directory for this project and cd into it. Navigate to the folder where you usually place all your projects. In your favorite bash client make the projects directory, I'm going to name mine `rss-feed-example`. 

	$ mkdir rss-feed-example

Now that the directory is created, I'm going to open it up with

	$ cd rss-feed-example

##Creating and Running your package.json file 

Once your in the projects directory, create a file called `package.json`. The `package.json` file will have information relative to your project and is necessary for npm to install different tools and modules that will help you while building your project. The contents of your `package.json` should look like this. 

	{
		"name": "rss-feed-example",
		"version": "1.0.0",
		"dependencies": {
			"handlebars": "^4.0.5",
			"metalsmith": "^2.1.0",
			"metalsmith-layouts": "^1.4.1",
			"metalsmith-markdown": "^0.2.1",
			"metalsmith-permalinks": "^0.5.0",
			"metalsmith-collections": "^0.7.0",
			"metalsmith-feed": "^0.2.0"	
		}
	}

Let's go through the fields in this file. 

1. The name field is the name of your project and is required.
2. The version number is the version number of your project and is required.
3. Dependencies are the dependencies the project will use.
4. handlebars will enable handlebars templating to be used in our project. 
5. metalsmith allows metalsmith to be used in our project 
6. metalsmith-layouts helps us generate templates in conjunction with handlebars. 
7. metalsmith-markdown enables markdown files to be compiled into html files.
8. metalsmith-permalinks will prettify our urls and nest our subdirectories to make them more managable. 
9. metalsmith-collection helps us group different files and iterate over these files in other places in our project.
10. metalsmit-feed will generate the rss feed for us based on our metalsmith-collection plugin options.

Now that we have created our package.json, file let's run it. If npm completes the installation with no errors you should see a new folder in the directory named `node-modules`, which will have all the dependencies we listed in the `package.json` file. 

	$ npm install

##Creating Our index.js file

Lets create a simple index.js file in our projects root directory. The file should look like this: 

	var Metalsmith  = require('metalsmith');
	var markdown    = require('metalsmith-markdown');
	var layouts     = require('metalsmith-layouts');
	var permalinks  = require('metalsmith-permalinks');
	var collections = require('metalsmith-collections');
	var feed        = require('metalsmith-feed');


	Metalsmith(__dirname)
	  .metadata({
	    title: "RSS Feed Example",
	    description: "It's about saying »Hello« to the World and letting the world keep up with your blog via RSS feed.",
	    generator: "Metalsmith",
	    url: "http://www.metalsmith.io/",
	    site:{
	      title: "RSS Feed Example",
	      url: "http://www.metalsmith.io/",
	      author: "George RR Martin"
	    }
	  })
	  .source('./src')
	  .destination('./build')
	  .clean(false)
	  .use(collections({
	    posts: {
	        pattern: 'posts/*.md'
	    }
	  }))
	  .use(feed({
	    collection: 'posts'
	  }))
	  .use(markdown())
	  .use(permalinks())
	  .use(layouts({
	    engine: 'handlebars'
	  }))
	  .build(function(err, files) {
	    if (err) { throw err; }
	  });

Now lets dissect this file, line-by-line. 

	var Metalsmith  = require('metalsmith');
	var markdown    = require('metalsmith-markdown');
	var layouts     = require('metalsmith-layouts');
	var permalinks  = require('metalsmith-permalinks');
	var collections = require('metalsmith-collections');
	var feed        = require('metalsmith-feed');

At the top of our `index.js` we declare our variables for metalsmith as well as all the plugins we will be using in this file. You should notice that all these variables are plugins that we declared in our package.json.

	Metalsmith(__dirname)
	  .metadata({
	    title: "RSS Feed Example",
	    description: "It's about saying »Hello« to the World and letting the world keep up with your blog via RSS feed.",
	    generator: "Metalsmith",
	    url: "http://www.metalsmith.io/",
	    site:{
	      title: "RSS Feed Example",
	      url: "http://www.metalsmith.io/",
	      author: "George RR Martin"
	    }
	  })
	  .source('./src')
	  .destination('./build')
	  .clean(false)
	  .use(collections({
	    posts: {
	        pattern: 'posts/*.md'
	    }
	  }))
	  .use(feed({
	    collection: 'posts'
	  }))
	  .use(markdown())
	  .use(permalinks())
	  .use(layouts({
	    engine: 'handlebars'
	  }))
	  .build(function(err, files) {
	    if (err) { throw err; }
	  });

Here is our metalsmith instance, where metalsmith declares its methods sequentially from metalsmiths native api as well as any methods from plugins we might be using. So line-by-line lets see what going on here. 

1. The `.metadata()` method is providing variables that can be used throughout your project. This is a good place to put general variables that will be used throughout the project. In this particular instance we use the title field to declare our ebook title which is a required variable in our custom ebook plugin we will be building later on in this tutorial. Make sure to add the title now. In this project we needed to add the site object to our metadata method as its required by our `metalsmith-feed` plugin.

		site:{
	      title: "RSS Feed Example",
	      url: "http://www.metalsmith.io/",
	      author: "George RR Martin"
	    }

2. The `source()` method declares the directory where the files will be pre-manipulation. 
3. The `destination()` method declares the destination directory the files will end up post-manipulation.
4. The `clean()` method will delete the contents of the destination directory everytime metalsmith is run and the files are manipulated. 
5. The `use()` method wraps instances of plugins we will use in our project. 
6. The `collections()` method groups all our files from the `./posts` folder with the `.md` extension. We can now iterate through this object in our template files if we want to list all our chapters or chapters of a certain category. You can checkout this plugins docs [here](https://github.com/segmentio/metalsmith-collections).
7. The `feed()` method grabs all the files in the `posts` collection and generates an RSS feed based on the data contained in these files. The `feeds()` method relies on the `collections()` metho and should be input into the Metalsmith instance in this order to make sure the plugins work properly.
7. The `markdown()` enables the markdown syntax for editing pre-compilation. 
8. The `permalinks()` method nests our files in subdirectories. 
9. The `layouts()` enables handlebars as the templating engine. 
10. The `ebook()` plugin generates pdf, epub, and mobi files based on the html files in our project. 
11. The `build()` method will finally build the project using the plugins and options we've provided and spit out any errors if they occur. You can also add code to this block if maybe you want it to notify you that the build was successful. 

##Understanding the projects `./src` directory 

1. As designated in our `source()` method in our `index.js` file, everything in the `./src` directory will be compiled by metalsmith. After the compilation is complete all the compiled files will end up in our `./build` folder as designated in our `destination()` method in our `index.js` file. 
2. If we take a look in our `./src` file we see a folder called `/posts` with various markdown files in it. All of these markdown files will be converted into html files and sent to your `/build` folder. We also designate all `.md` files in this directory to become a collection named 'posts' as designated in our `collection()` method in our `index.js` file. This is important because our `feed()` method will use this collection to generate an RSS feed based on this collection. 

##Running our index.js file

1. Once we are back in our projects root directory open up your favorite bash client and run: 

		$ node index.js

2. If there are no errors the book should have been compiled.
3. Open up your projects `./build` folder. Along with an `index.html` and a `/posts` directory, there should be an `rss.xml` file. Your RSS feed is complete! 
4. For more options when using the `metalsmith-feed` plugin visit the plugins docs site [here](https://github.com/hurrymaplelad/metalsmith-feed).