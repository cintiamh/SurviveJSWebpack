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

### Webpack `watch` mode and `webpack-dev-server`

Watch mode:
```
$ webpack --watch
```

`webpack-dev-server` (WDS) is built on top of `watch` mode and it even goes further.

WDS is a development server running **in-memory**.

WDS refreshes content automatically in the browser while you develop your application.

WDS supports **Hot Module Replacement** (HMR). HMR allows patching the browser state without a full refresh, keeping the current state (in React).

### Emitting files from WDS

Sometimes it is good to emit files to the file system. Specially when you are integrating with another server that expects to find files.

### Getting started with WDS

```
$ npm i webpack-dev-server --save-dev
```

### Attaching WDS to the project

Update package.json
```
"scripts": {
  "start": "webpack-dev-server --env development",
  "build": "webpack --env production"
},
```

Now you should be able to run
```
$ npm run start
```

And see `http://localhost:8080/`.

### Verifying that `--env` works

Update webpack.config.js:
```javascript
// ...

const commonConfig = {
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

module.exports = (env) => {
  console.log('env', env);
  return commonConfig;
}
```

### Configuring WDS through webpack configuration

To customize WDS functionality define a `devServer` field at webpack configuration.

webpack.config.js
```javascript
const productionConfig = () => commonConfig;

const developmentConfig = () => {
  const config = {
    devServer: {
      historyApiFallback: true,
      // output errors only
      stats: 'errors-only',
      host: process.env.HOST, // defaults to localhost
      port: process.env.PORT, // defaults to 8080
    },
  };
  return Object.assign(
    {},
    commonConfig,
    config
  );
};

module.exports = (env) => {
  if (env === 'production') {
    return productionConfig();
  }
  return developmentConfig();
}
```

### Enabling Hot Module Replacement

**Read from Appendices later**

### Accessing the development server from network

Find your ip:
```
$ ifconfig | grep inet
```

### Alternate ways to use webpack-dev-server

* https://webpack.js.org/guides/development/#using-webpack-dev-middleware
* https://www.npmjs.com/package/webpack-hot-middleware

### Other features of webpack-dev-server

https://webpack.js.org/configuration/dev-server/

## Linting JavaScript

### Brief introduction to ESLint

* JSLint - Douglas Crockford - very opiniated
* JSHint: allowed more customization
* ESLint: newest

#### Eslint is customizable

* works with JSX
* Babel specific parser
* rules are documented and you can customize severity

#### eslint-config-airbnb

eslint-config-airbnb is a popular preset.

#### eslint-config-cleanjs

eslint-config-cleanjs use ESLint to restrict JavaScript to a purely functional subset.

### Linting is about more than catching issues

Linting does NOT replace proper testing, but it can complement testing approaches.

### Setting up ESLint

#### autofixing

It allows you to perform certain rule fixes automatically. Use `--fix` flag to activate it.

You can do something similar iwth `js-beautify`.

#### Connecting ESLint with package.json

```
$ npm i eslint --save-dev
$ ./node_modules/.bin/eslint --init
```

This process should install any dependency and create a `.eslintrc.js` file with the rules you chose.

#### Connecting ESLint with webpack

```
$ npm i eslint-loader --save-dev
```

webpack.config.js:
```javascript
const developmentConfig = () => {
  const config = {
    // ...
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          loader: 'eslint-loader',
          options: {
            emitWarning: true
          }
        }
      ]
    }
  };
  // ...
};
```

#### Enabling Error overlay

## Composing Configuration
