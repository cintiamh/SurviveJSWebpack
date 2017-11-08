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

## Loading Images

## Loading Fonts

## Loading JavaScript
