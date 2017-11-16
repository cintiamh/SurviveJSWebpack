# Building

* [Source Maps](#source-maps)
* [Bundle Splitting](#bundle-splitting)
* [Code Splitting](#code-splitting)
* [Tidying Up](#tidying-up)

## Source Maps

Source maps provides a mapping between the original and the transformed source code. (JavaScript and Styling)

### Inline source maps and separate source maps

* inline source maps: development - better performance.
* separate source maps: production - keeps bundle size smaller (loading source maps is optional).

### Enabling source maps

#### Enabling source maps in webpack

webpack.parts.js
```javascript
exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});
```

Webpack supports several types of source maps (they differ on quality and build speed).

* `eval-source-map` for development.
* `source-map` for production.

webpack.config.js
```javascript
const productionConfig = () => merge([
  parts.generateSourceMaps({ type: 'source-map' }),
  // ...
]);

const developmentConfig = () => merge([
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-eval-source-map' }),
  // ...
]);
```

Note that source map is on top because it is one of the last things to do.

Now you should be able to get maps when running `npm run build`, these files end with `.map`.

#### Enabling source maps in browsers

[Chrome](https://developers.google.com/web/tools/chrome-devtools/)

### Source map types supported by webpack

* inline: mapping directly to generated files.
* separate: separate source map file that links to the original using a comment.

### Inline source map types

`cheap-module-eval-source-map` is recommended because it's a good compromise between speed and quality while working reliably in Chrome and Firefox.

* `devtool: 'eval'`
* `devtool: 'cheap-eval-source-map'`
* `devtool: 'cheap-module-eval-source-map'`
* `devtool: 'eval-source-map'`

### Separate source map types

Separate source map files are production friendly.
The `.map` extension are loaded by the browser only when required.

`source-map` is a good default. It takes longer, but it's the best quality.

* `devtool: 'cheap-source-map'`
* `devtool: 'cheap-module-source-map'`
* `devtool: 'source-map'`
* `devtool: 'hidden-source-map'`

## Bundle Splitting

Bundle splitting can be achieved using `CommonsChunkPlugin`.

### The idea of bundle splitting

With bundle splitting you can push the vendor dependencies to a bundle of their own and benefit from client level caching.

### Adding something to split

We're going to install React to use as an example.

```
$ npm i react react-dom --save
```

app/index.js
```javascript
import 'react';
import 'react-dom';
```

Now let's make a new build `npm run build`.

The app.js file size inside build is 727kb.

### Setting up a `vendor` bundle

You can define a `vendor` entry containing react by matching the dependency name.

webpack.config.js
```javascript
const productionConfig = () => merge([
  {
    entry: {
      vendor: ['react', 'react-dom'],
    },
  },
  // ...
]);
```

If you run `npm run build` at this point, it will create a new file called vendor.js with react code in there, but app.js has the same size as before because it still has React's code in there because it's webpack's default behavior.

We have to use `CommonsChunkPlugin` to alter this behavior.

### Setting up `CommonsChunkPlugin`

Implementing `CommonsChunkPlugin` in webpack.config.js:
```javascript
const webpack = require('webpack');

const productionConfig = () => merge([
  {
    entry: {
      vendor: ['react', 'react-dom'],
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
      }),
    ],
  },
  // ...
]);
```

The configuration tells the plugin to extract React to a bundle named `vendor`.

Now you if you run `npm run build` you should get a smaller size app.js.

### Abstracting bundle extraction

webpack.parts.js
```javascript
const webpack = require('webpack');
// ...
exports.extractBundles = (bundles) => ({
  plugins: bundles.map((bundle) => (
    new webpack.optimize.CommonsChunkPlugin(bundle)
  )),
});
```

webpack.config.js
```javascript
const productionConfig = () => merge([
  {
    entry: {
      vendor: ['react', 'react-dom'],
    },
  },
  // ...
  parts.extractBundles([
    {
      name: 'vendor'
    },
  ]),
]);
```

Everything should work as before.

### Loading `dependencies` to a `vendor` bundle automatically

`CommonsChunkPlugin` gives control over its behavior through its `minChunks` options.

`minChunks` accepts a function with a signature `(module, count)`.

* `module`: information about matches modules to deduce which modules are used by the project.
* `count`: how many times a module has been imported into the project.

Most important `module` properties:

* `resource`: resource full path.
* `context`: returns the path to the resource's directory.
* `rawRequest`: contains the whole unresolved request.
* `userRequest`: a version of the request that has been resolved to a query.
* `chunks`: tells in which chunks the module is contained.

### Performing more granular split

`CommonsChunkPlugin` operates against all entry chunks by default.
This behavior can be constrained through the `chunks` option for more granular control.

### `CommonsChunkPlugin children` and `async` flags

* `children`: when set to `true`, webpack detects which modules are the same in the resulting bundles and push them to the parent bundle.
* `async`: when set to `true`, webpack generates a separate bundle with the commonalities and load it asynchronously from the parent.

### Splitting and merging chunks

* `AggressiveSplittingPlugin`: allows to emit more and smaller bundles.
* `AggressiveMergingPlugin`: allows to combine too small bundles into bigger ones.

## Code Splitting

## Tidying Up
