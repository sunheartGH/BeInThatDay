let fs = require('fs');

let DEFAULT_EXCLUDE_DIR = /^\./;
let DEFAULT_FILTER = /^([^\.].*)\.js(on)?$/;
let DEFAULT_RECURSIVE = true;

module.exports = function requireAll(options) {
  let dirname = typeof options === 'string' ? options : options.dirname;
  let excludeDirs = options.excludeDirs === undefined ? DEFAULT_EXCLUDE_DIR : options.excludeDirs;
  let filter = options.filter === undefined ? DEFAULT_FILTER : options.filter;
  let modules = {};
  let recursive = options.recursive === undefined ? DEFAULT_RECURSIVE : options.recursive;
  let resolve = options.resolve || identity;
  let map = options.map || identity;

  function excludeDirectory(dirname) {
    return !recursive ||
      (excludeDirs && dirname.match(excludeDirs));
  }

  let files = fs.readdirSync(dirname);

  files.forEach(function (file) {
    let filepath = dirname + '/' + file;
    if (fs.statSync(filepath).isDirectory()) {

      if (excludeDirectory(file)) return;

      modules[map(file, filepath)] = requireAll({
        dirname: filepath,
        filter: filter,
        excludeDirs: excludeDirs,
        map: map,
        resolve: resolve
      });

    } else {
      let match = file.match(filter);
      if (!match) return;

      modules[map(match[1], filepath)] = resolve(require(filepath), file);
    }
  });

  return modules;
};

function identity(val) {
  return val;
}
