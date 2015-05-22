M.wrap('github/jillix/file-uploader/new-uploader-dev5/ui.js', function (require, module, exports) {
function init () {
    var self = this;

    // init controls
    self.uploaderConfig = self.uploaderConfig || {};
    self.uploaderConfig.controls = self.uploaderConfig.controls || {};
    self.uploaderConfig.controls.select = self.uploaderConfig.controls.select || ".btn-upload-select";
    self.uploaderConfig.controls.upload = self.uploaderConfig.controls.upload || ".btn-upload-start";
    self.uploaderConfig.controls.fileName = self.uploaderConfig.controls.fileName || ".upload-file-name";
    self.config.options = self.config.options || {};
    self.config.options.ui = self.config.options.ui || {};
    self.config.options.ui.upload = self.config.options.ui.upload || ".uploadBtn";

    // listen for internal events
    self.on("renderUi", renderUi);

    // reset controls after upload finished
    self.on("fileUploaded" , resetControls);
    self.on("uploadFailed" , resetControls);
    self.on("reset", resetControls);
}

function renderUi () {
    var self = this;

    // do not render uploader controls if no configuration is present
    if (!self.template) {
        return;
    }
    if (!self.uploaderConfig.uploaders || !self.uploaderConfig.html) {
        return console.error("Uploader configuration missing core properties");
    }

    // stop here if no uploaders configured
    if (!Object.keys(self.uploaderConfig.uploaders).length) {
        return;
    }

    // get upload template html if not in cache
    self.uploadTemplateCache = self.uploadTemplateCache || {};
    if (!self.uploadTemplateCache[self.template._id]) {
        var htmlToGet = self.template.options.uploader.html;

        // handle i18n
        if (typeof htmlToGet === "object") {
            htmlToGet = htmlToGet[M.getLocale()];
        }
        if (!htmlToGet) { return; }

        // fetch html
        self.link(htmlToGet, function (err, html) {

            if (err || !html) {
                return;
            }

            // cache html
            self.uploadTemplateCache[self.template._id] = html;

            // render uploaders controls
            finishRendering.call(self);
        });
    } else {
        // render uploaders controls
        finishRendering.call(self);
    }
}

function finishRendering () {
    var self = this;
    self.uploaders = {};

    // get permissions
    self.link("getUploadPermissions", { data: { template: self.template } }, function (err, permissions) {

        if (err) {
            console.error(err);
            return;
        }

        for (var key in self.uploaderConfig.uploaders) {
            if (!self.uploaderConfig.uploaders[key].container) continue;

            var $container = $(self.uploaderConfig.uploaders[key].container);
            if (permissions[key] && $container.length) {
                $container.html($(self.uploadTemplateCache[self.template._id]));
                self.uploaders[key] = {};
                self.uploaders[key].ref = $container;
            }
        }

        setupControls.call(self);
        self.emit("uploadersRendered");
    });
}

function setupControls () {
    var self = this;
    var $lastUploadUsed = '';

    // listen for uploader events
    for (var uploader in self.uploaders) {
        if (!self.uploaders.hasOwnProperty(uploader)) continue;

        (function (uploader) {
            self.uploaders[uploader].ref.find(self.uploaderConfig.controls.select).on("click", function () {
                $("[type=file]", $("form", self.dom)).click();

                // slect the filename in next to the select
                $lastUploadUsed = $(self.uploaderConfig.controls.fileName, self.uploaders[uploader].ref.has($(this)));

                // add uploader value to form
                if ($(".hiddenUploaderValue", $("form", self.dom)).length) {
                    $(".hiddenUploaderValue", $("form", self.dom)).val(uploader);
                } else {
                    var $input = $("<input class='hiddenUploaderValue hide' type='hidden' name='uploader'>");
                    $("form", self.dom).append($input);
                    $input.val(uploader);
                }
            });

            self.uploaders[uploader].ref.find(self.uploaderConfig.controls.upload).on("click", function () {
                $(self.config.options.ui.upload, $("form", self.dom)).click();
            });
        })(uploader);
    }

    // listen for file-name value change
    $("[type=file]", $("form", self.dom)).on("change", function () {
        if (!$(this).val()) {
            return resetFileName($(self.uploaderConfig.controls.fileName));
        }

        if ($lastUploadUsed.length) {
            resetFileName($(self.uploaderConfig.controls.fileName));
            $lastUploadUsed.html(($(this).val()).replace(/^.*[\\\/]/, ''));
        }
    });

    // disable upload buttons on submit
    $(self.dom).on("submit", "form", function () {
        $(self.uploaderConfig.controls.upload).prop('disabled', true);
    });
}

function resetFileName ($element) {
    $element.html({
        de: "Keine Datei ausgewählt",
        fr: "Aucun fichier sélectionné",
        it: "Nessun file selezionato"
    }[M.getLocale()]);
}

function resetControls () {
    var self = this;

    // reset file names
    resetFileName($(self.uploaderConfig.controls.fileName));

    // enable upload buttons
    $(self.uploaderConfig.controls.upload).prop('disabled', false);

    // reset upload value
    $("[type=file]", self.dom).val("");

    // clear the hidden input uploader value
    if ($(".hiddenUploaderValue", $("form", self.dom)).length) {
        $(".hiddenUploaderValue", $("form", self.dom)).val("");
    }
}

module.exports = init;

return module; });