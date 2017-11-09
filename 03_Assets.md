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

## Loading Fonts

## Loading JavaScript
