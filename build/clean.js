// Deletes the compiled directory

import del from 'del';
import config from './config';

class clean {
  task(gulp) {
    gulp.task('clean', 'Deletes the compiled directory', this.action);
  }

  action() {
    return del(config.paths.dist.dir);
  }
}

export default new clean();