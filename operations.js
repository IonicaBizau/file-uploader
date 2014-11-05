var fs = require("fs");
var ObjectId = M.mongo.ObjectID;

/*
 *  upload operation
 *
 *  This handle the uploaded file data (generated by the Mono core) and
 *  sends it on the client side
 *
 * */
exports.upload = function (link) {

    // validate upload
    if (!link.files || !link.files.file || !link.files.file.size) {
        return link.send(400, { error: "Invalid upload" });
    }

    // verify if uploadDir exists
    if (!link.params || !link.params.uploadDir || !link.params.dsUpload) {
        return link.send(400, { error: "Missing params: uploadDir or dsUpload." });
    }

    // accept types default value
    link.params.acceptTypes = link.params.acceptTypes || [];

    // get the uploaded file path
    var uploadedFilePath = M.app.getPath() + "/" + link.files.file.path;

    // get the extension of the uploaded file
    var fileExt = link.files.file.name;
    fileExt = fileExt.substring(fileExt.lastIndexOf(".")) || "";

    // check the file type
    if (link.params.acceptTypes.length && !checkFileType(fileExt, link.params.acceptTypes)) {

        // delete the uploaded file (that is invalid)
        fs.unlink(uploadedFilePath, function (err) {
            if (err) { console.error(err); }
        });

        // return bad request
        return link.send(400, "Invalid file extension.");
    }

    // get the absolute and relative path to the upload directory
    getUploadDir(link, function (err, uploadDir, relativeUploadDir) {

        // handle error
        if (err) { return link.send(400, err); }

        // get the generated id
        var generatedId = uploadedFilePath.substring(uploadedFilePath.lastIndexOf("/") + 1);

        // final path
        var newFilePath = uploadDir + "/" + generatedId + fileExt;

        // get the collection from datasource
        getCollection(link.params.dsUpload, function (err, collection) {

            // handle error
            if (err) { return link.send(400, err); }

            // create doc to insert object
            var docToInsert = {
                // that contains the file name
                fileName: link.files.file.name,
                // the exension
                extension: fileExt,
                // the file path
                absoluteFilePath: newFilePath,
                // the generated file id
                id: generatedId
            };

            // and the relative file path
            docToInsert.filePath = relativeUploadDir + "/" + docToInsert.id + docToInsert.extension;

            // get the uploadFileEvent
            var uploadFileEvent = link.params.uploadFileEvent;

            /*
             *  getArgToSend ()
             *
             *  This returns the argument to send on the client side
             * */
            function getArgToSend (doc) {
                var arg;
                switch (link.params.emitArgument) {
                    case "object":
                        arg = doc;
                        break;
                    case "path":
                        arg = doc.filePath;
                        break;
                    default:
                        var emitArg = link.params.emitArgument;
                        if (typeof emitArg === "object" && emitArg.type === "custom") {
                            arg = doc[emitArg.value];
                        } else {
                            arg = doc.id;
                        }
                        break;
                }
                return arg;
            }


            /*
             *  insertFileDataInDatabase (link, object)
             *
             *  This function inserts an object with the file information in the
             *  database
             * */
            function insertFileDataInDatabase (fileInfo) {

                // inser the file information
                collection.insert(fileInfo, function (err, doc) {

                    // handle error
                    if (err) { return link.send(400, err); }

                    // inserted doc is the first one
                    doc = doc[0];

                    // and finally send the response
                    link.send(200, getArgToSend(doc));
                });
            }

            // rename the file (this just adds the file extension)
            fs.rename(uploadedFilePath, newFilePath, function (err) {

                // handle error
                if (err) { return link.send(400, err); }

                // if upladFileEvent is provided
                if (uploadFileEvent) {

                    // call for a custom handler
                    M.emit(uploadFileEvent, {
                        docToInsert: docToInsert,
                        link: link
                    }, function (err, newDocToInsert) {

                        // handle error
                        if (err) { return link.send(400, err); }

                        // if we don't send any new document, docToInsert will be inserted
                        newDocToInsert = newDocToInsert || docToInsert;

                        // insert the file data in the database
                        insertFileDataInDatabase(newDocToInsert);
                    });
                // if it is not provided
                } else {
                    // insert data directly
                    insertFileDataInDatabase(docToInsert);
                }
            });
        });
    });
};

/*
 *  download operation
 *
 *  This is the download operation which gets the id of a file and returns it
 *
 * */
