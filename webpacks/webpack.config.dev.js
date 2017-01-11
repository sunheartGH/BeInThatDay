const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

let config = {
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8080',
    './main.js'
  ],
  output: {
    path: '../public',
    filename: '[name].js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.vue$/,
      loader: 'vue'
    }]
  },
  vue: {
    loaders: {
      js: 'babel'
    }
  },
  resolve: {
    alias: {
      config: "./config.dev.js"
    }
  },
  plugins: [
    // new  webpack.optimize.CommonsChunkPlugin(['vue','vue-resource','vue-router'], 'libs/vue/[name].js'),
    new CopyWebpackPlugin([
      { from: 'node_modules/vue/dist/vue.js', to: 'libs/vue/vue.js' },
      { from: 'node_modules/vue-resource/dist/vue-resource.js', to: 'libs/vue/vue-resource.js' },
      { from: 'node_modules/vue-router/dist/vue-router.js', to: 'libs/vue/vue-router.js' },
      { from: 'node_modules/validator/validator.js', to: 'libs/validator/validator.js' },
      { from: 'node_modules/jquery/dist/jquery.js', to: 'libs/jquery/jquery.js' },
      { from: 'node_modules/semantic-ui/dist/semantic.js', to: 'libs/semantic/semantic.js' },
      { from: 'node_modules/semantic-ui/dist/semantic.css', to: 'libs/semantic/semantic.css' },
      { from: 'node_modules/semantic-ui/dist/themes/default', to: 'libs/semantic/themes/default' },
      { from: 'node_modules/quill/dist/quill.core.js', to: 'libs/quill/quill.core.js' },
      { from: 'node_modules/quill/dist/quill.js', to: 'libs/quill/quill.js' },
      { from: 'node_modules/quill/dist/quill.core.css', to: 'libs/quill/quill.core.css' },
      { from: 'node_modules/quill/dist/quill.snow.css', to: 'libs/quill/quill.snow.css' },
      { from: 'node_modules/moment/moment.js', to: 'libs/moment/moment.js' },
      { from: 'node_modules/socket.io-client/dist/socket.io.js', to: 'libs/socket.io/socket.io.js' },
      { from: 'node_modules/socket.io-client/dist/socket.io.js.map', to: 'libs/socket.io/socket.io.js.map' },
      { from: 'node_modules/xss/dist/xss.js', to: 'libs/xss/xss.js' },
      { from: 'utils/utils.js', to: 'libs/utils/utils.js' },
      { from: 'index.html', to: 'index.html' },
      { from: 'assets', to: 'assets' },
    ]),
  ],
  externals: {
    "vue": "Vue",
    "vue-router": "VueRouter",
    "utils": "Utils",
    "bus": "Bus",
    "quill": "Quill",
    "validator": "validator",
    "moment": "moment",
    "xss": "filterXSS",
    "io": "io",
  }
}

if (process.argv.includes("--devbuild")) {
  config.entry = {
    main: './main.js',
  }
}

module.exports = config;
