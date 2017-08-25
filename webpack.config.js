var webpack = require('webpack');
var fs = require('fs');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: __dirname + '/build',
    filename: 'ehr.user.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.(?:ts|js)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  plugins: [
    new webpack.BannerPlugin({ banner: fs.readFileSync('./src/header.js', 'utf8'), raw: true, entryOnly: true })
  ]
};
