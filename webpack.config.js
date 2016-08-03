var webpack = require('webpack');
var fs = require('fs');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/build',
        filename: 'ehr.user.js'
    },
    module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
              presets: ['es2015', 'stage-3']
            }
          }
        ]
    },
    plugins: [
      new webpack.BannerPlugin(fs.readFileSync('./src/header.js', 'utf8'), { 'raw': true, 'entryOnly': true })
    ]
};