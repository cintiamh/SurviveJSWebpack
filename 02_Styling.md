# Styling

* [Loading Styles](#loading-styles)
* [Separating CSS](#separating-css)
* [Autoprefixing](#autoprefixing)
* [Eliminating Unused CSS](#eliminating-unused-css)
* [Linting CSS](#linting-css)

## Loading Styles

Webpack doesn't handle styling out of the box.

### Loading CSS

To load CSS, you need:
* css-loader: goes through `@import` and `url()` lookups and treat them like regular ES6 imports. (only for internal files)
* style-loader: injects the styling through a `style` element. It also implements the Hot Module Replacement interface.

Since inlining CSS isn't a good idea, we use `ExtractTextPlugin` to generate a separated CSS file.

```
$ npm i css-loader style-loader --save-dev
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
  parts.loadCSS(),
]);
```

### Setting up the initial CSS

```
$ touch app/main.css
```

app/main.css
```css
body {
    background: cornsilk;
}
```

You need to make webpack aware of it.

app/index.js
```javascript
import './main.css';
```

Now, if you try `npm run start` you should see the different background color on localhost:8080.

### Understanding CSS scoping and CSS modules

All CSS rules exist within **global scope**.

[CSS Modules](https://github.com/css-modules/css-modules) introduces **local scope** for every module by adding a hash in their name.

Webpack's `css-loader` supports CSS Modules.

webpack.parts.js
```javascript
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
    // ...
  },
});
```

app/main.css
```css
body {
    background: cornsilk;
}
.redButton {
    background: red;
}
```

app/component.js
```javascript
import styles from './main.css';

export default (text = 'Hello world') => {
  const element = document.createElement('div');
  element.innerHTML = text;
  element.className = styles.redButton;
  return element;
};
```

#### Using CSS modules with 3rd party libraries and CSS

You should process normal CSS through a separate loader definition without the `modules` option of `css-loader` enabled.

You can solve the problem by processing 3rd party CSS through an `include` definition against `node_modules`.

### Loading Less

```
$ npm i less-loader --save-dev
```

Simple config:
```javascript
{
  test: /\.less$/,
  use: ['style-loader', 'css-loader', 'less-loader'],
},
```

### Loading Sass

```
$ npm i node-sass sass-loader --save-dev
```

Simple config:
```javascript
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
},
```

### Understanding lookups

`css-loader` handles relative imports by default, but it doesn't touch absolute imports.

If you rely on absolute paths, you have to copy the files to your project.

`copy-webpack-plugin` works for this purpose.

#### Processing `css-loader` imports

Use this technique when you import other CSS files from your CSS through the `@import` statement and want to process the imports through specifc loaders.

To process `@import "./variables.sass";`:

```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
      },
    },
    'sass-loader',
  ],
},
```

#### Loading from `node_modules` directory

```
@import "~bootstrap/less/bootstrap";
```

The tilde (`~`) character tells webpack that it's not a relative import as by default. It performs a lookup against `node_modules`.

### Enabling source maps

* Enable `sourceMap` option for `css-loader`.
* Set `output.publicPath` to an absolute URL pointing to your development server.
* Enable `sourceMap` for all separated loaders.

### Using Bootstrap

* point to the npm version and perform loader configuration as above.
* Use the Sass version. You should set `precision` option of `sass-loader` to at least 8.
* Use `bootstrap-loader`.

## Separating CSS

By default, the CSS gets inlined into the JavaScript.

The current solution doesn't allow to cache CSS.

Webpack provides a means to generate a separate CSS bundles using `ExtractTextPlugin`. It can aggregate multiple CSS files into one.

`ExtractTextPlugin` doesn't work with Hot Module Replacement. It only works for production.

### Setting up `ExtractTextPlugin`

```
$ npm i extract-text-webpack-plugin --save-dev
```

* `ExtractTextPlugin` includes a loader.
* `ExtractTextPlugin.extract` marks the assets to be extracted.
    * `use`: processes content through use only from initial chuncks by default
    * `fallback`: it uses fallback for the rest.
* It doesn't touch any split bundles unless `allChuncks: true` is set.

webpack.parts.js
```javascript
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// ...
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
```

If you wanted to output the resulting file to a specific directory:
```javascript
filename: 'styles/[name].css'
```

#### Connecting with configuration

webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

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
]);

const productionConfig = () => merge([
  parts.extractCSS({ use: 'css-loader' }),
]);

const developmentConfig = () => merge([
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
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
```

With this setup you can still benefit from the HMR during development and generate a separated css file for production.

### Managing styles outside of JavaScript

We can bundle CSS files using globbing. But it's not recommended.

## Autoprefixing

Autoprefixer uses [Can I Use](https://caniuse.com/) service to figure out which rules should be prefixed.

### Setting up autoprefixing

```
$ npm i postcss-loader autoprefixer --save-dev
```

webpack.parts.js
```javascript
exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => ([
      require('autoprefixer')(),
    ]),
  },
});
```

webpack.config.js
```javascript
const productionConfig = () => merge([
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()],
  }),
]);
```

app/main.css
```css
body {
    background: cornsilk;
    display: flex;
}
```

After running `npm run build`, you should have a resulting app.css:
```css
body {
    background: cornsilk;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
}
```

If you know what browsers you support, it's possible to set up a `.browserslistrc` file.

.browserslistrc example:
```
> 1% # Browser usage over 1%
Last 2 versions # or last two versions
IE 8 # or IE 8
```

## Eliminating Unused CSS

[PurifyCSS](https://www.npmjs.com/package/purifycss) is a tool to analyze files to eliminate the portions you aren't using.

### Setting up Pure.css

Pure.css is a CSS library with pre-made styles you can use (smaller version of Bootstrap):

```
$ npm i purecss --save
```

app/index.js
```javascript
import 'purecss';
```

app/component.js
```javascript
export default (text = 'Hello world') => {
  const element = document.createElement('div');
  element.className = 'pure-button';
  element.innerHTML = text;
  return element;
};
```

Now if you run `npm start` you should see `Hello World` inside a button like shape.

But now, the CSS file grew up a bit.

### Enabling PurifyCSS

```
$ npm i glob purifycss-webpack purify-css --save-dev
```

webpack.parts.js
```javascript
const PurifyCSSPlugin = require('purifycss-webpack');
// ...
exports.purifyCSS = ({ paths }) => ({
  plugins: [
    new PurifyCSSPlugin({ paths }),
  ],
});
```

webpack.config.js
```javascript
const glob = require('glob');
// ...
// The order matters here:
const productionConfig = () => merge([
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()],
  }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
]);
```

The size of the build decreased a lot!

PurifyCSS supports additional options including minify.

You can enable those through the `purifyOptions` field.

You should use `purifyOptions.whitelist` array to define selectors which it should leave in the result no matter what.

## Linting CSS
