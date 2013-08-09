M.wrap('github/IonicaBizau/file-uploader/dev/main.js', function (require, module, exports) {
var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

module.exports = function(config) {

    var self = this;
    Events.call(self, config);

    $("form", self.dom).on("submit", function () {
        var oldHtml = $("iframe").contents().find("pre").html();

        // TODO Create dynamic iframes, instead of using intervals
        var interval = setInterval(function () {
            var newHtml = $("iframe").contents().find("pre").html();

            // html was changed
            if (newHtml !== oldHtml && newHtml) {
                oldHtml = newHtml;
                self.emit("fileId", newHtml);
                clearInterval(interval);
            }
        }, 100);
    });

    self.emit("ready", config);
};

// function fileUpload(form, action_url, div_id) {
//     // Create the iframe...
//     var iframe = document.createElement("iframe");
//     iframe.setAttribute("id", "upload_iframe");
//     iframe.setAttribute("name", "upload_iframe");
//     iframe.setAttribute("width", "0");
//     iframe.setAttribute("height", "0");
//     iframe.setAttribute("border", "0");
//     iframe.setAttribute("style", "width: 0; height: 0; border: none;");
//
//     // Add to document...
//     form.parentNode.appendChild(iframe);
//     window.frames['upload_iframe'].name = "upload_iframe";
//
//     iframeId = document.getElementById("upload_iframe");
//
//     // Add event...
//     var eventHandler = function () {
//
//             if (iframeId.detachEvent) iframeId.detachEvent("onload", eventHandler);
//             else iframeId.removeEventListener("load", eventHandler, false);
//
//             // Message from server...
//             if (iframeId.contentDocument) {
//                 content = iframeId.contentDocument.body.innerHTML;
//             } else if (iframeId.contentWindow) {
//                 content = iframeId.contentWindow.document.body.innerHTML;
//             } else if (iframeId.document) {
//                 content = iframeId.document.body.innerHTML;
//             }
//
//             document.getElementById(div_id).innerHTML = content;
//
//             // Del the iframe...
//             setTimeout('iframeId.parentNode.removeChild(iframeId)', 250);
//         }
//
//     if (iframeId.addEventListener) iframeId.addEventListener("load", eventHandler, true);
//     if (iframeId.attachEvent) iframeId.attachEvent("onload", eventHandler);
//
//     // Set properties of form...
//     form.setAttribute("target", "upload_iframe");
//     form.setAttribute("action", action_url);
//     form.setAttribute("method", "post");
//     form.setAttribute("enctype", "multipart/form-data");
//     form.setAttribute("encoding", "multipart/form-data");
//
//     // Submit the form...
//     form.submit();
//
//     document.getElementById(div_id).innerHTML = "Uploading...";
// }

return module; });
