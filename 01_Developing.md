# Developing

* [Getting Started](#getting-started)
* [Automatic Browser Refresh](#automatic-browser-refresh)
* [Linting JavaScript](#linting-javascript)
* [Composing Configuration](#composing-configuration)

## Getting Started

### What is Webpack?

Entries themselves are **modules** and can point to other modules through **imports**.

When you bundle a project through webpack, it traverses through imports, constructing a **dependency graph** of the project and then generating the **output** based on the configuration.

It's possible to define **split points** generating separate bundles within the project code itself.

**Hot Module Replacement** (HMR) helped to popularize webpack.

Webpack can generate **hashes** for filenames.

### Setting up the project

Make sure you have a recent version of Node.

Create a project and a `package.json` file.

```
$ mkdir webpack-demo
$ cd webpack-demo
$ npm init -y
```

### Installing webpack

```
$ npm i webpack --save-dev
```

### Executing webpack

```
$ node_modules/.bin/webpack
```

At this point there is no configuration file.

### Directory structure

* app/
    * index.js
    * component.js
* build/
* package.json
* webpack.config.js

### Setting up assets

```
$ mkdir app
$ touch app/component.js
$ touch app/index.js
```

app/component.js
```javascript
export default (text = 'Hello world') => {
  const element = document.createElement('div');
  element.innerHTML = text;
  return element;
};
```

app/index.js
```javascript
import component from './component';

document.body.appendChild(component());
```

### Setting up webpack configuration

The `HtmlWebpackPlugin` generates an `index.html` for the application and adds a `script` tag to load the generated bundle.

```
$ touch webpack.config.js
$ npm i html-webpack-plugin --save-dev
```

webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

module.exports = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo',
    }),
  ],
};
```

If you run:
```
$ node_modules/.bin/webpack
```

You should have new files inside `build` folder.

### Adding a build shortcut

package.json
```
"scripts": {
  "build": "webpack"
},
```

Now you can run:
```
$ npm run build
```

## Automatic Browser Refresh

## Linting JavaScript

## Composing Configuration
