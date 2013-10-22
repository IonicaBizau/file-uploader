var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

module.exports = function(config) {

    // get self (the module)
    var self = this;

    // call events
    Events.call(self, config);

    // get the iframe from the module
    var $iframe = $("iframe", self.dom);

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
