# gulp-dart-scss

Gulp plugin to compile Sass (.scss) to CSS using the [Dart Sass compiler](https://github.com/sass/dart-sass).

> Made to work with latest version of the JavaScript based compiler.

## Install

`npm i gulp-dart-scss`

## Usage

```js
const gulp = require("gulp");
const scss = require("gulp-dart-scss");

export function compileScss() {
  return gulp
    .src("./src/main.scss")
    .pipe(
      scss({
        // Optional option object - See below or sass for API
      })
    )
    .pipe(gulp.dest("./dist/css"));
}
```

## Options

From [node-sass](https://github.com/sass/node-sass/)

### file

- Type: `String`
- Default: `null`

**Special**: `file` or `data` must be specified

Path to a file for [LibSass] to compile.

### data

- Type: `String`
- Default: `null`

**Special**: `file` or `data` must be specified

A string to pass to [LibSass] to compile. It is recommended that you use `includePaths` in conjunction with this so that [LibSass] can find files when using the `@import` directive.

### importer (>= v2.0.0) - _experimental_

**This is an experimental LibSass feature. Use with caution.**

- Type: `Function | Function[]` signature `function(url, prev, done)`
- Default: `undefined`

Function Parameters and Information:

- `url (String)` - the path in import **as-is**, which [LibSass] encountered
- `prev (String)` - the previously resolved path
- `done (Function)` - a callback function to invoke on async completion, takes an object literal containing
  - `file (String)` - an alternate path for [LibSass] to use **OR**
  - `contents (String)` - the imported contents (for example, read from memory or the file system)

Handles when [LibSass] encounters the `@import` directive. A custom importer allows extension of the [LibSass] engine in both a synchronous and asynchronous manner. In both cases, the goal is to either `return` or call `done()` with an object literal. Depending on the value of the object literal, one of two things will happen.

When returning or calling `done()` with `{ file: "String" }`, the new file path will be assumed for the `@import`. It's recommended to be mindful of the value of `prev` in instances where relative path resolution may be required.

When returning or calling `done()` with `{ contents: "String" }`, the string value will be used as if the file was read in through an external source.

Starting from v3.0.0:

- `this` refers to a contextual scope for the immediate run of `sass.render` or `sass.renderSync`

- importers can return error and LibSass will emit that error in response. For instance:

  ```javascript
  done(new Error("doesn't exist!"));
  // or return synchronously
  return new Error("nothing to do here");
  ```

- importer can be an array of functions, which will be called by LibSass in the order of their occurrence in array. This helps user specify special importer for particular kind of path (filesystem, http). If an importer does not want to handle a particular path, it should return `null`. See [functions section](#functions--v300---experimental) for more details on Sass types.

### functions (>= v3.0.0) - _experimental_

**This is an experimental LibSass feature. Use with caution.**

`functions` is an `Object` that holds a collection of custom functions that may be invoked by the sass files being compiled. They may take zero or more input parameters and must return a value either synchronously (`return ...;`) or asynchronously (`done();`). Those parameters will be instances of one of the constructors contained in the `require('node-sass').types` hash. The return value must be of one of these types as well. See the list of available types below:

#### types.Number(value [, unit = ""])

- `getValue()`/ `setValue(value)` : gets / sets the numerical portion of the number
- `getUnit()` / `setUnit(unit)` : gets / sets the unit portion of the number

#### types.String(value)

- `getValue()` / `setValue(value)` : gets / sets the enclosed string

#### types.Color(r, g, b [, a = 1.0]) or types.Color(argb)

- `getR()` / `setR(value)` : red component (integer from `0` to `255`)
- `getG()` / `setG(value)` : green component (integer from `0` to `255`)
- `getB()` / `setB(value)` : blue component (integer from `0` to `255`)
- `getA()` / `setA(value)` : alpha component (number from `0` to `1.0`)

Example:

```javascript
var Color = require("node-sass").types.Color,
  c1 = new Color(255, 0, 0),
  c2 = new Color(0xff0088cc);
```

#### types.Boolean(value)

- `getValue()` : gets the enclosed boolean
- `types.Boolean.TRUE` : Singleton instance of `types.Boolean` that holds "true"
- `types.Boolean.FALSE` : Singleton instance of `types.Boolean` that holds "false"

#### types.List(length [, commaSeparator = true])

- `getValue(index)` / `setValue(index, value)` : `value` must itself be an instance of one of the constructors in `sass.types`.
- `getSeparator()` / `setSeparator(isComma)` : whether to use commas as a separator
- `getLength()`

#### types.Map(length)

- `getKey(index)` / `setKey(index, value)`
- `getValue(index)` / `setValue(index, value)`
- `getLength()`

#### types.Null()

- `types.Null.NULL` : Singleton instance of `types.Null`.

#### Example

```javascript
sass.renderSync({
  data: "#{headings(2,5)} { color: #08c; }",
  functions: {
    "headings($from: 0, $to: 6)": function (from, to) {
      var i,
        f = from.getValue(),
        t = to.getValue(),
        list = new sass.types.List(t - f + 1);

      for (i = f; i <= t; i++) {
        list.setValue(i - f, new sass.types.String("h" + i));
      }

      return list;
    },
  },
});
```

### includePaths

- Type: `Array<String>`
- Default: `[]`

An array of paths that [LibSass] can look in to attempt to resolve your `@import` declarations. When using `data`, it is recommended that you use this.

### indentedSyntax

- Type: `Boolean`
- Default: `false`

`true` values enable [Sass Indented Syntax](https://sass-lang.com/documentation/file.INDENTED_SYNTAX.html) for parsing the data string or file.

**Note:** node-sass/libsass will compile a mixed library of scss and indented syntax (.sass) files with the Default setting (false) as long as .sass and .scss extensions are used in filenames.

### indentType (>= v3.0.0)

- Type: `String`
- Default: `space`

Used to determine whether to use space or tab character for indentation.

### indentWidth (>= v3.0.0)

- Type: `Number`
- Default: `2`
- Maximum: `10`

Used to determine the number of spaces or tabs to be used for indentation.

### linefeed (>= v3.0.0)

- Type: `String`
- Default: `lf`

Used to determine whether to use `cr`, `crlf`, `lf` or `lfcr` sequence for line break.

### omitSourceMapUrl

- Type: `Boolean`
- Default: `false`

**Special:** When using this, you should also specify `outFile` to avoid unexpected behavior.

`true` values disable the inclusion of source map information in the output file.

### outFile

- Type: `String | null`
- Default: `null`

**Special:** Required when `sourceMap` is a truthy value

Specify the intended location of the output file. Strongly recommended when outputting source maps so that they can properly refer back to their intended files.

**Attention** enabling this option will **not** write the file on disk for you, it's for internal reference purpose only (to generate the map for example).

Example on how to write it on the disk

```javascript
sass.render({
    ...
    outFile: yourPathTotheFile,
  }, function(error, result) { // node-style callback from v3.0.0 onwards
    if(!error){
      // No errors during the compilation, write this result on the disk
      fs.writeFile(yourPathTotheFile, result.css, function(err){
        if(!err){
          //file written on disk
        }
      });
    }
  });
});
```

### outputStyle

- Type: `String`
- Default: `nested`
- Values: `nested`, `expanded`, `compact`, `compressed`

Determines the output format of the final CSS style.

### precision

- Type: `Integer`
- Default: `5`

Used to determine how many digits after the decimal will be allowed. For instance, if you had a decimal number of `1.23456789` and a precision of `5`, the result will be `1.23457` in the final CSS.

### sourceComments

- Type: `Boolean`
- Default: `false`

`true` Enables the line number and file where a selector is defined to be emitted into the compiled CSS as a comment. Useful for debugging, especially when using imports and mixins.

### sourceMap

- Type: `Boolean | String | undefined`
- Default: `undefined`

Enables source map generation during `render` and `renderSync`.

When `sourceMap === true`, the value of `outFile` is used as the target output location for the source map with the suffix `.map` appended. If no `outFile` is set, `sourceMap` parameter is ignored.

When `typeof sourceMap === "string"`, the value of `sourceMap` will be used as the writing location for the file.

### sourceMapContents

- Type: `Boolean`
- Default: `false`

`true` includes the `contents` in the source map information

### sourceMapEmbed

- Type: `Boolean`
- Default: `false`

`true` embeds the source map as a data URI

### sourceMapRoot

- Type: `String`
- Default: `undefined`

the value will be emitted as `sourceRoot` in the source map information
