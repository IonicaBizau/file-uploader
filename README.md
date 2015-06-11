File Uploader
=============

Mono file uploader module.

## Configuration

The most important parameters are set in the module upload operation `params` array.

 - `uploadDir`: path to the directory where the file will be uploaded (**required**)
 - `dsUpload`: datasource (**required**)
 - `dsTemporarUpload`: temporar upload datasource (**required** if `temporarUpload: true` in uploader template configuration)
 - `emitArgument`: sets the parameter that will be emited by module in `fileUploaded` event. It can take the following values: `id`, `path`, `object` or an object: `{"type": "custom", "value": "docKey"}` (`upload` operation)
 - `uploadFileEvent`: name of custom handler that gets called before the uploaded object gets inserted in the db (`upload` operation)
 - `customUpload`: name of custom handler that gets called in order to construct a custom upload path for the uploaded file (`upload` operation)
 - `customPathHandler`: name of custom handler that gets called in order to construct a custom path to a file that needs to be downloaded (`download` operation)

The file-uploader module can also receive an optional template object with a template configuration (see `setTemplate` event bellow). In this case for each `setTemplate` call, the module will render all configured `uploaders` (see template configuration bellow) for the given template in the specified `container` based on user permissions.

## Template configuration

The most important parameters are set in the `uploader` object found in the template `options` configuration

 - `uploaders`: object containing all distinct uploader configurations (a template can have multiple uploaders with diffrent configurations and permissions (upload, download, remove) all renderd by the same module instance (**required**)
    * `[uploaderName]` the name of the uploader instance (**required**)
        * `container` the selector used to find the container where the uploader will be rendered
        * `uploadDir` path to the directory where the file will be uploaded (this path will be appended to the `uploadDir` value found in the module `params` array)
        * `customUpload` name of custom handler that gets called in order to construct a custom upload path for the uploaded file (`upload` operation)
        * `uploadFileEvent` name of custom handler that gets called before the uploaded object gets inserted in the db (`upload` operation)
        * `temporarUpload` document will be uploaded to a temporar collection (true/false)
        * `access` permissions string for the module operations (upload, download, remove), can be set dynamically for each user in the `crud_access.js` file ("u" - if user has uplaod permission, "d" - download permission, "r" - remove permission)
        * `customPathHandler` name of custom handler that gets called in order to construct a custom path to a file that needs to be downloaded (`download` operation)
        * `customPermissions` name of custom handler that returns custom permissions for the upload operations
 - `html` the path to the html files/file for the upload controls
 - `controls` selector configurations for the upload controls (`select`, `upload`, `fileName`)
 - `waitForEvent` the uploader will listen for a `enableRendering` event before rendering the configured uploaders

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
        },
        "getDocuments": {
            "roles": [MONO_ROLES],
            "params": [
                {
                    "dsUpload": "temporarDS"
                }
            ]
        },
        "getUploadPermissions": {
            "roles": [MONO_ROLES],
            "params": [{}]
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

### Example of template configuration
```Javascript
uploader: {
    uploaders: {
        [UPLOADER_NAME]: {
            container: [CSS_SELECTOR],
            uploadDir: "path/to/upload/dir",
            customUpload: "handlerName",
            uploadFileEvent: "handlerName",
            temporarUpload: true, // default false
            access: 'urd',
            customPermissions: "handlerName",
            customPathHandler: "handlerName"
        }
    },
    html: "path/to/htmlFile.html", // can be i18n object
    controls: {
        select: ".btn-upload-select",
        upload: ".btn-upload-start",
        fileName: ".file-name"
    },
    waitForEvent: true // default false
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
        <tr>
            <td><pre>uploadersRendered</pre></td>
            <td>It is emited when the template configured uploaders finish rendering</td>
            <td>none</td>
        </tr>
    </tbody>
</table>

The module listens for the following events:

<table>
    <thead>
        <th>Event name</th>
        <th>Description</th>
        <th>Parameters</th>
    </thead>
    <tbody>
        <tr>
            <td><pre>setTemplate</pre></td>
            <td>Sets the template and renders uploaders based on the configuration found inside the template</td>
            <td>The full template object or the template `_id` as string.</td>
        </tr>
        <tr>
            <td><pre>enableRendering</pre></td>
            <td>Starts the uploaders rendering if the `waitForEvent` is true</td>
            <td>none</td>
        </tr>
        <tr>
            <td><pre>setData</pre></td>
            <td>Data sent will be appended to the upload form</td>
            <td>`data` object</td>
        </tr>
        <tr>
            <td><pre>reset</pre></td>
            <td>For template uploaders only. Resets the uploader controls</td>
            <td>none</td>
        </tr>
        <tr>
            <td><pre>rebuildUi</pre></td>
            <td>For template uploaders only. The uploader will ask again for the upload permissions and rebuild the uploaders based on the permissions that might have changed</td>
            <td>none</td>
        </tr>
        <tr>
            <td><pre>removeItem</pre></td>
            <td>Removes the specified item from the DB and FS</td>
            <td>An object containing the `itemId` and `uploader` (the name of the uploader instance configured in the `uploaders` field) if the document was uploaded using a template uploader</td>
        </tr>
        <tr>
            <td><pre>getDocuments</pre></td>
            <td>For template uploaders only. Returns the documents for a specified `uploader` and `template` based on the user permissions. Also returns `removeForbidden: true` if the user cannot remove the requested documents</td>
            <td>An object containing `uploader` name and `template` object or id as string</td>
        </tr>
    </tbody>
</table>

## Change Log

### v0.5.0
- Added "template uploaders" functionality

### v0.4.0
- transferred the module to the new jxMono organization
- updated Bind to `v0.4.0`, Events to `v0.4.0`

### v0.3.9
- Clear the existing hidden inputs when `setData` is called

### v0.3.8
- `removeItem` client function can receive object as parameter

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

