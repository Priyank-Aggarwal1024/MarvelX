const { override, addWebpackPlugin, addWebpackResolve } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackResolve({
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url"),
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "zlib": require.resolve("browserify-zlib"),
    }
  }),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  )
);