const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    historyApiFallback: true,
    // output errors only
    stats: 'errors-only',
    host,
    port,
    overlay: {
      errors: true,
      warnings: true,
    }
  }
});

exports.lintJavaScript = ({ include, exclude, options }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          // emitWarning: true
        }
      }
    ]
  }
});

exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'css-loader',
        options: {
          modules: true
        }
      }
    ],
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});

exports.extractCSS = ({ include, exclude, use }) => {
  // Output extracted CSS to a file
  const plugin = new ExtractTextPlugin({
    filename: '[name].css',
  });
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,
          use: plugin.extract({
            use,
            fallback: 'style-loader',
          }),
        },
      ],
    },
    plugins: [plugin],
  };
};

exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => ([
      require('autoprefixer')(),
    ]),
  },
});

exports.purifyCSS = ({ paths }) => ({
  plugins: [
    new PurifyCSSPlugin({ paths }),
  ],
});
