File Uploader
=============

Mono file uploader module.

## Configuration

The most important parameters are set in the module upload operation `params` array.

 - `uploadDir`: path to the directory where the file will be uploaded (**required**)
 - `dsUpload`: datasource (**required**)
 - `emitArgument`: sets the parameter that will be emited by module in `fileUploaded` event. It can take the following values: `id`, `path`, `object`

### Example of configuration

```JSON
{
  "module": "github/IonicaBizau/file-uploader/dev",
  "html": "/path/to/html/file.html",
  "roles": [0],
  "operations": {
    "upload": {
      "roles": [0],
      "params": [
        {
            "dsUpload": "temporarDS",
            "uploadDir": "/public/uploads",
            "emitArgument": "id"
        }
      ]
    }
  }
}
```

Where `temporarDS` is defined into `datasources` key from application descriptor:

```JSON
{
  ...
  "datasources": {
    "temporarDS": {
      "type": "mongo",
      "db": "databaseName",
      "collection": "temp"
    }
  },
  ...
}
```

## Events

The module emits the following events:

<table>
    <thead>
        <th>Event name</th>
        <th>Description</th>
        <th>Parameters</th>
    </thead>
    <tbody>
        <td><pre>fileUploaded</pre></td>
        <td>It is emited when the file is uploaded</td>
        <td>uploaded file <pre>id</pre>, <pre>path</pre> or the entire object. This can be set in the module upload operation parameters.</td>
    </tbody>
</table>
