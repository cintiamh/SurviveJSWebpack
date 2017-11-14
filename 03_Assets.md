# Loading Assets

* [Loader Definitions](#loader-definitions)
* [Loading Images](#loading-images)
* [Loading Fonts](#loading-fonts)
* [Loading JavaScript](#loading-javascript)

## Loader Definitions

Setting up module loaders:
* `use` from webpack 2
* `loader` and `loaders` (legacy)

### Anatomy of a loader

You set up loader(s) and connect those with your directory structure.

```
$ npm i babel-loader babel-core babel-preset-env --save-dev
```

webpack.parts.js
```javascript
exports.babel = () => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
});
```

webpack.config.js
```javascript
const commonConfig = merge([
  // ...
  parts.babel(),
]);
```

### Loader evaluation order

Webpack's loaders are evaluated from RIGHT to LEFT and from BOTTOM to TOP.

#### Enforcing order

You can use `enforce` as `pre` or `post`.

```javascript
{
  // Conditions
  test: /\.js$/,
  enforce: 'pre',
  loader: 'eslint-loader',
}
```

### Passing parameters to a loader

```javascript
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  use: 'babel-loader?cacheDirectory,presets[]=es2015',
}
```

Better use `use` with `options` for readability:
```javascript
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: ['react', 'es2015'],
    }
  }
}
```

### Branching at `use` using a function

```javascript
{
  test: /\.css$/,
  use: ({ resource, resourceQuery, issuer }) => {
    if (env === 'development') {
      return {
        loader: 'css-loader',
        rules: [
          'style-loader'
        ]
      }
    }
  }
}
```

### Inline definitions

Even though configuration level loader definitions are preferable, it's possible to write loader definitions inline:

```javascript
// Process foo.png through url-loader and other possible matches.
import 'url-loader!./foo.png';
// Override possible higher level match completely
import '!!url-loader!./bar.png';
```

The problem with this approach is that it couples your source with webpack.

You can use this way as well:
```javascript
{
  entry: {
    app: 'babel-loader!./app'
  }
}
```

### Alternate ways to match files

* `test`: match against a RegExp, string, function, an object, or an array of conditions like these.
* `include`
* `exclude`
* `resource`
* `issuer`
* `resourcePath`
* `resourceQuery`

### Loading based on `resourceQuery`

`oneOf` field makes it possible to route webpack to a specific loader based on a resource related match.

```javascript
{
  test: /\.css$/,
  oneOf: [
    {
      resourceQuery: /inline/,
      use: 'url-loader'
    },
    {
      resourceQuery: /external/,
      use: 'file-loader'
    }
  ]
}
```

### Loading Based on `issuer`

`issuer` can be used to control behavior based on where a resource was imported.

In the example below `style-loader` is applied only when webpack captures a CSS file from a JavaScript import:
```javascript
{
  test: /\.css$/,
  rules: [
    {
      issuer: /\.js$/,
      use: 'style-loader'
    },
    {
      use: 'css-loader'
    }
  ]
}
```

## Loading Images

Webpack allows you to inline assets by using `url-loader`.
It emits your images as base64 strings within your JavaScript bundles.
The process decreases the number of requests needed while growing the bundle size.
This is good enough for development.

`file-loader` outputs image files and returns paths to them instead of inlining.
This also works with other asset types like fonts.

### Setting up `url-loader`

`url-loader` comes with a `limit` option that can be used to defer image generation to `file-loader`
* inline small files to JavaScript.
* generate separate files for the bigger ones.

```
$ npm i url-loader file-loader --save-dev
```

```javascript
{
  test: /\.(jpg|png|svg)$/,
  loader:  'url-loader',
  options: {
    limit: 25000,
  }
}
```

### Setting up `file-loader`

If you want to skip inlining altogether, you can use `file-loader` directly.

```javascript
{
  test: /\.(jpg|png|svg)$/,
  loader: 'file-loader',
  options: {
    name: '[path][name].[hash].[ext]'
  }
}
```

Be careful not to apply both loaders on images at the same time.

### Integrating images to the project

```
$ npm i file-loader url-loader --save-dev
```

webpack.parts.js
```javascript
exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(jpg|png|svg)$/,
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

webpack.config.js
```javascript
const productionConfig = () => merge([
  // ...
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[ext]',
    },
  }),
]);

const developmentConfig = () => merge([
  // ...
  parts.loadImages(),
]);
```

app/main.css
```css
body {
    background: cornsilk;
    background-image: url('./hellokitty.jpg');
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
}
```

### Loading svgs

The easiest way to load SVGs is using file-loader:

```javascript
{
  test: /\.svg$/,
  use: 'file-loader',
}
```

If you want the raw SVG content you can use `raw-loader`.

`svg-inline-loader` eliminates unnecessary markup from your SVGs.

`svg-sprite-loader` can merge separated SVG files into a single sprite, making it potentially more efficient to load.

`react-svg-loader` emits SVGs as React components.

### Optimizing images

Compress images:
* `image-webpack-loader`,
* `svgo-loader` (SVG specific),
* `imagemin-webpack-plugin`

This type of loader should be applied to the data, so remember to place as the last within `use` listing.

### Utilizing `srcset`

`resize-image-loader` and `responsive-loader` allow you to generate `srcset` compatible collections of images for modern browsers.
`srcset` gives more control to the browsers over what images to load and when resulting in higher performance.

### Getting image dimensions

`image-size-loader`

### Loading sprites

`webpack-spritesmith` converts provided images into a sprite sheet and sass/less/stylus mixins.

## Loading Fonts

### Choosing one format

If you exclude Opera mini, all browsers support the `.woff` format.
`.woff2` is widely supported by modern browsers.

Using `file-loader` and `url-loader` just like with images for single format:
```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
  loader: 'url-loader',
  options: {
    // Limit at 50k. Above that it emits separate files
    limit: 50000,

    // url-loader sets mimetype if it's passed.
    // Without this it derives it from the file extension
    mimetype: 'application/font-woff',

    // Output below fonts directory
    name: './fonts/[name].[ext]',
  },
},
```

### Supporting multiple formats

Support more browsers, use `file-loader` and forget about inlining.

You get extra requests, but your page looks better in more browsers.

```JavaScript
{
  test: /\.(ttf|eot|woff|woff2)$/,
  loader: 'file-loader',
  options: {
    name: 'fonts/[name].[ext]',
  },
},
```

CSS definition order matters. The newer font formats on top:
```css
@font-face {
  font-family: 'myfontfamily';
  src: url('./fonts/myfontfile.woff2') format('woff2'),
    url('./fonts/myfontfile.woff') format('woff'),
    url('./fonts/myfontfile.eot') format('embedded-opentype'),
    url('./fonts/myfontfile.ttf') format('truetype');
}
```

### Manipulating `file-loader` output path and `publicPath`

It's possible to manipulate `publicPath` and override the default per loader definition.

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
  loader: 'url-loader',
  options: {
    // Limit at 50k. Above that it emits separate files
    limit: 50000,
    mimetype: 'application/font-woff',

    // Output below fonts directory
    name: './fonts/[name].[ext]',

    // Tweak publicPath to fix CSS lookups to take
    // the directory into account
    publicPath: '../',
  },
},
```

