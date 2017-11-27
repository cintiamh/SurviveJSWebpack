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

webpack.parts.js
```JavaScript
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
// ...
exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});
```

webpack.config.js
```javascript
const productionConfig = () => merge([
  // ...
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
  // ...
]);
```

### Minifying images

* img-loader
* imagemin-webpack
* imagemin-webpack-plugin

## Tree Shaking

Tree shaking is a feature enabled by the ES2015 module definition.

Analyze the module definition in static way without running it, webpack can tell which parts of the code are being used or not.

### Demonstrating tree shaking

app/shake.js
```javascript
const shake = () => console.log("shake");
const bake = () => console.log("bake");

export { shake, bake };
```

app/index.js
```javascript
import { bake } from './shake';

bake();
```

Once building, it should only contain bake method and miss the shake method.

### Tree shaking on package level

You have to let webpack to manage ES2015 modules by setting `"modules": false`.

To get most out of tree shaking with external packages, you have to use `babel-plugin-transform-imports` to rewrite imports so that they work with webpack's tree shaking logic.

## Environment Variables

Since JavaScript minifiers can remove dead code (`if(false)`), you can build on top of this idea for code available only in development mode, for example.

Webpack's `DefinePlugin` enables replacing *free variables* so that you can convert depending on environment:
```javascript
if (process.env.NODE_ENV === "development") { ... }
```

### The basic idea of `DefinePlugin`

Elimination is the core idea of `DefinePlugin` and it allows toggling.

A minifier performs analysis and toggles entire portions of the code.

### Setting `process.env.NODE_ENV`

webpack.parts.js
```JavaScript
exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = JSON.stringify(value);
  return {
    plugins: [new webpack.DefinePlugin(env)],
  };
};
```

webpack.config.js
```JavaScript
const productionConfig = () => merge([
  // ...
  parts.setFreeVariable("process.env.NODE_ENV", "production"),
]);
```

`webpack.EnvironmentPlugin(["NODE_ENV"])` is a shortcut that allows you to refer to environment variables.
It uses `DefinePlugin` underneath and you can achieve the same effect by passing `process.env.NODE_ENV`.

### Replacing free variables through Babel

* `babel-plugin-transform-inline-environment-variables`
* `babel-plugin-transform-define`
* `babel-plugin-minify-replace`

### Choosing which module to use

`DefinePlugin` based splitting allows you to choose which branch of code to use and which to discard.

```
- store
  - index.js
  - store.dev.js
  - store.prod.js
```

You use either `dev` or `prod` version of the store depending on the environment.

```javascript
if (process.env.NODE_ENV === "production") {
  module.exports = require('./store.prod');
} else {
  module.exports = require("./store.dev");
}
```

### Webpack optimization plugins

* `compression-webpack-plugin`: generate compressed files using webpack.
* `webpack.optimize.UglifyJsPlugin`: minify using different heuristics.
* `webpack.optimize.AggressiveSplittingPlugin`: split code into smaller bundles.
* `webpack.optimize.CommonsChunkPlugin`: extract common dependencies into bundles.
* `webpack.DefinePlugin`: feature flags.
* `lodash-webpack-plugin`: smaller Lodash builds.

## Adding Hashes to Filenames

## Separating Manifest

## Analyzing Build Statistics

## Performance
