
var Bind = require("github/jxmono/bind");
var Events = require("github/jxmono/events");
var Ui = require("./ui");

module.exports = function(config) {

    // get self (the module)
    var self = this;

    // config
    self.config = config;

    // process config
    processConfig(config);

    // call ui
    Ui.call(self);

    // get the iframe from the module
    var $iframe = $("iframe", self.dom);
    if (!$iframe.get(0)) {
        return console.error("Could not find the upload IFRAME in this module's DOM.");
    }

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
        if (acceptAttrValue && !checkFileType.call(self, this)) {
            // empty the value of file input
            // TODO is this supported on IE?
            $(this).val("");
        }
    });

    // forms on submit
    $("form", self.dom).on("submit", function () {

        // get submiited form
        var $form = $(this);

        // set the onload handler (the jQuery "load" event will not fire in IE)
        $iframe.get(0).onload = function() {

            // get text from the page
            var result = $(this.contentWindow.document).text();

            // if no result, return (a 2nd call happens in Webkit browsers with an empty result)
            if (!result) { return; }

            // parse the result
            try {
                result = JSON.parse(result);
            } catch (err) {
                self.emit("uploadFailed");
                console.error(err);
                return;
            }

            if (result.error || !result.success) {
                var error = result.error || "Upload Failed";
                self.emit("uploadFailed", error);
                return console.error(error);
            }

            // emit fileUploaded event and the result
            self.emit("fileUploaded", result.success);

            // get file input jQuery object
            var $inputFile = $form.find("input[type='file']");

            // verify its value
            if (!$inputFile.val()) { return; }

            // set src of iframe
            $iframe.attr("src", "");

            // replace the file input
            $inputFile.replaceWith($inputFile.clone(true));
        };
    });

    // listen to events
    self.on("setData", setData);
    self.on("setTemplate", setTemplate);
    self.on("removeItem", removeItem);

    // handle rendering / wait for external event before rendering to fix render order of uploader containers
    self.waitForEvent = false;
    self.renderingEnabled = false;
    self.on("enableRendering", function () {

        if (self.waitForEvent) {
            self.renderingEnabled = false;

            if (self.template) {
                self.emit("renderUi");
            }
        } else {
            self.renderingEnabled = true;
        }
    });

    // call events
    Events.call(self, config);

    // emit ready event
    self.emit("ready", config);
};

function setTemplate (template) {
    var self = this;

    var template = typeof template === 'string' ? template : (template.id || template._id);
    // check template
    if (!template) {
        // TODO handle error
        return console.error('Invalid upload template');
    }

    self.emit('find', [template], function (err, templates) {

        for (var key in templates) {
            if (!templates.hasOwnProperty(key)) continue;

            if (templates[key]._id === template) {
                self.template = templates[key];
            }
        }

        // TODO handle error
        if (err || !self.template) {
            return console.error(err);
        }

        // clear the hidden input template value
        if ($(".hiddenTemplateValue", $("form", self.dom)).length) {
            $(".hiddenTemplateValue", $("form", self.dom)).val("");
        }

        // do not render uploader controls if no configuration is present
        if (!self.template.options || !self.template.options.uploader) { return; }
        self.uploaderConfig = self.template.options.uploader;

        // clear the renderBuffer
        renderBuffer = [];

        // add template id value to form
        if ($(".hiddenTemplateValue", $("form", self.dom)).length) {
            $(".hiddenTemplateValue", $("form", self.dom)).val(self.template._id);
        } else {
            var $input = $("<input class='hiddenTemplateValue hide' type='hidden' name='templateId'>");
            $("form", self.dom).append($input);
            $input.val(self.template._id);
        }

        // check if template needs to wait for an external event to begin rendering
        if (self.uploaderConfig.waitForEvent) {

            // check if render enabled by event
            if (self.renderingEnabled) {
                self.emit("renderUi");
            } else {
                self.waitForEvent = true;
            }

            self.renderingEnabled = false;
        } else {
            self.renderingEnabled = false;
            self.emit("renderUi");
        }
    });
}

/*
 * This function makes a request to the remove operation to delete a file
 * */
function removeItem (data) {
    var self = this;

    // build data object
    if (typeof data === 'string') {
        data = {
            itemId: data
        };
    }

    self.link('remove', { data: data }, function (err, data) {

        if (err) {
            return;
        }

        self.emit('itemRemoved');
    });
}

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
 *  This function appends to the upload form hidden inputs with values
 *  from the selected table item
 * */
function setData (data) {
    var self = this;

    // create container for hidden data
    var $form = $("form", self.dom);
    if ($(".hiddenDataContainer", $form).length) {
        var $container = $(".hiddenDataContainer", $form);
    } else {
        var $container = $("<div class='hiddenDataContainer hide'></div>");
        $form.append($container);
    }

    self.formData = data;
    // add hidden inputs to container
    $container.html(buildHiddenData(data, ""));
}

/*
 * This function creates the hidden inputs that will be appended to the form
 * */
function buildHiddenData (data, path) {

    var inputs = "";
    for (var key in data) {
        if (key[0] !== '_' && data.hasOwnProperty(key)) {

            // build the object path
            var objPath = path.length ? (path + "." + key) : key;
            if (typeof data[key] === "object") {
                inputs += buildHiddenData(data[key], objPath);
            } else {
                inputs += '<input type="hidden" class="hide" name="' + objPath + '" value="' + data[key] + '">';
            }
        }
    }

    return inputs;
}

/*
 *  Process config
 *
 * */
function processConfig (config) {
    config.options = config.options || {};
    config.options.acceptTypes = config.options.acceptTypes || [];
}
