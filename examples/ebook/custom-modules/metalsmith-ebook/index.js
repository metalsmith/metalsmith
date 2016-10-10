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
