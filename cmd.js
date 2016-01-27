#!/usr/bin/env node
var path = require('path');
var file = path.resolve(__dirname, 'index.js');
var html = path.resolve(__dirname, 'index.html');

var args = [ file, '-hq', '--bf', '-i', html, '--' ];
require('devtool/bin/spawn')(args.concat(process.argv.slice(2)));
