const through2 = require("through2");
const pluginError = require("plugin-error");
const dartSass = require("sass");
const applySourceMap = require("vinyl-sourcemaps-apply");
const path = require("path");

module.exports = (options = {}) => {
  return through2.obj((file, encoding, callback) => {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(
        new pluginError("gulp-dart-scss", "Streaming not supported")
      );
    }

    // Ignore _name.scss files
    if (path.basename(file.path).indexOf("_") === 0) {
      return callback();
    }

    (async () => {
      try {
        options.sourceMap = file.sourceMap ? file.path : false;
        options.file = file.path || options.file;

        const result = await dartSass.renderSync(options);
        file.contents = Buffer.from(result.css);

        // Replace .scss with .css
        file.path = path.join(
          path.dirname(file.path),
          path.basename(file.path, path.extname(file.path)) + ".css"
        );

        // Apply sourcemap if gulp-sourcemap is present
        if (result.map && file.sourceMap) {
          const map = JSON.parse(result.map);
          map.file = file.relative;
          map.sources = map.sources.map(source =>
            path.relative(file.base, source)
          );
          applySourceMap(file, map);
        }

        setImmediate(callback, null, file);
      } catch (error) {
        process.stderr.write(
          `${new pluginError("gulp-dart-scss", error.message).toString()} \r\n`
        );
        return callback();
      }
    })();
  });
};
