
# BLOG

This example uses Metalsmith to make a simple blog. To test it out yourself just run:

    $ make build

If that spits out an error saying you there is no such make command. Then try this:

	$ npm install 

followed by: 

	$ node index.js

If your new to node, npm, and metalsmith in general then you are probably a little confused. Lets take a closer look at what we just did. Open up your Makefile located in this examples root directory. It should look like this: 

	build: node_modules
		node index.js

	node_modules: package.json
		npm install

	.PHONY: build

When you run `$ make build` it is telling the machine to run the build command located in the directories makefile. The build command is located under the `.PHONY` field which acts as an alias to run all the commands found in the make file. When you run `$ make build` it's telling the machine to run all the command found in the make file, which in our case will run `$ npm install` and `$ node index.js`. If you encounter an error and the make command is not recognized on your machine then you probably need to install it someway. I was working on a Windows machine and found it much easier to just stop using the `$ make build` command. Now let's see what these other commands do. 

The `$ npm install` command will take a look at your package.json file and install any dependencies that are listed here. This gives you all the plugins you need to build your blog. Let's open it up and take a look at the plugins we will be using for this site, the package.json file should look like this: 

	{
	  "name": "blog-example",
	  "private": true,
	  "dependencies": {
	    "handlebars": "^4.0.5",
	    "metalsmith": "^2.1.0",
	    "metalsmith-layouts": "^1.4.1",
	    "metalsmith-markdown": "^0.2.1",
	    "metalsmith-permalinks": "^0.5.0",
	    "metalsmith-drafts": "^0.0.1",
	    "metalsmith-collections": "^0.7.0",
	    "metalsmith-discover-partials": "^0.1.0"
	  }
	}

Line-by-line here are the plugins we are using and why:

