// client/webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: path.resolve(__dirname, 'public'),
    historyApiFallback: true,
    port: 3000,
    hot: true,
    watchFiles: ['src/**/*'],
    client: {
      overlay: true,
    },
    // 🐢 Enable polling to fix hot reload in Docker
    watchOptions: {
      ignored: /node_modules/,
      poll: 1000, // check for file changes every second
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // add more loaders as needed
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};