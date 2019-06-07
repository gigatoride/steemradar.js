const pkg = require('./package.json');

if (pkg.version.includes('beta'))
  console.warn(
    'WARNING! this is a beta version, please note that some methods may change, read documentation for more info.'
  );
