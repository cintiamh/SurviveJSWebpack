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