1. handlebars - Installs handlebars as our templating engine for the build. If you are not familiar with handlebars, check out the docs [here](http://handlebarsjs.com/). 
2. metalsmith - Our favorite static site generator.
3. metalsmith-layouts - Interperets out templating engine.
4. metalsmith-markdown - Lets us use markdown to write our posts.
5. metalsmith-permalinks - Gives us pretty urls for seo and usability purposes. Changes the first-post.html to first-post/index.html during the compiling phase. 
6. metalsmith-drafts - Lets us mark posts as drafts, which will not be compiled into the production folder
7. metalsmith-collections - Gives us the ability to group posts and iterate through them if we want to list all of our posts specific to a certain category. 
8. metalsmith-discover-partials - Lets us use handlebars partials in our project. 

Run `$ npm install` and a folder named "node_modules" will be created in the projects root directory containing all your plugins. 

Now lets take a look at our `index.js` file. It should look something like this: 

	var Metalsmith  = require('metalsmith');
	var markdown    = require('metalsmith-markdown');
	var layouts     = require('metalsmith-layouts');
	var permalinks  = require('metalsmith-permalinks');
	var drafts = require('metalsmith-drafts');
	var collections = require('metalsmith-collections');
	var discoverPartials = require('metalsmith-discover-partials');

	Metalsmith(__dirname)
	  .metadata({
	    title: "My Blog",
	    description: "It's about saying »Hello« to the World.",
	    generator: "Metalsmith",
	    url: "http://www.metalsmith.io/",
	    twitter: "https://twitter.com/",
	    facebook: "https://www.facebook.com/",
	    github: "https://github.com/"
	  })
	  .source('./src')
	  .destination('./build')
	  .clean(false)
	  .use(drafts())
	  .use(discoverPartials({
	      directory: 'layouts/partials',
	      pattern: /\.hbs$/
	  }))
	  .use(collections({
	    posts: {
	        pattern: 'posts/*.md',
	        sortBy: 'date',
	        reverse: true
	    }
	  }))
	  .use(markdown())
	  .use(permalinks())
	  .use(layouts({
	    engine: 'handlebars'
	  }))
	  .build(function(err, files) {
	    if (err) { throw err; }
	  });

Line-by-line lets take a look at whats happening here:

	var Metalsmith  = require('metalsmith');
	var markdown    = require('metalsmith-markdown');
	var layouts     = require('metalsmith-layouts');
	var permalinks  = require('metalsmith-permalinks');
	var drafts = require('metalsmith-drafts');
	var collections = require('metalsmith-collections');
	var discoverPartials = require('metalsmith-discover-partials');

At the top of the file we instantiate our variables and link them with their corresponding plugins. We will use these variables in our metalsmith function below. 

Next you will see the Metalsmith function being called. Here we will chain the plugins together which will tell Metalsmith which functions to run during our compiling phase. 
Order does matter here and sometime when adding a plugin you will notice that it doesn't have the expected result. If your not seeing the result, but Metalsmith is not notifying you of any error then you might just have to change the order the plugin was enter in. I usually try adding it right after the `.clean()` function.

	.metadata({
		title: "My Blog",
		description: "It's about saying »Hello« to the World.",
		generator: "Metalsmith",
		url: "http://www.metalsmith.io/",
		twitter: "https://twitter.com/",
		facebook: "https://www.facebook.com/",
		github: "https://github.com/"
	})

The metadata function states general data about your project and is a good place to enter global variables that will be used in your project. Here I have included twitter, facebook, and github links in order to use them in the footer of our pages. 

	.source('./src')
	.destination('./build')

These two functions I'll describe together. Pretty self explanitory. The `./src` directory is where you will edit your files pre-compiling and the `./build` directory is where your files will end up post-compiling. 

	.clean(false)

If the clean function is set to true it will delete all the files within the `./build` directory before each compiling phase making sure it perfectly mirrors the `./src` folder, while setting the function to false will not delete files in the `./build` directory before each compiling phase.
	
	.use(drafts())

This just simply runs the draft function and enables the drafts plugin and functionality on the project.

	.use(discoverPartials({
		directory: 'layouts/partials',
		pattern: /\.hbs$/
	}))

This will discovery any partials in the `./layouts/partials` folder with the `.hbs` file extension. We will be creating header and footer partials for our blog. 

	.use(collections({
		posts: {
		    pattern: 'posts/*.md',
		    sortBy: 'date',
		    reverse: true
		}
	}))

This block groups all our posts from the `./build/posts` folder with the `.md` extension. We can now iterate through this object in our template files if we want to list all our posts or posts of a certain category. You can checkout this plugins docs [here](https://github.com/segmentio/metalsmith-collections).

	.use(markdown())

Simply enables the markdown syntax for editing pre-compilation. 

	.use(permalinks())

Makes our urls pretty post compilation, as described before when we were going over our package.json file.   

	.use(layouts({
		engine: 'handlebars'
	}))

Lets us use handlebars as the templating engine. 

	  .build(function(err, files) {
	    if (err) { throw err; }
	  });

This will finally build the project using the plugins and options we've provided and spit out any errors if they occur. You can also add code to this block if maybe you want it to notify you that the build was successful. 

Now before we run `$ node index.json` lets take a look at our `./src` and `./layouts` folders. In the `./src/posts` folder open up the file `first-post.md`. It should look like this. 

	---
	title: My First Post
	date: 09-30-2016
	layout: post.html
	collection: testing
	author: John Doe
	draft: false
	---

	Bacon ipsum dolor amet chicken pork meatball cow swine. Meatloaf chicken meatball tail bacon andouille sausage prosciutto rump. Short loin biltong tri-tip, swine venison beef corned beef shank pork chop bacon. Turducken alcatra sirloin short ribs cow short loin. Short loin beef spare ribs meatloaf tri-tip bresaola. Beef ribs bacon meatball beef.


Line-by-line here is what its doing. 

1. All the data in the comment block is considered variables to be used in your template files before compilation. You can enter whatever variables you want for each individual post. Remember that some variables work with your plugins and need to be added to each post file. 
2. Title, date, and author are self explanitory and general data for this post. 
3. layout signifies which template to use for this post. 
4. collections works with our collections plugin to group posts in a specific category. 
5. drafts works with our drafts plugin to signify if this post is a draft or not and if it should be left out of the compilation phase. 
6. Anything under the comment block is part of the contents field. 

Now open up your `./layouts/post file`, it should look something like this: 

	{{> header }}

	  <h1>{{ title }}</h1>
	  <time>{{ date }}</time>
	  {{{ contents }}}

	{{> footer }}

At a glance you should see how these variables correlate in your templates folder. Take notice that the content of the post will be displayed in the `{{{ contents }}}` line. Another thing you should notice is the `{{> header }}` and `{{> footer }}` lines. If at this point your confused, again take a look at the handlebars docs [here](http://handlebarsjs.com/). This is handlebars way of including partials in the file. Open up your `./layouts/partials/footer.hbs` file. The file should look like this:

	  <footer>
	    <a href="{{twitter}}" target="_blank">twitter</a>
	    <a href="{{facebook}}" target="_blank">Facebook</a>
	    <a href="{{github}}" target="_blank">Github</a>
	  </footer>

	</body>
	</html>

Notice that the twitter, facebook, and github variables are not taken from the `first-post.md` file, but are included in the metadata function of the `index.js` file. This is important because that data can be used globally throughout your metalsmith project. If your having trouble remembering that line of code, here it is below:

	.metadata({
		title: "My Blog",
		description: "It's about saying »Hello« to the World.",
		generator: "Metalsmith",
		url: "http://www.metalsmith.io/",
		twitter: "https://twitter.com/",
		facebook: "https://www.facebook.com/",
		github: "https://github.com/"
	}) 

Now lets take a look at our template for our landing page at `./layouts/layout.html`:

	{{> header }}

	  <h1>{{ title }}</h1>
	  <p>{{ description }}</p>

	  {{{ contents }}}


	  <div>

	      {{#each collections.posts }}
	        <a href=".{{baseUrl}}/{{this.path}}/index.html" title="{{this.title}}">
	            <h2>{{this.title}}</h2>
	        </a>
	      {{/each}}

	  </div>

	{{> footer }}

This file should look pretty familiar to you with the exception this:

	{{#each collections.posts }}
	<a href=".{{baseUrl}}/{{this.path}}/index.html" title="{{this.title}}">
	    <h2>{{this.title}}</h2>
	</a>
	{{/each}}

This is taking advantage of our collections plugin. In our `index.js` file we created a collection called posts that grabs all the `.md` files in our `./src/posts/` folder and creates and obj out of them. Here we are iterating through that object in order to list our recent posts. The collections plugin also give you a way to link to this file with the `{{baseUrl}}` and `{{this.path}}` variables. Here is the block of code from our `index.js` file for your reference: 

	.use(collections({
		posts: {
		    pattern: 'posts/*.md',
		    sortBy: 'date',
		    reverse: true
		}
	}))

Now we should have a pretty good understanding of the content of our `./build` folder and how it communicates with out `./layouts` folder and how all of that works with out plugins and `index.js` file. So with that lets run our `index.js` file with: 

`$ node index.js`

This should take a second and if there were no errors found ,it should show you a new line. Now go take a look at your `./build` folder. You should see that it is now populated with an index.html as well as a posts folder with the corresponding posts. Open the `index.html` file up with your browser and start exploring. 










