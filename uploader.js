var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

module.exports = function(config) {

    // get self (the module)
    var self = this;

    // config
    self.config = config;

    // process config
    processConfig(config);

    // call events
    Events.call(self, config);

    // get the iframe from the module
    var $iframe = $("iframe", self.dom);

    // get file inputs
    var $fileInputs = $("input[type='file']", self.dom);

    // create the accept attr value
    var acceptAttrValue = "";

    // for every file type
    for (var i = 0; i < self.config.options.acceptTypes.length; ++i) {

        // get current type
        var cType = self.config.options.acceptTypes[i];

        // append it to the attr value string
        acceptAttrValue += "." + cType + ",";
    }

    // remove last comma
    acceptAttrValue = acceptAttrValue.substring(0, acceptAttrValue.length - 1);

    // set accept attr
    $fileInputs.attr("accept", acceptAttrValue);

    // file input change event
    $fileInputs.on("change", function () {
        // is the file accepted?
        if (!checkFileType.call(self, this)) {
            // empty the value of file input
            // TODO is this supported on IE?
            $(this).val("");
        }
    });

    // forms on submit
    $("form", self.dom).on("submit", function () {

        // get submiited form
        var $form = $(this);

        // unset the load handler
        $iframe.off("load");

        // set it again
        $iframe.on("load", function () {

            // get text from the page
            var result = $(this.contentWindow.document).text();

            // if no result, return
            if (!result) { return; }

            // get file input jQuery object
            var $inputFile = $form.find("input[type='file']");

            // verify its value
            if (!$inputFile.val()) {
                return;
            }

            // try to parse result
            try {
                result = JSON.parse(result);
            } catch (e) {
                // nothing to do
            }

            // emit fileUploaded event and the result
            self.emit("fileUploaded", result);

            // set src of iframe
            $iframe.attr("src", "");

            // replace the file input
            $inputFile.replaceWith($inputFile.clone(true));
        });
    });

    // emit ready event
    self.emit("ready", config);
};

/*
 *  This function checks if the selected file has a correct
 *  extension (self.config.options.acceptTypes)
 * */
function checkFileType (fileInput) {
    // get self
    var self = this;

    // get file extension
    var extension = fileInput.value.split(".").reverse()[0];

    // the extension is not supported
    if (self.config.options.acceptTypes.indexOf(extension) === -1) {
        return false;
    }

    // the extension is supported
    return true;
}

/*
 *  Process config
 *
 * */
function processConfig (config) {
    config.options = config.options || {};
    config.options.acceptTypes = config.options.acceptTypes || [];
}
