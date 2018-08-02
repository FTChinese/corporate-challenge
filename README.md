## Usage

### Command
`gulp serve` for live preview
`gulp deploy` to deploy to server.

### Directory Structure

Each year's image files are put into `public/images/<year>`.

Json data used for templates are put into `data` directory.

`data/base.json` is the common data used by all html files.

`data/page-list.json` specifies what html files will be produced. The data is an array. Each item in the array correspond to a static html file. `newsList` field in each item is a list of markdown files to be inserted into the html file after converted to html.

The markdown files are put under `news` categorized according to years.

## Build process
In the `gulp html` task, `base.json` and `page-list.json` are first read. Then the files listed in `newsList` field in each item of `page-list.json` are read, converted to html and put into an array, which was assigned to the `newsList` field (override the original array). Next we loop over the new `page-list` data and render them against templates specified in the `template` field.