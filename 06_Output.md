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

Server Side Rendering (SSR) you serve a fully rendered HTML page that would make sense even without JavaScript enabled.

Provides potential performance benefits and with Search Engine Optimization (SEO).

https://www.npmjs.com/package/isomorphic-webpack

To demonstrate SSR, you can use webpack to compile a client-side build that then gets picked up by a server that render it using React following the principle.

### Setting up babel with React

More details in "Loading JavaScript" chapter.

React projects rely on JSX format, so we'll enable it through babel.

```
$ npm i babel-preset-react --save-dev
```

.babelrc
```javascript
{
  "presets": [
    "react",
  ]
}
```

### Setting up a React demo

```
$ npm i react react-dom --save
$ touch app/ssr.js
```

app/ssr.js
```javascript
const React = require('react');
const ReactDOM = require('react-dom');

const SSR = <div onClick={() => alert("hello")}>Hello world!</div>;

// Render only on the browser, export otherwise
if (typeof document === 'undefined') {
  module.exports = SSR;
} else {
  ReactDOM.hydrate(SSR, document.getElementById('app'));
}
```

*ES2015 style imports and CommonJS exports cannot be mixed.*

### Configuring webpack

Let's make a separated config just to be tidy.

```
$ touch webpack.ssr.js
```

webpack.ssr.js
```javascript
const path = require('path');
const merge = require('webpack-merge');
const parts = require('./webpack.parts');

const PATHS = {
  build: path.join(__dirname, 'static'),
  ssrDemo: path.join(__dirname, 'app', 'ssr.js'),
};

module.exports = merge([
  {
    entry: {
      index: PATHS.ssrDemo,
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
      libraryTarget: 'umd',
    },
  },
  parts.loadJavaScript({ include: PATHS.ssrDemo }),
]);
```

package.json
```json
"scripts": {
  "build:ssr": "webpack --config webpack.ssr.js"
}
```

If you run `npm run build:ssr` you'll notice the new file `static/index.js`.

### Setting up a server

```
$ npm i express --save
$ touch server.js
```

server.js
```javascript
const express = require('express');
const { renderToString } = require('react-dom/server');
const SSR = require('./static');

server(process.env.PORT || 8080);

function server(port) {
  const app = express();

  app.use(express.static('static'));
  app.get('/', (req, res) =>
    res.status(200).send(renderMarkup(renderToString(SSR))));
  app.listen(port);
}

function renderMarkup(html) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Webpack SSR Demo</title>
      <meta charset="utf=8" />
    </head>
    <body>
      <div id="app">${html}</div>
      <script src="./index.js"></script>
    </body>
  </html>`;
}
```

When you run `node server.js` you should see our hello world at http://localhost:8080.

At this point, every time you change the code, you need to re-run webpack to update what's shown in localhost.

### Watching SSR changes and refreshing the browser

Forcing webpack to run in watch mode:
```
$ npm run build:ssr -- --watch
```

How to make the server aware of changes and how to communicate the changes to the browser?

```
$ npm i browser-refresh --save-dev
```

Some updates on server.js are necessary:

server.js
```javascript
const express = require('express');
const { renderToString } = require('react-dom/server');
const SSR = require('./static');

server(process.env.PORT || 8080);

function server(port) {
  const app = express();

  app.use(express.static('static'));
  app.get('/', (req, res) =>
    res.status(200).send(renderMarkup(renderToString(SSR))));
  app.listen(port, () => process.send && process.send("online"));
}

function renderMarkup(html) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Webpack SSR Demo</title>
      <meta charset="utf=8" />
    </head>
    <body>
      <div id="app">${html}</div>
      <script src="${process.env.BROWSER_REFRESH_URL}"></script>
    </body>
  </html>`;
}
```

Now run the 2 commands in different terminals:
```
$ node_modules/.bin/browser-refresh ./server.js
$ npm run build:ssr -- --watch
```

To solve some problems, use:

* isomorphic-webpack
* Next.js
