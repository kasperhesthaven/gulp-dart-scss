const PluginError = require("plugin-error");
const Transform = require("stream").Transform;
const path = require("path");
const applySourceMap = require("vinyl-sourcemaps-apply");
const dartSass = require("sass");

const PLUGIN_NAME = "gulp-dart-scss";

module.exports = (options = {}) => {
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      // Return chunk if not scss extension
      if (path.extname(chunk.path) !== ".scss") {
        return callback(null, chunk);
      }

      // Ignore if empty or null
      if (chunk._contents.length === 0 || chunk.isNull()) {
        return callback(null);
      }

      // Ignore _name.scss files
      if (path.basename(chunk.path).indexOf("_") === 0) {
        return callback(null);
      }

      if (chunk.isBuffer()) {
        options.sourceMap = chunk.sourceMap ? chunk.path : false;
        options.file = chunk.path || options.file;

        // Rename extension
        chunk.path = path.join(
          path.dirname(chunk.path),
          path.basename(chunk.path, path.extname(chunk.path)) + ".css"
        );

        try {
          const renderResult = dartSass.renderSync(options);
          chunk._contents = Buffer.from(renderResult.css);

          if (renderResult.map && chunk.sourceMap) {
            const map = JSON.parse(renderResult.map);
            map.file = chunk.relative;
            map.sources = map.sources.map((source) =>
              path.relative(chunk.base, source)
            );
            applySourceMap(chunk, map);
          }

          return callback(null, chunk);
        } catch (error) {
          return callback(
            new PluginError(PLUGIN_NAME, error.message, {
              fileName: chunk.relative,
            })
          );
        }
      } else if (chunk.isStream()) {
        return callback(
          new PluginError(PLUGIN_NAME, "Streaming is not supported.")
        );
      }
    },
  });
};
