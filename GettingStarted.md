# Getting Started

Simpler notes and straight commands / scripts.

Original configuration on GitHub: https://github.com/survivejs-demos/webpack-demo

* [Setting up the project](#setting-up-the-project)
* [Installing webpack](#installing-webpack)
* [Directory structure](#directory-structure)
* [Adding shortcuts](#adding-shortcuts)
* [Configuring WDS](#configuring-wds)
* [Composing configuration](#composing-configuration)

## Setting up the project

```
$ mkdir webpack-demo
$ cd webpack-demo
$ npm init -y
$ touch .gitignore
```

.gitignore
```
.DS_Store
.idea
*.iml
node_modules/
build/
.eslintcache
dist*
```

## Installing webpack

```
$ npm i webpack -D
$ npm i html-webpack-plugin -D
$ npm i webpack-dev-server -D
```

## Directory structure

* src/
  - component.js
  - index.js
* build/
* package.json
* webpack.config.js

Creating the file structure:
```
$ mkdir src
$ mkdir build
$ touch src/index.js
$ touch src/component.js
$ touch webpack.config.js
```

At a minimum, webpack needs `entry` and `output` fields in config.

## Adding shortcuts

package.json
```javascript
"scripts": {
  "start": "webpack-dev-server --env development",
  "build": "webpack --env production"
}
```

Now you can run:
```
$ npm build
$ npm start
```

## Configuring WDS

webpack.config.js
```javascript
// ...
module.exports = {
  // ...
  devServer: {
    // Display only errors to reduce the amount of output.
    stats: "errors-only",

    // Parse host and port from env to allow customization.
    //
    // If you use Docker, Vagrant or Cloud9, set
    // host: options.host || "0.0.0.0";
    //
    // 0.0.0.0 is available to all network devices
    // unlike default `localhost`.
    host: process.env.HOST, // Defaults to `localhost`
    port: process.env.PORT, // Defaults to 8080
    // overlay: true is equivalent
    overlay: {
      errors: true,
      warinings: true,
    },
  },
};
```

After this change, you can run:
```
$ PORT=3000 npm start
```

If you access the server through http://localhost:8080/webpack-dev-server/, WDS provides status information at the top.

Find your machine's ip:
```
$ ifconfig | grep inet
```

## Composing configuration

`webpack-merge` concatenates arrays and merge objects allowing composition.

```
$ npm i webpack-merge -D
$ touch webpack.parts.js
```
