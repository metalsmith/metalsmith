# Creating an Ebook Generator with Metalsmith

In this example we will learn how to create a simple Metalsmith project and custom plugin that will generate an html, pdf, epub, and mobi file for and entire ebook as well as each individual chapter. First Metalsmith will generate html files based on our markdown files, then those files will be used to create an ebook in pdf, epub, and mobi format based on the html files. Our custom plugin will use three different node plugins to generate the three seperate ebook formats. I will try to assume that the reader has no experience with node, npm, nor metalsmith. 

## Install Node and Update NPM 

You should have npm and node installed. If you do not have these installed you can download and install Node.js via the installer from [here](https://nodejs.org/en/download/). Once the installer is completed you must update npm. Update npm by opening up your bash client and running the line below:

	$ npm install npm@latest -g

##Setting Up Your Project

Let's create a directory for this project and cd into it. Navigate to the folder where you usually place all your projects. In your favorite bash client make the projects directory, I'm going to name mine `ebook-example`. 

	$ mkdir ebook-example

Now that the directory is created, I'm going to open it up with

	$ cd ebook-example

##Creating and Running your package.json file 

Once your in the projects directory, create a file called `package.json`. The `package.json` file will have information relative to your project and is necessary for npm to install different tools and modules that will help you while building your project. The contents of your `package.json` should look like this. 

	{
		"name": "ebook-example",
		"version": "1.0.0",
		"dependencies": {
			"handlebars": "^4.0.5",
			"metalsmith": "^2.1.0",
			"metalsmith-layouts": "^1.4.1",
			"metalsmith-markdown": "^0.2.1",
			"metalsmith-permalinks": "^0.5.0",
			"metalsmith-collections": "^0.7.0"
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

Now that we have created our package.json, file let's run it. If npm completes the installation with no errors you should see a new folder in the directory named `node-modules`, which will have all the dependencies we listed in the `package.json` file. 

	$ npm install

##Creating Our index.js file

Lets create a simple index.js file in our projects root directory. The file should look like this: 

	var Metalsmith  = require('metalsmith');
	var markdown    = require('metalsmith-markdown');
	var layouts     = require('metalsmith-layouts');
	var permalinks  = require('metalsmith-permalinks');
	var collections = require('metalsmith-collections');
	var ebook  = require('./custom-modules/metalsmith-ebook');

	Metalsmith(__dirname)
	  .metadata({
	    title: "Ebook Generator Example",
	    description: "Generate ebooks easily with Metalsmith!",
	    generator: "Metalsmith",
	    url: "http://www.metalsmith.io/"
	  })
	  .source('./src')
	  .destination('./build')
	  .clean(true)
	  .use(collections({
	    chapters: {
	        pattern: 'chapters/*.md'
	    }
	  }))
	  .use(markdown())
	  .use(permalinks())
	  .use(layouts({
	    engine: 'handlebars'
	  }))
	  .use(ebook({
	    title: "Metalsmith Ebook Example",
	    author: "Team Metalsmith",
	    pdf: {
	      "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
	      "orientation": "portrait", // portrait or landscape
	    }
	  }))
	  .build(function(err, files) {
	      if (err) { 
	        throw err; 
	      }
	  });

Now lets dissect this file, line-by-line. 

	var Metalsmith  = require('metalsmith');
	var markdown    = require('metalsmith-markdown');
	var layouts     = require('metalsmith-layouts');
	var permalinks  = require('metalsmith-permalinks');
	var collections = require('metalsmith-collections');
	var ebook  = require('./custom-modules/metalsmith-ebook');

At the top of our `index.js` we declare our variables for metalsmith as well as all the plugins we will be using in this file. You should notice that all these variables are plugins that we declared in our package.json, one of the variable ebook, is initializing our custom plugin that we will build later on in this tutorial. 

	Metalsmith(__dirname)
	  .metadata({
	    title: "Ebook Example",
	    description: "Generate ebooks easily with Metalsmith!",
	    generator: "Metalsmith",
	    url: "http://www.metalsmith.io/"
	  })
	  .source('./src')
	  .destination('./build')
	  .clean(true)
	  .use(collections({
	    chapters: {
	        pattern: 'chapters/*.md'
	    }
	  }))
	  .use(markdown())
	  .use(permalinks())
	  .use(layouts({
	    engine: 'handlebars'
	  }))
	  .use(ebook({
	    title: "Metalsmith Ebook Example",
	    author: "Team Metalsmith",
	    pdf: {
	      "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
	      "orientation": "portrait", // portrait or landscape
	    }
	  }))
	  .build(function(err, files) {
	      if (err) { 
	        throw err; 
	      }
	  });

Here is our metalsmith instance, where metalsmith declares its methods sequentially from metalsmiths native api as well as any methods from plugins we might be using. So line-by-line lets see what going on here. 

1. The `.metadata()` method is providing variables that can be used throughout your project. This is a good place to put general variables that will be used throughout the project. In this particular instance we use the title field to declare our ebook title which is a required variable in our custom ebook plugin we will be building later on in this tutorial. Make sure to add the title now. 
2. The `source()` method declares the directory where the files will be pre-manipulation. 
3. The `destination()` method declares the destination directory the files will end up post-manipulation.
4. The `clean()` method will delete the contents of the destination directory everytime metalsmith is run and the files are manipulated. In this project we will set this value to true. 
5. The `use()` method wraps instances of plugins we will use in our project. 
6. The `collections()` method groups all our files from the `./chapters` folder with the `.md` extension. We can now iterate through this object in our template files if we want to list all our chapters or chapters of a certain category. You can checkout this plugins docs [here](https://github.com/segmentio/metalsmith-collections).
7. The `markdown()` enables the markdown syntax for editing pre-compilation. 
8. The `permalinks()` method nests our files in subdirectories. 
9. The `layouts()` enables handlebars as the templating engine. 
10. The `ebook()` plugin generates pdf, epub, and mobi files based on the html files in our project. 
11. The `build()` method will finally build the project using the plugins and options we've provided and spit out any errors if they occur. You can also add code to this block if maybe you want it to notify you that the build was successful. 

##Creating Your Source and Destination Folders  

1. Create a folder named `src` in your project's base directory. 
2. Navigate to your projects `src` directory and create a file called `index.md`. 
3. Open up your `index.md`.
4. Copy the YAML block below into your file, then save and close it. 

		---
		layout: layout.html
		---

5. The layout field will tell our layouts plugin which template to use when compiling this file into html.
6. Now create a subdirectory in your src folder called `chapters`.
7. Navigate into your `chapters` subdirectory and create a file called `chapter001.md`. 
8. In your `chapter001.md` copy and paste the contents below and save and close it. 

		---
		chapter: 1
		title: The First Example Chapter
		---
		## Chapter 1: The First Example Chapter
		The more she shat robb nymeria jaehaerys euron night's king.  Mya stone pate lyanna white walkers.  Qhorin halfhand ashara yoren gendry the hound, robb mya stone varys aemon.  Wights thoros  areo hotah shaggydog, olenna night's king tormund balon edmure asha ghost summer bran.  Gendry areo margaery craster aegon daeron.
		Stannis brandon stark areo hotah, greywind varamyr  meera reed dunk theon euron baelor night's king sandor.  Catelyn myrcella gerold hightower, rhaegar tommen podrick grey worm mance rayder donal noye robb dunk old nan areo hotah craster.  Arthur dayne meera reed dagmer cleftjaw areo hotah white walkers the hound.  Olenna Wun Weg Wun Dar Wun aemon edmure rickon khal drogo.

5. Let's take a look at this file more closely. In comments at the top you will see a block of YAML declaring two variables chapters and title. In order to use our plugin properly we need to declare the chapters variable and the title variable for each of our individual chapters. The chapters field will let us order our ebook and ascending order and the title field will act as our individual chapters file name when we save the chapter to file. Let rest of the file is written in normal markdown syntax and will act as the content for our chapter. 
6. Create another file in the `chapters` subdirectory called `chapter002.md`.
7. In your `chapter002.md` copy and paste the contents below and save and close it. 

		---
		chapter: 2
		title: The Second Example Chapter
		---
		## Chapter 2: The Second Example Chapter
		The more she shat robb nymeria jaehaerys euron night's king.  Mya stone pate lyanna white walkers.  Qhorin halfhand ashara yoren gendry the hound, robb mya stone varys aemon.  Wights thoros  areo hotah shaggydog, olenna night's king tormund balon edmure asha ghost summer bran.  Gendry areo margaery craster aegon daeron.
		Stannis brandon stark areo hotah, greywind varamyr  meera reed dunk theon euron baelor night's king sandor.  Catelyn myrcella gerold hightower, rhaegar tommen podrick grey worm mance rayder donal noye robb dunk old nan areo hotah craster.  Arthur dayne meera reed dagmer cleftjaw areo hotah white walkers the hound.  Olenna Wun Weg Wun Dar Wun aemon edmure rickon khal drogo.

7. Now navigate out of your `chapters` and `src` folder and create a `build` folder in your projects root directory. This will act as the destination folder for your project after it's compiled.  

##Creating our layout.html File for the Full Book.

1. Navigate back to your projects root directory. 
2. Create a directory called `layouts`. 
3. Navigate into your `layouts` directory and create a file called `layout.html`. 
4. Your `layout.html` file should look like this: 

		<!doctype html>
		<html lang="en">
		<head>
		  <meta charset="UTF-8" />
		  <title>{{ title }}</title>
		  <meta name="description" content="{{ description }}">
		  <meta name="layout" content="full-book">
		</head>
		<body>
		{{#each collections.chapters }}
			{{{this.contents}}}
			<div class="chapter-divider"></div>
		{{/each}}
		</body>
		</html>

5. In this file we take advantage of our `collections` plugin to iterate over all the chapters in our book. This template will display the full contents of our ebook. The `<div class="chapter-divider"></div>` is used to seperate chapters for our ebook plugin. 

##Creating our Custom Ebook Plugin

1. In your projects base directory, create a folder called `custom_modules`
2. In the custom_modules directory, create a folder called `metalsmith-ebook`. This folder will house the code that will make up your `metalsmith-ebook` plugin. 
3. In your `metalsmith-ebook` folder create a `package.json` file. It should look like this:
	
		{
			"name": "metalsmith-ebook",
			"version": "1.0.0",
			"dependencies": {
				"html-pdf": "^2.1.0",
				"epub-gen": "^0.0.16",
				"kindlegen": "1.0.1",
				"mkdirp": "^0.5.1"
			}
		}

4. Now remember that name and version are required fields in a package.json. In our dependencies field we add a couple of different plugins we will be using in order to generate the pdf, epub, and mobi files. Let's go through these and describe what they do. 
5. `html-pdf` takes the html files generated by Metalsmith and converts them into pdf files. 
6. `epub-gen` generates epub files based on html files.
7. `kindlegen` generates mobi files based on epub files. 
8. `mkdirp` easily creates directories that don't exist.
9. now that we understand what each of the plugins do lets open up our favorite bash client and install via:
		
		$ npm install

10. This will create and install the plugins in the `node_modules` folder.

##Creating our Plugins index.js File 

1. In the `metalsmith-ebook` directory create an `index.js` file. It should look like this:

		var pdf = require('html-pdf');
		var Epub = require("epub-gen");
		var kindlegen = require('kindlegen');
		var fs = require('fs');
		var mkdirp = require('mkdirp');
		var my_plugin = function (options) {
		    return function (files, metalsmith, done) {
		    	var destPath = metalsmith.destination()+'/';
		    	var metadata = metalsmith.metadata();
		    	// THROW ERROR IF TITLE ATTRIBUTE IS NOT SET
		    	if (!metadata.title) {
		    		throw("YOU MUST SET TITLE ATTRIBUTE OF METADATA");
		    	}else{
		    		var bookTitle = metadata.title;
		    	}
		        Object.keys(files).forEach(function(file){
		        	var contents = files[file].contents.toString();
		        	var path = files[file].path + '/';
		        	var title = files[file].title;
		        	var p0 = new Promise(
		        		function(resolve, reject){
				        	if (files[file].path) {
								var filePath = destPath + path + title + '.pdf';
								createPDF(contents, options.pdf, filePath);
				        	}else{
								var filePath = destPath + bookTitle + '.pdf';
								createPDF(contents, options.pdf, filePath);
				        	}
				        	function createPDF(contents, options, filePath){
								pdf.create(contents, options).toFile(filePath, function(err, res) {
									if (err) {
										reject();
									} else {
										resolve(contents, options);
									}
								});
				        	}
		        		}
		        	);
		        	p0.then(function(){
		        		console.log("PDF CREATED");
			        	var p1 = new Promise(
			        		function(resolve, reject){
			        			var multiChapterCheck = contents.includes('<meta name="layout" content="full-book">');
			        			if (multiChapterCheck) {
			        				var res = contents.split('<div class="chapter-divider"></div>');
			        				var chapterArray = [];
			        				res.forEach(function(entry){
			        					chapterArray.push({data: entry});
			        				});
			        			}
								// Generate EPUB
								if (multiChapterCheck) {
									chapterArray.pop();
								   	options.epub = {
								        title: options.title, // *Required, title of the book.
								        author: options.author, // *Required, name of the author.
								        content: chapterArray
								    };	
								}else{
								    options.epub = {
								        title: options.title, // *Required, title of the book.
								        author: options.author, // *Required, name of the author.
								        content: [
								            {
								                data: contents
								            }
								        ]
								    };
								}
							    if (files[file].path) {
							    	var epubpath = destPath+path+title+'.epub';
							    	var mobipath = destPath+path+title+'.mobi';
							    	var dir = destPath+path;
							    }else{
							    	var epubpath = destPath + bookTitle + '.epub';
							    	var mobipath = destPath + bookTitle + '.mobi';
							    	var dir = destPath
							    }
							    if (!fs.existsSync(dir)){
							        mkdirp(dir, function (err) {
							            if (err){
							            	reject(err);
							            } 
							            else {
							            	var paths = {
							            		epubpath: epubpath,
							            		mobipath: mobipath
							            	}
							            	resolve(paths);
							            }
							        });
								}else{
					            	var paths = {
					            		epubpath: epubpath,
					            		mobipath: mobipath
					            	}
					            	resolve(paths);
								}
			        		}
			        	);
			        	p1.then(function(paths) {
						    new Epub(options.epub, paths.epubpath).promise.then(function(){
						    	console.log('EPUB CREATED');
								kindlegen(fs.readFileSync(paths.epubpath), (error, mobi) => {
								    if (error) {
								    	console.log(error);
								    }else{
								    	fs.writeFile(paths.mobipath, mobi, function(err){
								    		if (err) {
								    			console.log(err);
								    		}else{
								    			console.log("MOBI CREATED");
								    		};
								    	});
								    };
								});
						    }, function(err){
						        console.error("Failed to generate Ebook because of ", err)
						    });
			        	}).catch(function(err){
			        		console.log(err);	
			        	});
		        	}).catch( function() {
		        		console.log('ERROR GENERATING PDF');	
		        	});
		        });
		        done();
		    };
		};
		// Expose the plugin
		module.exports = my_plugin;

2. Essentially what's happening here is we use promises to generate pdf files first. Once the pdf files are done we then create epub files using the content passed by the metalsmith function. Once the epub are finished we then generate the mobi files based on the epubs. 
3. Now that we understand whats going on in our ebook plugin lets navigate back to our projects root directory and build our project. 

##Building our Project

1. Once we are back in our projects root directory open up your favorite bash client and run: 

		$ node index.js

2. You should see a bunch of output. If there are no errors the book should have been compiled.
3. Open up your projects `./build` folder. Html, pdf, epub, and mobi files should be generated for the full book as well as chapter-by-chapter in their relative subdirectories.  













