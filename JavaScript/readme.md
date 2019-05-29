A folder for the book's code archive.

## Installation

From `code` folder:

```
nvm install stable

npm install -g mocha
npm install -g traceur
npm install -g chai
npm install -g should
npm install -g mocha-traceur
npm install -g jshint

npm install
```


## Run tests

From `code` folder:

```
mocha --compilers js:mocha-traceur test/*
```
