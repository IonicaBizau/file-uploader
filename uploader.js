var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

module.exports = function(config) {

    var self = this;
    Events.call(self, config);

    var $iframe = $("iframe", self.dom);
    $("form", self.dom).on("submit", function () {
        var $form = $(this);
        $iframe.off("load");
        $iframe.on("load", function () {
            var result = $(this.contentWindow.document).text();
            if (!result) { return; }

            var $inputFile = $form.find("input[type='file']");
            if (!$inputFile.val()) {
                return;
            }

            try {
                result = JSON.parse(result);
            } catch (e) {
                // nothing to do
            }

            self.emit("fileUploaded", result);

            var $iframeClone = $iframe.clone();
            $iframe.attr("src", "");

            $inputFile.replaceWith($inputFile.clone(true));
        });
    });

    self.emit("ready", config);
};
