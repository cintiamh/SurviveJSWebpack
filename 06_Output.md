# Output

* [Build Targets](#build-targets)
* [Multiple Pages](#multiple-pages)
* [Bundling Libraries](#bundling-libraries)
* [Library Output](#library-output)
* [Server Side Rendering](#server-side-rendering)

## Build Targets

Webpack's output target is controlled by the `target` field.

### Web targets

Webpack uses the *web* target by default.

Webpack bootstraps the application and load its modules.

The initial list of modules to load is maintained in a manifest, and then the modules can load each other as defined.

#### Web workers

The *webworker* target wraps your application as a web worker.

Using web workers is valuable if you want to execute computation outside of the main thread of the application without slowing down the user interface.

* You cannot use webpack's hashing features when the *webworker* target is used.
* You cannot manipulate the DOM from a web worker.

### Node targets

* `node`: uses standard Node `require` to load chunks.
* `async-node`: wraps modules to load them asynchronously through Node `fs` and `vm` modules.

The main use case for using the node target is **Server Side Rendering (SSR)**.

### Desktop targets

* `node-webkit`: NW.js
* `atom, electron, electron-main`: Electron main process.
* `electron-renderer`: Electron renderer process.

`electron-react-boilerplate`: hot loading webpack setup for Electron and React based development.

## Multiple Pages

Generating multiple pages is achievable through `HtmlWebpackPlugin` and a bit of configuration.

### Possible approaches

* Go through the `multi-compiler mode` and return an array of configurations. Separated pages with minimal shared code. You can process it through `parallel-webpack` to improve build performance.
* Set up a single configuration and extract the commonalities.
* If you follow the idea of Progressive Web Applications (PWA), you can end up with either an **app shell** or a **page shell** and load portions of the application as it's used.

### Generating multiple pages

#### Abstracting pages

To initialize a page, it should receive page title, output path, and an optional template at least.

webpack.parts.js
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

exports.page = ({
  path = "",
  template = require.resolve('html-webpack-plugin/default_index.ejs'),
  title,
} = {}) => ({
  plugins: [
    new HtmlWebpackPlugin({
      filename: `${path && path + "/"}index.html`,
      template,
      title,
    }),
  ],
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
    // Remove plugins HtmlWebpackPlugin
  },
  // ...
]);
// ...
module.exports = (env) => {
  const pages = [
    parts.page({ title: 'Webpack demo' }),
    parts.page({ title: 'Another demo', path: 'another' }),
  ];
  const config = env === "production" ? productionConfig : developmentConfig;
  return pages.map(page => merge(commonConfig, config, page));
}
```

## Bundling Libraries

## Library Output



## Server Side Rendering