### Generating font files based on SVGs

`webfonts-loader`: bundles SVG based fonts into a single font file.

### Using font awesome

[Font Awesome](https://www.npmjs.com/package/font-awesome)

#### Integrating font awesome to the project

```
$ npm i font-awesome --save
```

app/index.js:
```javascript
import 'font-awesome/css/font-awesome.css';
```

If you run the project now, you should get a list of errors to load font awesome.

#### Implementing webpack configuration

webpack.parts.js
```javascript
exports.loadFonts = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        // Capture eot, ttf, woff, and woff2
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
    }
  }),
]);
```

app/component.js
```javascript
export default (text = 'Hello world') => {
  const element = document.createElement('div');
  // Using Font Awesome
  element.className = 'fa fa-hand-spock-o fa-1g';
  element.innerHTML = text;
  return element;
};
```

`font-awesome-loader` allows more customization.

## Loading JavaScript

### Using Babel with webpack configuration

#### Setting up `babel-loader`

`babel-loader` takes the code and turns it into a format older browsers can understand.

```
$ npm i babel-loader babel-core --save-dev
```

webpack.parts.js
```javascript
exports.loadJavaScript = ({ include, exclude }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
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
  parts.loadJavaScript({ include: PATHS.app }),
]);
```

We still have to set up `.babelrc`

#### Setting up .babelrc

At a minimum you need `babel-preset-env`. It's a Babel preset that enables the needed plugins based on the environment definition you pass to it.

To make Babel aware of the preset, you need to write a `.babelrc`.

```
$ npm i babel-preset-env --save-dev
$ touch .babelrc
```

.babelrc
```json
{
  "presets": [
    [
      "env",
      {
        "modules": false,
        "targets": {
          "browsers": ["last 2 Chrome versions"]
        }
      }
    ]
  ]
}
```

If you omit the targets definition, `babel-preset-env` compiles to ES5 compatible code.

### Polyfilling features

`babel-preset-env` allows you to use polyfill.

To use it, enable `useBuiltIns: true` and install `babel-polyfill`.

`babel-polyfill` pollutes the global scope.

### Enabling presets and plugins per environment

`env` checks both `NODE_ENV` and `BABEL_ENV`.
If `BABEL_ENV` is set, it overrides any possible `NODE_ENV`.

.babelrc
```javascript
{
  // ...
  "env": {
    "development": {
      "plugins": [
        "react-hot-loader/babel"
      ]
    }
  }
}
```

It's possible to pass the webpack environment to Babel:

webpack.config.js
```javascript
module.exports = (env) => {
  process.env.BABEL_ENV = env;
  // ...
}
```
