/*globals google*/
var awesome = require('awesome-streetview');
var toBuffer = require('electron-canvas-to-buffer');
var render = require('google-panorama-equirectangular');
var googlePano = require('google-panorama-by-location');
var fs = require('fs');
var path = require('path');
var MAX_ZOOM = 4;

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    preference: 'p',
    radius: 'r',
    source: 's',
    output: 'o',
    zoom: 'z',
    format: 'f',
    quality: 'q'
  },
  string: [ 'format', 'source', 'preference', 'output' ]
});

var outFile = absolute(argv.output);
var latLon = argv._[0];
if (latLon) {
  // try to parse a URL
  var regex = /(?:google\..*maps\/\@)([0-9\-\.]+)\,([0-9\-\.]+)/i;
  var match = regex.exec(latLon);
  if (match) {
    latLon = [ match[1], match[2] ];
  } else {
    latLon = latLon.split(',').slice(0, 2).map(n => parseFloat(n));
  }
} else {
  latLon = awesome();
}

var zoom = argv.zoom;
if (zoom === 'max') {
  zoom = MAX_ZOOM;
} else if (typeof argv.zoom !== 'number') {
  zoom = 1;
}

googlePano(latLon, function (err, result) {
  if (err) throw err;
  render(result.id, {
    source: argv.source === 'outdoor'
      ? google.maps.StreetViewSource.OUTDOOR
      : google.maps.StreetViewSource.DEFAULT,
    preference: argv.preference === 'best'
      ? google.maps.StreetViewPreference.BEST
      : google.maps.StreetViewPreference.NEAREST,
    tiles: result.tiles,
    radius: argv.radius,
    crossOrigin: 'Anonymous',
    zoom: Math.min(MAX_ZOOM, zoom)
  }).on('complete', function (canvas) {
    var format = /jpe?g/i.test(argv.format) ? 'image/jpeg' : 'image/png';
    var buffer = toBuffer(canvas, format, argv.quality);
    write(buffer).catch(fail).then(() => window.close());
  });
});

function write (buf) {
  return new Promise(function (resolve, reject) {
    if (outFile) {
      fs.writeFile(outFile, buf, function (err) {
        if (err) reject(err);
        else resolve();
      });
    } else {
      process.stdout.write(buf, resolve);
    }
  });
}

function fail (err) {
  process.stderr.write(err.message + '\n');
  process.exit(1);
}

function absolute (file) {
  if (!file) return null;
  return path.isAbsolute(file)
    ? file
    : path.resolve(process.cwd(), file);
}
