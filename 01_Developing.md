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

## Automatic Browser Refresh

## Linting JavaScript

## Composing Configuration