exports.download = function (link) {

    if (!link.data && !link.query) {
        return;
    }

    // get the itemId
    var itemId;
    if (link.query.id) {
        itemId = link.query.id;
    } else if (link.data) {
        if (link.data.itemId) {
            itemId = link.data.itemId;
        } else {
            return link.send(400);
        }
    }

    if (!itemId) {
        return link.send(400);
    }

    /*
     *  pipeFile ()
     *
     *  This function checks if the file exists and pipes the result
     * */
    function pipeFile (doc, path) {
        // check if file exists
        fs.exists(path, function (exists) {

            if (!exists) {
                return link.send(404, ' 404 file not found');
            }

            link.res.writeHead(200, {
                'Content-disposition': 'filename="' + doc.fileName + '"'
            });

            var filestream = fs.createReadStream(path);
            filestream.pipe(link.res);
        });
    }

    getCollection(link.params.dsUpload, function (err, collection) {

        // handle error
        if (err) { return link.send(500, err); }

        // find and remove the item from db
        collection.findOne({ _id: ObjectId(itemId)}, function (err, doc) {

            // handle error
            if (err) { return link.send(500, err); }
            if (!doc) { return link.send(404, 'item not found!'); }

            // look for a path custom handler
            if (link.params.customPathHandler) {

                // call the handler
                M.emit(link.params.customPathHandler, {
                    doc: doc,
                    link: link,
                }, function (path) {

                    // pipe the file
                    pipeFile(doc, path);
                });
            } else {
                var path = M.app.getPath() + "/" + link.params.uploadDir + "/" + doc.filePath;

                // pipe the file
                pipeFile(doc, path);
            }
        });
    });
}

/*
 *  remove operation
 *
 *  This is the remove operation which gets the id of a file and deletes it
 *
 * */
exports.remove = function (link) {

    if (!link.data && !link.query) {
        return;
    }

    // get the itemId
    var itemId;
    if (link.query.id) {
        itemId = link.query.id;
    } else if (link.data.itemId) {
        itemId = link.data.itemId;
    }

    if (!itemId) {
        return link.send(400);
    }

    getCollection(link.params.dsUpload, function (err, collection) {

        // handle error
        if (err) { return link.send(500, err); }

        // find and remove the item from db
        collection.findAndRemove({ _id: ObjectId(itemId)}, function (err, doc) {

            // handle error
            if (err) { return link.send(500, err); }
            if (!doc) { return link.send(404, 'item not found!'); }

            var path = M.app.getPath() + "/" + link.params.uploadDir + "/" + doc.filePath;

            // delete the item
            fs.unlink(path, function (err) {

                // handle error;
                if (err) { return link.send(400, 'Bad Request'); }

                link.send(200);
            });
        });
    });
}

// private functions

/*
 *  getCollection (string, function)
 *
 *  This returns the collection object as the second argument in the
 *  callback function or an error as first argument
 * */
function getCollection (paramsDs, callback) {
    M.datasource.resolve(paramsDs, function(err, ds) {
        if (err) { return callback(400, err); }

        M.database.open(ds, function(err, db) {
            if (err) { return callback(400, err); }

            db.collection(ds.collection, function(err, collection) {
                if (err) { return callback(400, err); }

                callback(null, collection);
            });
        });
    });
}

/*
 *  This function looks for a custom handler to get
 *  the upload dir
 * */
function getUploadDir (link, callback) {

    var relativeUploadDir = link.params.uploadDir;

    // look for a custom handler
    if (link.params.customUpload) {

        M.emit(link.params.customUpload, { data: link.data, link: link }, function (customDir) {

            var customDirs = customDir.split("/");
            var uploadDir = M.app.getPath() + "/" + link.params.uploadDir;
            var DIRS_TO_CREATE = customDirs.length;

            for (var i in customDirs){

                uploadDir += "/" + customDirs[i];

                // create the directory
                fs.mkdir(uploadDir, function (err) {

                    // handle error
                    if (err && err.code !== "EEXIST") { return callback(err); }

                    if (!--DIRS_TO_CREATE) {
                        relativeUploadDir += "/" + customDir;
                        callback(null, uploadDir, customDir, relativeUploadDir);
                    }
                });
            }
        });
    } else {
        var uploadDir = M.app.getPath() + "/" + link.params.uploadDir;
        callback(null, uploadDir, relativeUploadDir);
    }
}

/*
 *  This function checks if the selected file has a correct
 *  extension (self.config.options.acceptTypes)
 * */
function checkFileType (ext, supportedExts) {

    ext = ext.replace(".", "");

    // the extension is not supported
    if (supportedExts.indexOf(ext) === -1) {
        return false;
    }

    // the extension is supported
    return true;
}
