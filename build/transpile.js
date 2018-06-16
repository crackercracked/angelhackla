// Transpiles ES6 to ES5

let gulpRef = null;
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import config from './config';

class transpile {
  task (gulp) {
    gulpRef = gulp;

    gulp.task('transpile', 'Transpiles ES6 to ES5', this.action);
  }

  action () {
    return gulpRef.src(config.paths.src.js)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: '../src',
    }))
    .pipe(gulpRef.dest(config.paths.dist.dir));
  }
}

export default new transpile();