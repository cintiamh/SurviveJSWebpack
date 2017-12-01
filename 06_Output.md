# Output

* [Build Targets](#build-targets)
* [Multiple Pages](#multiple-pages)
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

#### Injecting different script per page

With the previous example, both pages have the same `entry`.

To solve this, we can move `entry` configuration to a lower level and manage it per page.

```
$ touch app/another.js
```

app/another.js
```javascript
import './main.css';
import component from './component';

const demoComponent = component("Another");

document.body.appendChild(demoComponent);
```

webpack.config.js
```javascript
const commonConfig = merge([
  {
    // remove entry from here!!!
  },
  // ...
]);
// ...
module.exports = (env) => {
  const pages = [
    parts.page({
      title: 'Webpack demo',
      entry: {
        app: PATHS.app,
      },
    }),
    parts.page({
      title: 'Another demo',
      path: 'another',
      entry: {
        another: path.join(PATHS.app, "another.js"),
      },
    }),
  ];
  const config = env === "production" ? productionConfig : developmentConfig;
  return pages.map(page => merge(commonConfig, config, page));
}
```

webpack.parts.js
```javascript
exports.page = ({
  path = "",
  template = require.resolve('html-webpack-plugin/default_index.ejs'),
  title,
  entry,
} = {}) => ({
  entry,
  plugins: [
    new HtmlWebpackPlugin({
      filename: `${path && path + "/"}index.html`,
      template,
      title,
    }),
  ],
});
```

### Generating multiple pages while sharing code

#### Adjusting configuration

HtmlWebpackPlugin picks up all chunks by default, so we need to adjust to pick only the chunks that are related to each page.

webpack.config.js
```javascript
module.exports = (env) => {
  const pages = [
    parts.page({
      title: 'Webpack demo',
      entry: {
        app: PATHS.app,
      },
      chunks: ["app", "manifest", "vendor"],
    }),
    parts.page({
      title: 'Another demo',
      path: 'another',
      entry: {
        another: path.join(PATHS.app, "another.js"),
      },
      chunks: ["another", "manifest", "vendor"],
    }),
  ];
  const config = env === "production" ? productionConfig : developmentConfig;
  return merge([commonConfig, config].concat(pages));
}
```

webpack.parts.js
```javascript
exports.page = ({
  path = "",
  template = require.resolve('html-webpack-plugin/default_index.ejs'),
  title,
  entry,
  chunks,
} = {}) => ({
  entry,
  plugins: [
    new HtmlWebpackPlugin({
      chunks,
      filename: `${path && path + "/"}index.html`,
      template,
      title,
    }),
  ],
});
```

Now you should have a single manifest file instead of two.

The manifest runs different code depending on the entry.

### Progressive web applications

Progressive Web Applications (PWA) `webpack-pwa` https://github.com/webpack/webpack-pwa

App shell is loaded initially, and it manages the whole application including its routing.

The total size of the application is larger, but the initial load is faster.

* `offline-plugin`
* `sw-precache-webpack-plugin`
* Using Service Workers improves the office experience.

## Server Side Rendering
