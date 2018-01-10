# Getting Started

Simpler notes and straight commands / scripts.

Original configuration on GitHub: https://github.com/survivejs-demos/webpack-demo

* [Setting up the project](#setting-up-the-project)
* [Installing webpack](#installing-webpack)
  - [Composing configuration](#composing-configuration)
* [Directory structure](#directory-structure)
* [Adding shortcuts](#adding-shortcuts)
* [Configuring WDS](#configuring-wds)
* [Styling](#styling)
  - [Loading less](#loading-less)
  - [Loading sass](#loading-sass)
* [Separating CSS](#separating-css)
* [Setting up autoprefixing](#setting-up-autoprefixing)
* [Eliminating unused CSS](#eliminating-unused-css)
* [Loading assets](#loading-assets)
  - [Loading images](#loading-images)
  - [Loading fonts](#loading-fonts)
  - [Loading JavaScript](#loading-javascript)
* [Building](#building)
  - [Source maps](#source-maps)

## Setting up the project

```
$ mkdir webpack-demo
$ cd webpack-demo
$ npm init -y
$ touch .gitignore
```

.gitignore
```
.DS_Store
.idea
*.iml
node_modules/
build/
.eslintcache
dist*
```

## Installing webpack

```
$ npm i webpack -D
$ npm i html-webpack-plugin -D
$ npm i webpack-dev-server -D
```

### Composing configuration

`webpack-merge` concatenates arrays and merge objects allowing composition.

```
$ npm i webpack-merge -D
```

## Directory structure

* src/
  - component.js
  - index.js
* build/
* package.json
* webpack.config.js
* webpack.parts.js

Creating the file structure:
```
$ mkdir src
$ mkdir build
$ touch src/index.js
$ touch src/component.js
$ touch webpack.config.js
$ touch webpack.parts.js
```

At a minimum, webpack needs `entry` and `output` fields in config.

## Adding shortcuts

package.json
```javascript
"scripts": {
  "start": "webpack-dev-server --env development",
  "build": "webpack --env production"
}
```

Webpack uses `yargs` underneath to make --env work.

Now you can run:
```
$ npm run build
$ npm start
```

## Configuring WDS

webpack.parts.js
```javascript
exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    // Display only errors to reduce the amount of output.
    stats: "errors-only",

    // Parse host and port from env to allow customization.
    //
    // If you use Docker, Vagrant or Cloud9, set
    // host: options.host || "0.0.0.0";
    //
    // 0.0.0.0 is available to all network devices
    // unlike default `localhost`.
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    // overlay: true is equivalent
    overlay: {
      errors: true,
      warnings: true,
    },
  },
});
```

If you access the server through http://localhost:8080/webpack-dev-server/, WDS provides status information at the top.

Find your machine's ip:
```
$ ifconfig | grep inet
```

## Styling

* `css-loader`: goes through possible `@import` and `url()` (treating them like a regular ES2015 `import`) - only for internal resources.
* `style-loader`: injects the styling through a `style` element.

```
$ npm i css-loader style-loader -D
```

webpack.parts.js
```javascript
exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
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
```

webpack.config.js
```javascript
const commonConfig = merge([
  // ...
  parts.loadCSS(),
]);
```

Loading from `node_modules`:
```css
@import "~bootstrap/less/bootstrap";
```

The `~` tells webpack that it should perform a lookup against `node_modules`.

### Loading less

```
$ npm i less-loader
```

webpack.parts.js
```javascript
{
  test: /\.less$/,
  use: ['style-loader', 'css-loader', 'less-loader'],
},
```

### Loading sass

```
$ npm i sass-loader
```

webpack.parts.js
```javascript
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
},
```

## Separating CSS

```
$ npm i extract-text-webpack-plugin -D
```

`ExtractTextPlugin` includes a loader, `ExtractTextPlugin.extract` that marks the assets to be extracted.
* `use`: process contents from initial chunks.
* `fallback`: uses fallback for the rest.

webpack.parts.js
```javascript
const ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.extractCSS = ({ include, exclude, use }) => {
  const plugin = new ExtractTextPlugin({
    allChunks: true,
    filename: '[name].css',
  });
  return {
    module: {
      rules: [
        {
          test:/\.css$/,
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
```

`plugin.extract` calls against different file types, allowing you to aggregate them to a single CSS file.

webpack.config.js
```javascript
const productionConfig = merge([
  // for production we'll have a separated CSS file.
  parts.extractCSS({
    use: 'css-loader',
  }),
]);

const developmentConfig = merge([
  // ...
  // For development, we'll have CSS into JS because it's faster to reload.
  parts.loadCSS(),
]);
```

## Setting up autoprefixing

```
$ npm i postcss-loader autoprefixer -D
$ touch .browserslistrc
```

webpack.parts.js
```javascript
exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => [require('autoprefixer')()],
  },
});
```

webpack.config.js
```javascript
const productionConfig = merge([
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()],
  }),
]);
```

.browserslistrc
```
> 1% # Browser usage over 1%
Last 2 versions # Or last two versions
IE 8 # Or IE 8
```

## Eliminating unused CSS

### Enabling PurifyCSS

```
$ npm i glob purifycss-webpack purify-css -D
```

webpack.parts.js
```javascript
const PurifyCSSPlugin = require('purifycss-webpack');

exports.purifyCSS = ({ paths }) => ({
  plugins: [new PurifyCSSPlugin({ paths })],
});
```

webpack.config.js
```javascript
const glob = require('glob');

const productionConfig = merge([
  // The order matters, CSS extraction has to happen before purifying
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
]);
```

## Loading assets

Webpack's loaders are always evaluated from right to left and from bottom to top.

### Loading images

#### Setting up `url-loader`

`url-loader` emits your images as base64 strings within your JavaScript bundle.

It comes with a `limit` option that can be used to defer image generation to file-loader after a certain limit's reached.

```javascript
{
  test: /\.(jpg|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: 25000,
    },
  },
},
```

#### Setting up `file-loader`

By default, `file-loader` returns the MD5 hash of the file's contents with the original extension.

```javascript
{
  test: /\.(jpg|png|svg)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[path][name].[hash].[ext]',
    },
  },
},
```

```
$ npm i file-loader url-loader -D
```

webpack.parts.js
```javascript
exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg)$/,
        include,
        exclude,
        use: {
          loader: 'url-loader',
          options,
        },
      },
    ],
  },
});
```

wepback.config.js
```javascript
const productionConfig = merge([
  // ...
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[ext]',
    },
  }),
]);

const developmentConfig = merge([
  // ...
  parts.loadImages(),
]);
```

To compress your images, use `image-webpack-loader`, `svgo-loader`, or `imagemin-webpack-plugin`.

### Loading fonts

* Google Fonts: https://www.npmjs.com/package/google-fonts-webpack-plugin
* Font awesome: https://www.npmjs.com/package/font-awesome

If you haven't yet, you'll need `file-loader`
```
$ npm i file-loader -D
```

webpack.parts.js
```javascript
exports.loadFonts = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        include,
        exclude,
        use: {
          loader: 'file-loader',
          options,
        },
      },
    ],
  },
});
```

webpack.config.js
```javascript
const commonConfig = merge([
  // ...
  parts.loadFonts({
    options: {
      name: '[name].[ext]',
    },
  }),
]);
```

### Loading JavaScript

#### Setting up `babel-loader`

```
$ npm i babel-loader babel-core -D
$ npm i babel-preset-env -D
$ touch .babelrc
```

webpack.parts.js
```javascript
exports.loadJavaScript = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        use: 'babel-loader'
      },
    ],
  },
});
```

webpack.config.js
```javascript
const commonConfig = merge([
  // ...
  parts.loadJavaScript({ include: PATHS.app }),
]);
```

.babelrc
```javascript
{
  "presets": [
    [
      "env",
      {
        "modules": false
      }
    ]
  ]
}
```

## Building

### Source maps

Documentation: https://webpack.js.org/configuration/devtool/#devtool

webpack.parts.js
```javascript
exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});
```

webpack.config.js
```javascript
const productionConfig = merge([
  parts.generateSourceMaps({ type: 'source-map' }),
  // ...
]);

const developmentConfig = merge([
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
  // ...
]);
```

If you are using `UglifyJsPlugin` you need to enable `sourceMap: true` for the plugin.

Alternative plugin: https://webpack.js.org/plugins/source-map-dev-tool-plugin/
