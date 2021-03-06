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

To take advantage of client level cache, just include a hash to filenames.

### Placeholders

Webpack provides *placeholders* to attach specific information to webpack output.

* `[path]`: file path
* `[name]`: file name
* `[ext]`: extension.
* `[hash]`: build hash.
* `[chunkhash]`: entry chunk-specific hash. Each `entry` defined at the configuration receives a hash of its own.
* `[contenthash]`: hash specific to content. (available for `ExtractTextPlugin` only).

It's preferable to use particularly `hash` and `chunkhash` only for production purposes.

`[chunkhash:8]` => optional

#### Example placeholders

```javascript
{
  output: {
    path: PATHS.build,
    filename: "[name].[chunkhash].js",
  },
},
```

Output examples:
```
app.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

### Setting up hashing

* `hash` => Images and fonts
* `chunkhash` => code chunks

webpack.config.js
```javascript
const commonConfig = merge([
  // ...
  parts.loadFonts({
    options: {
      name: '[name].[hash:8].[ext]',
    }
  }),
  // ...
]);

const productionConfig = () => merge([
  {
    performance: {
      hints: "warning",
      maxEntrypointSize: 50000,
      maxAssetSize: 450000,
    },
    output: {
      chunkFilename: "[name].[chunkhash:8].js",
      filename: "[name].[chunkhash:8].js",
    }
  },
  // ...
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[hash:8].[ext]',
    },
  }),
  // ...
]);
```

If you use `chunkhash` for the extracted CSS it could lead to problems (since CSS comes from JS).

For CSS, use `contenthash` instead.

webpack.parts.js
```javascript
exports.extractCSS = ({ include, exclude, use }) => {
  // Output extracted CSS to a file
  const plugin = new ExtractTextPlugin({
    filename: '[name].[contenthash:8].css',
  });
  // ...
};
```

### Enabling `NamedModulesPlugin`

Webpack uses number based IDs for the module code it generates.

* `NamedModulesPlugin`: replaces module IDs with paths to the modules making it ideal for development.
* `HashedModuleIdsPlugin`: does the same except it hashes the result and hides the path information.

```javascript
const webpack = require('webpack');
// ...
const commonConfig = merge([
  {
    // ...
    plugins: [
      new webpack.NamedModulesPlugin(),
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
    ],
  },
  // ...
]);
```

If the application changes, it invalidates the vendor bundle as well.
Next we'll learn how to extract a manifest to resolve the issue.

## Separating Manifest

When webpack write bundles, it maintains a manifest describing what files webpack should load.

If the hashes webpack generates change, then the manifest changes as well.

### Extracting a manifest

webpack.config.js
```javascript
const productionConfig = () => merge([
  // ...
  parts.extractBundles([
    {
      name: 'vendor'
    },
    {
      name: 'manifest',
      minChunks: Infinity,
    },
  ]),
  // ...
]);
```

The name `manifest` is used by convention.

`minChunks` is optional and passing `Infinity` tells webpack not to move any modules to the resulting bundle.

The project has basic caching behavior now. If you try to modify app.js or component.js, the vendor bundle should remain the same.

## Analyzing Build Statistics

### Configuring webpack

Set the `--json` flag:

package.json:
```javascript
"scripts": {
  "build:stats": "webpack --env production --json > stats.json",
},
```

Other flags:
* `--profile`: timing-related information.
* `--progress`: how long webpack spent in different stages of the build.

#### Node API

```javascript
const webpack = require('webpack');
const config = require('./webpack.config.js')('production');

webpack(config, (err, stats) => {
  if (err) {
    return console.error(err);
  }
  if (stats.hasErrors()) {
    return console.error(stats.toString('errors-only'));
  }
  console.log(stats);
});
```

Plugins:
* `StatsWebpackPlugin`
* `WebpackStatsPlugin`

### Available analysis tools

* The official analyse tool: https://github.com/webpack/analyse
* Webpack visualizer: https://chrisbateman.github.io/webpack-visualizer/
* `DuplicatePackageCheckerPlugin`
* Webpack Chart: https://alexkuz.github.io/webpack-chart/
* `webpack-unused`
* Stellar webpack: https://alexkuz.github.io/stellar-webpack/
* `webpack-bundle-tracker`
* `webpack-bundle-analyzer`*
* `webpack-bundle-size-analyzer`
* `inspectpack`
* `webpack-runtime-analyzer`
* Webpack Monitor: http://webpackmonitor.com/

### Duplication analysis

* `bundle-duplicates-plugin`
* `find-duplicate-dependencies`
* `depcheck`
* `bundle-buddy`

## Performance

Optimizations:
1. Know what to optimize
2. Perform fast to implement tweaks first.
3. Perform more involved tweaks after.
4. Measure impact.

### High-level optimizations

* `parallel-webpack`: run multiple webpack instances in parallel
* `HappyPack`: file level parallelism (couples your configuration with it).

### Low-level optimizations

* Use faster source map variants during development or skip them.
* Use `babel-preset-env` during development.
* Skip polyfills during development.
* Disable the portions of the app you don't need during development.
* Push bundles that change less to Dynamically Loaded Libraries (DLL).

#### Plugin specific optimizations

* caching through `hard-source-webpack-plugin`
* use lighter laternatives of plugins and loaders during development.
* use parallel variants of plugins.

#### Loader specific optimizations

* Perform less processing by skipping loaders during development.
* Use either `include` or `exclude` with JavaScript specific loaders.
* Cache the results of expensive loaders.
* Parallelize the execution of expensive loaders using `thread-loader`.

### Optimizing rebundling speed during development

Point development setup to a minified version of a library.
