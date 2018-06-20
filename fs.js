const fs = require('fs');
const { Observable } = require('rxjs/Observable');

const readFile = (path, options = { encoding: null, flag: 'r' }) =>
  Observable.create(observer =>
    fs.readFile(path, options, (e, data) => {
      if (e) {
        observer.error(e);
      }
      observer.next(data);
      observer.complete();
    })
  );

const writeFile = (file, data = '', options = {}) =>
  Observable.create(observer =>
    fs.writeFile(file, data, options, e => {
      if (e) {
        observer.error(e);
      }
      observer.complete();
    })
  );

const mkdir = (path, mask) =>
  Observable.create(observer =>
    fs.mkdir(path, mask, e => {
      if (e) {
        // ignore the error if the folder already exists
        if (e.code === 'EEXIST') {
          observer.complete();
        } else {
          observer.error(e);
        } // something else went wrong
      } else {
        observer.complete();
      }
    })
  );

const copyFile = (src, dest, flags = 0) =>
  Observable.create(observer =>
    fs.copyFile(src, dest, flags, e => {
      if (e) {
        observer.error(e);
      }
      observer.complete();
    })
  );

module.exports = {
  readFile,
  writeFile,
  mkdir,
  copyFile,
};
