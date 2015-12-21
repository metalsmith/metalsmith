var gulp = require('gulp'),
    connect = require('gulp-connect'),
    metalsmith = require('metalsmith'),
    markdown = require('metalsmith-markdown'),
    permalinks = require('metalsmith-permalinks'),
    templates = require('metalsmith-templates'),
    watch = require('metalsmith-watch');

    gulp.task('serve', function() {
        connect.server();
    });

    gulp.task('watch', function() {

        metalsmith(__dirname)
        .use(
            watch({
                paths: {
                    "${source}/**/*": true, // every changed files will trigger a rebuild of themselves 
                    "templates/**/*": "**/*" // every templates changed will trigger a rebuild of all files 
                }
            })
        )
        .use(markdown())
        .use(permalinks('posts/:title'))
        .use(templates('handlebars'))
        .build(function(err) {
            if (err) throw err;
        });


    });

    gulp.task('default', ['watch', 'serve']);

