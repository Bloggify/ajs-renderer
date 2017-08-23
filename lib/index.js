"use strict";

const readFile = require("read-file-cache")
    , noop = require("noop6")
    , ajs = require("ajs")
    , typpy = require("typpy")
    ;

let disableCache = false;

/*!
 * init
 *
 * @name init
 * @function
 * @param {Object} config The configuration object:
 *
 *  - `disableCache` (Boolean): If `true`, the cache will be disabled.
 */
exports.init = function (config) {
    disableCache = config.disableCache;
    Bloggify.renderer.registerRenderer("ajs", exports.render);
};

/*!
 * factory
 * Returns a HTTP request handler.
 *
 * @name factory
 * @function
 * @param {Function} cb The callback function.
 * @returns {Function} The request handler.
 */
exports.factory = cb => {
    return function (ctx) {
        return cb((path, data, cb) => {
            return exports.render(ctx, path, data, cb);
        }, ctx);
    };
};

/*!
 * render
 * Renders the file.
 *
 * @name render
 * @function
 * @param {ctx} ctx The context.
 * @param {String} path The file path.
 * @param {Object} data The template data.
 * @param {Function} cb The callback function.
 */
exports.render = function (ctx, tmpl, data, cb) {
    cb = cb || noop;
    ajs.renderFile(tmpl.path, data, { cache: !disableCache }, function (err, html) {
        if (err) {
            return cb(err);
        }

        data.statusCode = data.statusCode || (data.error && data.error.statusCode || 200);
        ctx.end(html, data.statusCode);

        cb(null, html);
    });
};
