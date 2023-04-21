const webpack = require('webpack');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = {
  devtool: "source-map",
  plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new SentryWebpackPlugin({
        org: "smartpass-ec",
        project: "smartpass-frontend",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        include: "./dist",
      }),
  ]
};
