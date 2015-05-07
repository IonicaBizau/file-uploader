File Uploader
=============

Mono file uploader module.

## Configuration

The most important parameters are set in the module upload operation `params` array.

 - `uploadDir`: path to the directory where the file will be uploaded (**required**)
 - `dsUpload`: datasource (**required**)
 - `emitArgument`: sets the parameter that will be emited by module in `fileUploaded` event. It can take the following values: `id`, `path`, `object` or an object: `{"type": "custom", "value": "docKey"}` (`upload` operation)
 - `uploadFileEvent`: name of custom handler that gets called before the uploaded object gets inserted in the db (`upload` operation)
 - `customUpload`: name of custom handler that gets called in order to construct a custom upload path for the uploaded file (`upload` operation)
 - `customPathHandler`: name of custom handler that gets called in order to construct a custom path to a file that needs to be downloaded (`download` operation)

### Example of configuration

```JSON
"uploader": {
    "module": "github/jillix/file-uploader/[VERSION]",
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
                    "uploadFileEvent": "uploadedFileToImport",
                    "customUpload": "getUploadCustomPath"
                }
            ]
        },
        "download": {
            "roles": [MONO_ROLES],
            "params": [
                {
                    "dsUpload": "temporarDS",
                    "uploadDir": "path/to/upload/dir",
                    "customPathHandler": "getDocCustomPath"
                }
            ]
        },
        "remove": {
            "roles": [MONO_ROLES],
            "params": [
                {
                    "dsUpload": "temporarDS",
                    "uploadDir": "path/to/upload/dir",
                    "removeFileEvent": "exampleHandler"
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
        <tr>
            <td><pre>fileUploaded</pre></td>
            <td>It is emited when the file is uploaded</td>
            <td>uploaded file <code>id</code>, <code>path</code> or the entire object. This can be set in the module upload operation parameters.</td>
        </tr>
        <tr>
            <td><pre>uploadFailed</pre></td>
            <td>It is emited when the upload process encountered an error and failed</td>
            <td>The <code>error</code> encountered. This parameter can be missing.</td>
        </tr>
        <tr>
            <td><pre>itemRemoved</pre></td>
            <td>It is emited when the file is successfully removed</td>
            <td>none</td>
        </tr>
    </tbody>
</table>

## Change Log

### dev
- add new features and fixes here

### v0.3.7
- Added `removeFileEvent` remove operation event

### v0.3.6
- Updated to Bind `v0.3.2`

### v0.3.5
- catching server side errors during upload
- added `uploadFile` event
- fixed IE upload problem (IFRAME does not understand application/json content type)

### v0.3.3
- piping downloaded files

### v0.3.2
- checking if file exists for download

### v0.3.1
- Updated to Bind `v0.3.1`

### v0.3.0
- Updated deps

### v0.2.1
- Added custom handler support for the file path in the download operation
- Removed the `Content-Disposition` `attachment` directive for the download operation
- Removed the `text/csv` `Content-Type` from the download operation

### v0.1.8
- Moved the `fileUploaded` event emit higher in the code

### v0.1.7
- Check the file size when uploading a file

### v0.1.6
- Update to Events v0.1.11

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

