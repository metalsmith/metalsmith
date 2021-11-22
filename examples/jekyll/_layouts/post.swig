<html>
<head>
  <title>{{ title | safe }} | {{ site_title | safe }}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{ site_description | safe }}">
</head>
<body>
  <h1>{{ title }}</h1>
  <time>{{ date | date('Y-m-d') }}</time>
  {{ contents | safe }}
</body>
</html>
