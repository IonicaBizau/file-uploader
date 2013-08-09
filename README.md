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
