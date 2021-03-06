'use strict';

const fs = require('fs');
const path = require('path');

const bluebird = require('bluebird');
const R = require('ramda');


// readFile :: String -> String -> Promise String
const readFile = R.curry((encoding, filename) =>
  bluebird.promisify(fs.readFile)(filename, {encoding: encoding})
);

// readFiles :: String -> [String] -> Promise [String]
const readFiles = R.curry((encoding, filenames) =>
  bluebird.all(R.map(readFile(encoding), filenames))
);

// walk :: String -> Promise String
const walk = bluebird.coroutine(function*(dir) {
  const pathTo = (filename) => path.join(dir, filename);
  const index = yield readFile('utf8', pathTo('index.txt'));
  const filenames = index.match(/^.*(?=\n)/gm).map(pathTo);
  const results = yield readFiles('utf8', filenames);
  return results.join('');
});


const main = () => {
  walk(process.argv[2])
    .catch(s => process.stderr.write(s))
    .then(s => process.stdout.write(s));
};

if (process.argv[1] === __filename) main();
