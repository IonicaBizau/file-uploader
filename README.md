File Uploader
=============

Mono file uploader module.

## How to use?

Define the `upload` from application descriptor and set the `dsUpload` parameter:


```JSON
{
  "module": "github/IonicaBizau/file-uploader/dev",
  "roles": [0],
  "operations": {
    "upload": {
      "roles": [0],
      "params": [
        { "dsUpload": "temporarDS" }
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

<table>
  <thead>
    <tr>
      <th>Event Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>fileId</code></td>
      <td>Emits the uploaded file id. The <code>id</code> represents the <code>id</code> field of inserted document in database defined in datasources.</td>
    </tr>
  </tbody>
</table>
