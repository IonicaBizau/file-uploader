M.wrap('github/IonicaBizau/file-uploader/dev/main.js', function (require, module, exports) {
var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

module.exports = function(config) {

    var self = this;
    Events.call(self, config);

    var $iframe = $("iframe", self.dom);
    $("form", self.dom).on("submit", function () {
        $iframe.off("load");
        $iframe.on("load", function () {
            var result = $(this.contentWindow.document).text();
            if (!result) { return; }

            try {
                result = JSON.parse(result);
            } catch (e) {}
            
            console.log(">>> file submitted");
            
            self.emit("fileUploaded", result);

            var $iframeClone = $iframe.clone();
            $iframe.attr("src", "");

            var $inputTypeFile = $("input[type=file]", self.dom);
            $inputTypeFile.replaceWith($inputTypeFile.clone(true));
        });
    });

    self.emit("ready", config);
};

return module; });
