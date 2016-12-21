/* eslint-disable no-unused-vars*/
const webpack = require('webpack');

// Init common paths used by config
const path = require('path');
const PATHS = {
  source: path.join(__dirname, 'browser/src'),
  build: path.join(__dirname, 'browser/build')
};

// Standard build artifacts for all envs
const config = {
  entry: PATHS.source,
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  resolve: {
    root: path.resolve(__dirname),
    extensions: ['', '.js'],
    alias: {
      'TweenLite': 'gsap/src/uncompressed/TweenLite.js',
      'CSSPlugin': 'gsap/src/uncompressed/plugins/CSSPlugin.js'
    }
  },
  module: {
    loaders: [
      {
        test: /jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};

module.exports = config;
