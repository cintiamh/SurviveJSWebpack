const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const glob = require('glob');

const parts = require('./webpack.parts');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

const commonConfig = merge([
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
    ],
  },
  parts.lintCSS({ include: PATHS.app }),
  parts.babel(),
  parts.loadFonts({
    options: {
      name: '[name].[ext]',
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
      name: '[name].[ext]',
    },
  }),
  parts.extractBundles([
    {
      name: 'vendor'
    },
  ]),
  parts.attachRevision(),
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
  if (env === 'production') {
    return merge([
      commonConfig,
      productionConfig()
    ]);
  }
  return merge([
    commonConfig,
    developmentConfig()
  ]);
}
