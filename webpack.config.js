/* eslint-disable no-unused-vars*/
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const tools = require('./libs/webpack.tools');

// Init common paths used by config
const path = require('path');
const PATHS = {
  app: path.join(__dirname, 'browser/react'),
  build: path.join(__dirname, 'browser/build'),
  stylesheets: path.join(__dirname, 'browser/src/stylesheets', 'style.css'),
  html_template: path.join(__dirname, 'browser/src/index.html')
};

// Vendor dependencies, isolated for chunking
const vendorDependencies = [
  'gsap', 'react', 'react-dom'
]

// index.html template
let htmlTemplate = {
  title: 'Zipper SVG',
  template: PATHS.html_template
}

// Standard build artifacts for all envs
const common = {
  entry: {
    app: PATHS.app,
    style: PATHS.stylesheets
  },
  output: {
    path: PATHS.build,
    sourceMapFilename: '[file].map',
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new HtmlWebpackPlugin(htmlTemplate)
  ],
  module: {
    loaders: [
      {
        test: /jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
}

// Detect how npm is run and switch based on this
let config;
switch (process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: Object.assign(common.output, {
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js'
        })
      },
      tools.extractBundle({
        name: 'vendor',
        entries: vendorDependencies
      }),
      tools.clean(PATHS.build),
      tools.extractCSS(PATHS.stylesheets),
      tools.minify()
    );
    break;
  case 'build-watch':
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      tools.clean(PATHS.build),
      tools.extractCSS(PATHS.stylesheets)
    );
    break;
  case 'hmr':
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      tools.extractCSS(PATHS.stylesheets),
      tools.devServer({
        port: 3000
      })
    );
    break;
  default:
    console.log('No Webpack config specified')
    config = merge(common)
}

module.exports = validate(config, { quiet: true });
