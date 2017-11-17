# Optimizing

* [Minifying](#minifying)
* [Tree Shaking](#tree-shaking)
* [Environment Variables](#environment-variables)
* [Adding Hashes to Filenames](#adding-hashes-to-filenames)
* [Separating Manifest](#separating-manifest)
* [Analyzing Build Statistics](#analyzing-build-statistics)
* [Performance](#performance)

## Minifying

### Generating a baseline build

Check the build size without minifying it so we can compare later.

Vendor is 729kb, app.js is 17kb.

### Enabling a performance budget

Performance budget is a build size constraint it has to follow.

```javascript
const productionConfig = () => merge([
  {
    performance: {
      hints: "warning",
      maxEntrypointSize: 50000,
      maxAssetSize: 450000,
    },
  },
]);
```

Now you should be getting a warning. If minification works, the warning should disappear.

### Minifying JavaScript

Webpack has a `UglifyJsPlugin` and can be activated with `webpack -p` (`--optimize-minimize`).

#### Setting up JavaScript minification

```
$ npm i uglifyjs-webpack-plugin --save-dev
```

webpack.parts.js
```javascript
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// ...
exports.minifyJavaScript = () => ({
  plugins: [
    new UglifyJsPlugin()
  ],
});
```

webpack.config.js
```javascript
const productionConfig = () => merge([
  // ...
  parts.clean(PATHS.build),
  parts.minifyJavaScript(),
  // ...
]);
```

If you run `npm run build`, the vendor will be 282kb.

### Other ways to minify JavaScript

* babel-minify-webpack-plugin
* webpack-closure-compiler
* butternut-webpack-plugin

### Speeding up JavaScript execution

* `webpack.optimize.ModuleConcatenationPlugin` hoists all modules to a single scope instead of  writing a separate closure by each. Doing this slows down the build, but gives you bundles that are faster to execute.
* `prepack-webpack-plugin` uses `Prepack`.
* `optimize-js-plugin`: relies on `optimize-js`.

### Minifying HTML

If you consume HTML templates through your code using `html-loader`, you can preprocess it through `posthtml` with `posthtml-loader`.
You can use `posthtml-minifier` to minify your HTML through it.

### Minifying CSS

* `css-loader` allows minifying CSS through `cssnano`. Set the `minimize` option.
* `clean-css-loader` allows to use `clean-css` minifier.
* `optimize-css-assets-webpack-plugin`
* `ExtractTextPlugin` to remove duplicates by doing text merging.
* `OptimizeCSSAssetsPlugin` operates in the generated result.

#### Setting up CSS minification

`OptimizeCSSAssetsPlugin` seems to be the best option.

```
$ npm i optimize-css-assets-webpack-plugin cssnano --save-dev
```

## Tree Shaking

## Environment Variables

## Adding Hashes to Filenames

## Separating Manifest

## Analyzing Build Statistics

## Performance
