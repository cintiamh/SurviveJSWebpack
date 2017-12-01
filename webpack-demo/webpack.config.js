const webpack = require('webpack');
const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const glob = require('glob');

const parts = require('./webpack.parts');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

const commonConfig = merge([
  {
    output: {
      path: PATHS.build,
      filename: '[name].js',
    },
  },
  parts.lintCSS({ include: PATHS.app }),
  parts.babel(),
  parts.loadFonts({
    options: {
      name: '[name].[hash:8].[ext]',
    }
  }),
  parts.loadJavaScript({ include: PATHS.app }),
]);

const productionConfig = () => merge([
  {
    performance: {
      hints: "warning",
      maxEntrypointSize: 50000,
      maxAssetSize: 450000,
    },
    output: {
      chunkFilename: "[name].[chunkhash:8].js",
      filename: "[name].[chunkhash:8].js",
    }
  },
  parts.clean(PATHS.build),
  parts.minifyJavaScript(),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // run cssnano in safe mode to avoid unsafe transformations
      safe: true,
    },
  }),
  {
    entry: {
      vendor: ['react', 'react-dom'],
    },
  },
  parts.generateSourceMaps({ type: 'source-map' }),
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()],
  }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[hash:8].[ext]',
    },
  }),
  parts.extractBundles([
    {
      name: 'vendor'
    },
    {
      name: 'manifest',
      minChunks: Infinity,
    },
  ]),
  parts.attachRevision(),
  parts.setFreeVariable("process.env.NODE_ENV", "production"),
]);

const developmentConfig = () => merge([
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
]);

module.exports = (env) => {
  const pages = [
    parts.page({
      title: 'Webpack demo',
      entry: {
        app: PATHS.app,
      },
      chunks: ["app", "manifest", "vendor"],
    }),
    parts.page({
      title: 'Another demo',
      path: 'another',
      entry: {
        another: path.join(PATHS.app, "another.js"),
      },
      chunks: ["another", "manifest", "vendor"],
    }),
  ];
  const config = env === "production" ? productionConfig : developmentConfig;
  return merge([commonConfig, config].concat(pages));
}
