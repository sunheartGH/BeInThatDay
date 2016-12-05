const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './main.js',
    // 'vue': ['vue'],
    // 'vue-router': ['vue-router'],
    // 'vue-resource': ['vue-resource'],
  },
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
  plugins: [
    // new  webpack.optimize.CommonsChunkPlugin(['vue','vue-resource','vue-router'], 'libs/vue/[name].js'),
    new CopyWebpackPlugin([
      { from: 'node_modules/vue/dist/vue.js', to: 'libs/vue/vue.js' },
      { from: 'node_modules/vue-resource/dist/vue-resource.js', to: 'libs/vue/vue-resource.js' },
      { from: 'node_modules/vue-router/dist/vue-router.js', to: 'libs/vue/vue-router.js' },
      { from: 'utils/utils.js', to: 'libs/utils/utils.js' },
      { from: 'index.html', to: 'index.html' },
    ]),
  ],
  externals: {
    "vue": "Vue",
    "vue-router": "VueRouter",
    "utils": "Utils",
    "bus": "Bus",
  }
}
