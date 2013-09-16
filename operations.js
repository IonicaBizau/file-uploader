var fs = require("fs");

exports.upload = function (link) {

    if (!link.files || !link.files.file) {
        return link.send(400, { error: "Invalid upload" });
    }

    if (!link.params || !link.params.uploadDir || !link.params.dsUpload) {
        return link.send(400, { error: "Missing params: uploadDir or dsUpload." });
    }

    var uploadDir = M.app.getPath() + "/" + link.params.uploadDir;
    var uploadedFilePath = M.app.getPath() + "/" + link.files.file.path;

    var fileExt = link.files.file.name;
    fileExt = fileExt.substring(fileExt.lastIndexOf(".")) || "";

    var generatedId = uploadedFilePath.substring(uploadedFilePath.lastIndexOf("/") + 1);
    var newFilePath = uploadDir + "/" + generatedId + fileExt;

    getCollection(link.params.dsUpload, function (err, collection) {

        if (err) { return link.send(400, err); }

        var docToInsert = {
            fileName: link.files.file.name,
            extension: fileExt,
            absoluteFilePath: newFilePath,
            id: generatedId
        };

        docToInsert.filePath = link.params.uploadDir + "/" + docToInsert.id + docToInsert.extension;

        collection.insert(docToInsert, function (err, doc) {
            if (err) { return link.send(400, err); }

            doc = doc[0];
            fs.rename(uploadedFilePath, newFilePath, function (err) {

                if (err) { return link.send(400, err); }

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

                link.send(200, arg);
            });
        });
    });
};

// private functions
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
