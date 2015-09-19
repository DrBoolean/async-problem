'use strict';

const fs = require('fs');
const path = require('path');

const Future = require('data.task');
const R = require('ramda');

// join :: String -> String -> String
const join = R.curryN(2, path.join);

// data Text = Buffer | String
// readFile :: String -> String -> Future Error Text
const readFile = R.curry((encoding, filename) =>
  new Future((rej, res) =>
    fs.readFile(filename, encoding, (e, data) => e ? rej(e) : res(data))
  )
)

// traverse :: Applicative f => (a -> f b) -> t a -> f (t b)
const traverse = f => R.compose(R.commute(Future.of), R.map(f))


// parseAndReadFiles :: String -> String -> Future Error String
const parseAndReadFiles = dir => R.compose( R.map(R.join(''))
                                          , traverse(readFile('utf8'))
                                          , R.map(join(dir))
                                          , R.match(/^.*(?=\n)/gm)
                                          )

// concatFiles :: String -> Future Error String
const concatFiles = dir => R.compose( R.chain(parseAndReadFiles(dir))
                                    , readFile('utf8')
                                    , join(dir)
                                    )('/index.txt')

// write :: Object -> * -> *
const write = R.flip(R.invoker(1, 'write'))

const main = () => {
  concatFiles(process.argv[2])
  .fork(write(process.stderr), write(process.stdout))
}

if (process.argv[1] === __filename) main()
