# Output

* [Build Targets](#build-targets)
* [Bundling Libraries](#bundling-libraries)
* [Library Output](#library-output)
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

## Bundling Libraries

## Library Output

## Multiple Pages

## Server Side Rendering
