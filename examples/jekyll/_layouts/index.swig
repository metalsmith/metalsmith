<html>
<head>
  <title>{{ site_title }}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{ site_description }}">
  <meta name="generator" content="metalsmith">
</head>
<body>
  <h1>{{ site_title | safe }}</h1>
  <p>{{ site_description | safe }}</p>
  <hr>
  <h2>Posts</h2>
  {% for post in posts %}
  <h3><a href="{{ post.path }}">{{ post.title | safe }}</a></h3>
  <p>{{ post.excerpt | striptags | safe }}</p>
  <hr>
  {% endfor %}
</body>
</html>
