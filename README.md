# gulp-dart-scss

Gulp plugin to compile Sass using the Dart Sass compiler.

> Made to work with bleeding edge versions of the compiler for internal projects.

## Install

`npm i --save-dev gulp-dart-scss`

## Usage

```js
const gulp = require("gulp");
const scss = require("gulp-dart-scss");

export function compileScss() {
  return gulp
    .src("./src/main.scss")
    .pipe(
      scss({
        // Optional option object - See dart-sass for API
      })
    )
    .pipe(gulp.dest("./dist/css"));
}
```
