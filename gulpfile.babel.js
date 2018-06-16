import gulp from 'gulp';
import help from 'gulp-help-four';
import _ from 'lodash';
import buildTasks from './build';
import config from './build/config';

help(gulp, {
    hideEmpty: true,
});

_.forOwn(buildTasks, (task) => {
    task.task(gulp);
});

gulp.task('build', 'Runs all build tasks',
  gulp.series(
      'clean',
      'transpile'
  )
);

gulp.task('quick', 'Quick build after changes', () => {
    gulp.watch([config.paths.src.js],
      gulp.series(
        'clean',
        'transpile',
      ),
    );
  });