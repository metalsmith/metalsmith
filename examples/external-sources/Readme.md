# external-sources

This example shows how to incorporate external data sources into your Metalsmith site. It generates a really simple directory page using a JSON file with names and contact info formatted with a pug layout.



## How it works

A Metalsmith plugin looks at the metadata of every page. If that page has a `jsonFilePath` item, it `require`s the JSON file and adds it to the page's `jsonData` key. Then, `metalsmith-pug` renders the page's template with the Metalsmith metadata as locals, so the template renders each person in a row in the table.

The plugin works for every page, so any page with a `jsonFilePath` key gets that JSON file loaded into `jsonData`.
