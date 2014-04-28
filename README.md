File Uploader
=============

Mono file uploader module.

## Configuration

The most important parameters are set in the module upload operation `params` array.

 - `uploadDir`: path to the directory where the file will be uploaded (**required**)
 - `dsUpload`: datasource (**required**)
 - `emitArgument`: sets the parameter that will be emited by module in `fileUploaded` event. It can take the following values: `id`, `path`, `object` or an object: `{"type": "custom", "value": "docKey"}`

### Example of configuration

```JSON
"uploader": {
    "module": "github/IonicaBizau/file-uploader/[VERSION]",
    "config": {
        "html": "/path/to/html/file.html",
        "options": {
            "acceptTypes": ["txt", "and", "other", "file", "extensions"]
        },
        "binds": [BIND_OBJECTS],
        "listen": {EVENT_OBJECTS}
    },
    "roles": [MONO_ROLES],
    "operations": {
        "upload": {
            "roles": [MONO_ROLES],
            "params": [
                {
                    "dsUpload": "temporarDS",
                    "emitArgument": "path",
                    "acceptTypes": ["txt", "and", "other", "file", "extensions"],
                    "uploadDir": "path/to/upload/dir",
                    "uploadFileEvent": "uploadedFileToImport"
                }
            ]
        }
    }
},
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
        <td>uploaded file <code>id</code>, <code>path</code> or the entire object. This can be set in the module upload operation parameters.</td>
    </tbody>
</table>

## Change Log

### dev

- add new features here

### v0.1.5

- `acceptTypes` options (both client and server) if not present, allows any file type uploads
- add new features and fixed here
- Update to Events v0.1.10
- Update to Bind v0.2.2

### v0.1.4

- Update to Events v0.1.8

### v0.1.3

- `acceptTypes` configuration and param fields
- Update to Bind v0.2.1

### v0.1.2

- Update to Events v0.1.7

### v0.1.1

- Don't emit `fileUploaded` if no file was selected in the file input

### v0.1.0

- initial version

