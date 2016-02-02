#!/usr/bin/env node
var path = require('path');
var file = path.resolve(__dirname, 'index.js');
var html = path.resolve(__dirname, 'index.html');

var headless = process.env.NODE_ENV === 'development' ? '' : '-hq';
var args = [ file, headless, '--bf', '-c', '-i', html, '--' ];
require('devtool/bin/spawn')(args.concat(process.argv.slice(2)));
